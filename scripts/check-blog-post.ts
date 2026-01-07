/**
 * Check Blog Post Script
 *
 * Fetches a blog post by slug and displays all field values to identify missing content.
 *
 * Usage:
 *   npx tsx scripts/check-blog-post.ts <slug>
 *
 * Example:
 *   npx tsx scripts/check-blog-post.ts belastingaangifte-2025-tips-1767298851493
 */

import { config } from 'dotenv';
import path from 'path';

// Load .env.local from project root
config({ path: path.resolve(process.cwd(), '.env.local') });

import { createWebflowClient } from '../src/integrations/seo-engine';

// =============================================================================
// Configuration
// =============================================================================

const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN!;
const WEBFLOW_SITE_ID = process.env.WEBFLOW_SITE_ID!;
const WEBFLOW_COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID!;

// Get slug from command line arguments
const slug = process.argv[2];

// =============================================================================
// Helpers
// =============================================================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' | 'header' = 'info') {
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    success: '\x1b[32m[OK]\x1b[0m',
    error: '\x1b[31m[MISSING]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    header: '\x1b[35m[FIELD]\x1b[0m',
  };
  console.log(`${prefix[type]} ${message}`);
}

function truncate(str: string, maxLength: number = 100): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '\x1b[31m<empty>\x1b[0m';
  }
  if (typeof value === 'string') {
    if (value.trim() === '') {
      return '\x1b[31m<empty string>\x1b[0m';
    }
    // Check if it's HTML content
    if (value.includes('<') && value.includes('>')) {
      const textContent = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
      return `\x1b[32m[HTML: ${value.length} chars, ~${wordCount} words]\x1b[0m ${truncate(textContent, 80)}`;
    }
    return truncate(value, 100);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  if (!slug) {
    console.log('\nUsage: npx tsx scripts/check-blog-post.ts <slug>\n');
    console.log('Example: npx tsx scripts/check-blog-post.ts belastingaangifte-2025-tips-1767298851493\n');
    process.exit(1);
  }

  console.log('\n');
  log('='.repeat(70));
  log(`  Checking Blog Post: ${slug}`);
  log('='.repeat(70));
  console.log('\n');

  // Initialize client
  const webflowClient = createWebflowClient({
    apiToken: WEBFLOW_API_TOKEN,
    siteId: WEBFLOW_SITE_ID,
    collectionId: WEBFLOW_COLLECTION_ID,
  });

  // Fetch all items and find by slug
  log('Fetching blog posts from Webflow...');

  let foundPost: Record<string, unknown> | null = null;
  let offset = 0;
  const limit = 100;

  while (!foundPost) {
    const response = await webflowClient.listItems({ limit, offset });

    for (const item of response.items) {
      const fieldData = item.fieldData as Record<string, unknown>;
      if (fieldData.slug === slug) {
        foundPost = {
          id: item.id,
          isDraft: item.isDraft,
          isArchived: item.isArchived,
          createdOn: item.createdOn,
          lastUpdated: item.lastUpdated,
          ...fieldData,
        };
        break;
      }
    }

    if (response.items.length < limit) {
      break; // No more items
    }
    offset += limit;
  }

  if (!foundPost) {
    log(`Blog post with slug "${slug}" not found!`, 'error');
    process.exit(1);
  }

  log(`Found blog post!`, 'success');
  console.log('\n');

  // Display all fields
  log('='.repeat(70));
  log('  Field Values');
  log('='.repeat(70));
  console.log('\n');

  // Important fields to check first
  const importantFields = [
    'name',
    'slug',
    'language',
    'content-status',
    'rich-text',
    'post-summary',
    'meta-title',
    'meta-description',
    'source-keyword',
    'main-image-2',
    'thumbnail-image',
    'alt-text',
    'thumbnail-alt-text',
  ];

  const missingFields: string[] = [];
  const emptyFields: string[] = [];

  // Check important fields first
  console.log('\x1b[1m--- Important Fields ---\x1b[0m\n');

  for (const field of importantFields) {
    const value = foundPost[field];
    const isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

    if (isEmpty) {
      if (value === null || value === undefined) {
        missingFields.push(field);
      } else {
        emptyFields.push(field);
      }
      log(`${field}: ${formatValue(value)}`, 'error');
    } else {
      log(`${field}: ${formatValue(value)}`, 'success');
    }
  }

  // Check remaining fields
  console.log('\n\x1b[1m--- Other Fields ---\x1b[0m\n');

  for (const [field, value] of Object.entries(foundPost)) {
    if (!importantFields.includes(field)) {
      const isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

      if (isEmpty) {
        if (value === null || value === undefined) {
          missingFields.push(field);
        } else {
          emptyFields.push(field);
        }
        log(`${field}: ${formatValue(value)}`, 'warn');
      } else {
        log(`${field}: ${formatValue(value)}`, 'info');
      }
    }
  }

  // Summary
  console.log('\n');
  log('='.repeat(70));
  log('  Summary');
  log('='.repeat(70));
  console.log('\n');

  const totalFields = Object.keys(foundPost).length;
  const filledFields = totalFields - missingFields.length - emptyFields.length;

  console.log(`  Total fields: ${totalFields}`);
  console.log(`  \x1b[32mFilled fields: ${filledFields}\x1b[0m`);
  console.log(`  \x1b[31mMissing/null fields: ${missingFields.length}\x1b[0m`);
  console.log(`  \x1b[33mEmpty string fields: ${emptyFields.length}\x1b[0m`);

  if (missingFields.length > 0) {
    console.log(`\n  Missing fields: ${missingFields.join(', ')}`);
  }
  if (emptyFields.length > 0) {
    console.log(`  Empty fields: ${emptyFields.join(', ')}`);
  }

  console.log('\n');
}

// Run
main().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
