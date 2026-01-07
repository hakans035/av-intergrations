/**
 * SEO Engine Test Script
 *
 * Creates three complete blog posts with AI-generated content and images,
 * then publishes them to Webflow CMS.
 *
 * Usage:
 *   npx tsx scripts/test-seo-engine.ts
 *
 * Environment variables required:
 *   - WEBFLOW_API_TOKEN
 *   - WEBFLOW_SITE_ID
 *   - WEBFLOW_COLLECTION_ID
 *   - GEMINI_API_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv';
import path from 'path';

// Load .env.local from project root
config({ path: path.resolve(process.cwd(), '.env.local') });

import {
  createWebflowClient,
  createImageGeneratorWithWebflow,
  ContentGeneratorService,
  type ImageCategory,
  type Language,
} from '../src/integrations/seo-engine';

// =============================================================================
// Configuration
// =============================================================================

const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN!;
const WEBFLOW_SITE_ID = process.env.WEBFLOW_SITE_ID!;
const WEBFLOW_COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Test blog posts to create (single post for faster testing)
const TEST_POSTS = [
  {
    topic: 'Belastingaangifte 2025: Wat je moet weten',
    slug: 'belastingaangifte-2025-tips',
    keyword: 'belastingaangifte 2025',
    language: 'nl' as Language,
  },
];

// =============================================================================
// Helpers
// =============================================================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
  };
  console.log(`${prefix[type]} ${message}`);
}

function validateEnv() {
  const required = [
    'WEBFLOW_API_TOKEN',
    'WEBFLOW_SITE_ID',
    'WEBFLOW_COLLECTION_ID',
    'GEMINI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    log(`Missing environment variables: ${missing.join(', ')}`, 'error');
    process.exit(1);
  }
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// Gemini Content Generation
// =============================================================================

async function generateContentWithGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 16384,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('No content in Gemini response');
  }

  return content;
}

// =============================================================================
// Main Test Flow
// =============================================================================

async function createBlogPost(
  postConfig: (typeof TEST_POSTS)[0],
  webflowClient: ReturnType<typeof createWebflowClient>,
  imageGenerator: ReturnType<typeof createImageGeneratorWithWebflow>,
  contentGenerator: ContentGeneratorService,
  index: number
) {
  const { topic, slug, keyword, language } = postConfig;

  log(`\n${'='.repeat(60)}`);
  log(`Creating blog post ${index + 1}/${TEST_POSTS.length}: "${topic}"`);
  log(`${'='.repeat(60)}\n`);

  // Step 1: Generate hero image
  log(`Generating hero image for "${topic}"...`);
  let heroImageUrl = '';
  let heroAltText = '';

  try {
    const heroResult = await imageGenerator.generateAndUpload(
      {
        topic,
        category: 'hero' as ImageCategory,
        postSlug: slug,
        language,
      },
      WEBFLOW_SITE_ID
    );

    if (heroResult.success && heroResult.image) {
      heroImageUrl = heroResult.image.webflowUrl || heroResult.image.url;
      heroAltText = heroResult.image.altText;
      log(`Hero image generated: ${heroImageUrl.substring(0, 80)}...`, 'success');
    } else {
      log(`Hero image generation failed: ${heroResult.error}`, 'warn');
    }
  } catch (error) {
    log(`Hero image error: ${error instanceof Error ? error.message : String(error)}`, 'warn');
  }

  // Rate limit delay
  await delay(3000);

  // Step 2: Generate thumbnail image
  log(`Generating thumbnail image for "${topic}"...`);
  let thumbnailImageUrl = '';
  let thumbnailAltText = '';

  try {
    const thumbnailResult = await imageGenerator.generateAndUpload(
      {
        topic,
        category: 'thumbnail' as ImageCategory,
        postSlug: slug,
        language,
      },
      WEBFLOW_SITE_ID
    );

    if (thumbnailResult.success && thumbnailResult.image) {
      thumbnailImageUrl = thumbnailResult.image.webflowUrl || thumbnailResult.image.url;
      thumbnailAltText = thumbnailResult.image.altText;
      log(`Thumbnail image generated: ${thumbnailImageUrl.substring(0, 80)}...`, 'success');
    } else {
      log(`Thumbnail image generation failed: ${thumbnailResult.error}`, 'warn');
    }
  } catch (error) {
    log(`Thumbnail image error: ${error instanceof Error ? error.message : String(error)}`, 'warn');
  }

  // Rate limit delay
  await delay(3000);

  // Step 3: Generate content using Gemini
  log(`Generating content for "${topic}"...`);

  const contentPrompt = contentGenerator.buildContentPrompt({
    keyword,
    keywordId: `test-${Date.now()}`,
    language,
    contentType: 'long',
  });

  let generatedContent = '';
  let metaDescription = '';
  let title = topic;

  try {
    const rawContent = await generateContentWithGemini(
      contentPrompt.systemPrompt,
      contentPrompt.userPrompt
    );

    // Debug: Check if raw content has lists
    const hasUl = rawContent.includes('<ul>');
    const hasOl = rawContent.includes('<ol>');
    const hasLi = rawContent.includes('<li>');
    log(`Raw content lists: ul=${hasUl}, ol=${hasOl}, li=${hasLi}`);

    // Process the generated content
    const processedContent = await contentGenerator.processGeneratedContent(rawContent, {
      keyword,
      keywordId: `test-${Date.now()}`,
      language,
      contentType: 'long',
    });

    // Debug: Check if processed content has lists
    const processedHasUl = processedContent.body.includes('<ul>');
    const processedHasOl = processedContent.body.includes('<ol>');
    const processedHasLi = processedContent.body.includes('<li>');
    log(`Processed content lists: ul=${processedHasUl}, ol=${processedHasOl}, li=${processedHasLi}`);

    title = processedContent.title || topic;
    generatedContent = processedContent.body;
    metaDescription = processedContent.metaDescription;

    // Debug: Check final content being sent
    const finalHasLi = generatedContent.includes('<li>');
    log(`Final content to send: li=${finalHasLi}, length=${generatedContent.length}`);

    log(`Content generated: ${generatedContent.length} characters`, 'success');
  } catch (error) {
    log(`Content generation error: ${error instanceof Error ? error.message : String(error)}`, 'warn');
    // Use fallback content
    generatedContent = `<h2>${topic}</h2><p>Dit is een placeholder artikel over ${keyword}. De content wordt later aangevuld.</p>`;
    metaDescription = `Lees alles over ${keyword} bij AmbitionValley.`;
  }

  // Rate limit delay
  await delay(2000);

  // Step 4: Create Webflow CMS item
  log(`Publishing to Webflow CMS...`);

  try {
    const uniqueSlug = `${slug}-${Date.now()}`;
    const now = new Date();

    // Build field data with correct Webflow schema field names
    const fieldData: Record<string, unknown> = {
      // Required fields
      name: title,
      slug: uniqueSlug,
      language: language === 'nl' ? 'Dutch' : 'English',
      'content-status': 'Draft',

      // Content fields
      'rich-text': generatedContent,
      'post-summary': metaDescription || `Lees alles over ${keyword}`,

      // SEO fields
      'meta-title': `${title} | AmbitionValley`,
      'meta-description': metaDescription || `Lees alles over ${keyword}`,
      'source-keyword': keyword,
      'canonical-url': `https://ambitionvalley.nl/blog/${uniqueSlug}`,
      'schema-type': 'Article', // Options: Article, FAQPage, Article+FAQ

      // Image alt texts
      'alt-text': heroAltText || `${title} - hero afbeelding`,
      'thumbnail-alt-text': thumbnailAltText || `${title} - thumbnail`,

      // Author info
      'author-name': 'AmbitionValley',

      // Tracking fields
      'generation-timestamp': now.toISOString(),
      featured: false,
    };

    // Only add image URLs if they exist and are valid Webflow URLs
    if (heroImageUrl && heroImageUrl.startsWith('http')) {
      fieldData['main-image-2'] = { url: heroImageUrl };
    }
    if (thumbnailImageUrl && thumbnailImageUrl.startsWith('http')) {
      fieldData['thumbnail-image'] = { url: thumbnailImageUrl };
    }

    const [cmsItem] = await webflowClient.createItems(
      [
        {
          fieldData,
          isDraft: true,
          isArchived: false,
        },
      ],
      WEBFLOW_COLLECTION_ID
    );

    log(`Blog post created in Webflow!`, 'success');
    log(`  - ID: ${cmsItem.id}`);
    log(`  - Title: ${title}`);
    log(`  - Slug: ${uniqueSlug}`);

    return {
      success: true,
      id: cmsItem.id,
      title,
      slug: uniqueSlug,
    };
  } catch (error) {
    log(`Webflow publish error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log('\n');
  log('='.repeat(60));
  log(`  SEO Engine Test - Create ${TEST_POSTS.length} Blog Post(s)`);
  log('='.repeat(60));
  console.log('\n');

  // Validate environment
  validateEnv();
  log('Environment variables validated', 'success');

  // Initialize clients
  log('Initializing clients...');

  const webflowClient = createWebflowClient({
    apiToken: WEBFLOW_API_TOKEN,
    siteId: WEBFLOW_SITE_ID,
    collectionId: WEBFLOW_COLLECTION_ID,
  });

  const imageGenerator = createImageGeneratorWithWebflow(GEMINI_API_KEY, webflowClient);

  const contentGenerator = new ContentGeneratorService(SUPABASE_URL, SUPABASE_KEY);

  log('Clients initialized', 'success');

  // Test Webflow connection
  log('Testing Webflow connection...');
  try {
    const collection = await webflowClient.getCollection(WEBFLOW_COLLECTION_ID);
    log(`Connected to Webflow. Collection: "${collection.displayName}"`, 'success');
  } catch (error) {
    log(`Webflow connection failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }

  // Create blog posts
  const results: Array<{
    topic: string;
    success: boolean;
    id?: string;
    error?: string;
  }> = [];

  for (let i = 0; i < TEST_POSTS.length; i++) {
    const post = TEST_POSTS[i];

    try {
      const result = await createBlogPost(
        post,
        webflowClient,
        imageGenerator,
        contentGenerator,
        i
      );

      results.push({
        topic: post.topic,
        success: result.success,
        id: result.id,
        error: 'error' in result ? result.error : undefined,
      });
    } catch (error) {
      results.push({
        topic: post.topic,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Delay between posts to respect rate limits
    if (i < TEST_POSTS.length - 1) {
      log('\nWaiting 5 seconds before next post...');
      await delay(5000);
    }
  }

  // Summary
  console.log('\n');
  log('='.repeat(60));
  log('  Test Results Summary');
  log('='.repeat(60));
  console.log('\n');

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  results.forEach((result, index) => {
    const status = result.success ? '\x1b[32m[OK]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
    console.log(`  ${index + 1}. ${status} ${result.topic}`);
    if (result.id) console.log(`     ID: ${result.id}`);
    if (result.error) console.log(`     Error: ${result.error}`);
  });

  console.log('\n');
  log(`Total: ${successful.length}/${results.length} posts created successfully`);

  if (failed.length > 0) {
    log(`${failed.length} posts failed`, 'warn');
  }

  console.log('\n');
  log('Test complete! Check your Webflow CMS for the new draft posts.');
  log('Remember to review and publish them manually.\n');
}

// Run
main().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
