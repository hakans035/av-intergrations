/**
 * POST /api/seo-engine/cron/generate
 * Daily content generation from keyword queue
 * Saves to Supabase for review, then publish to Webflow after approval
 * Schedule: Daily (05:00 CET)
 */

import { createServiceClient } from '@/lib/supabase/server';
import { ContentGeneratorService, createImageGeneratorWithWebflow, createWebflowClient } from '@/integrations/seo-engine';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/* eslint-disable @typescript-eslint/no-explicit-any */

// Type for keyword queue items
interface KeywordQueueItem {
  id: string;
  keyword: string;
  language: string;
  priority: number;
  status: string;
  scheduled_date: string | null;
  content_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  processed_at: string | null;
  error_message: string | null;
  retry_count: number;
}

interface LogEntry {
  id: string;
  keyword_queue_id: string;
  status: string;
  title: string | null;
  slug: string | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

// Generate content using Gemini API
async function generateContentWithGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

export async function POST(request: Request) {
  const startTime = Date.now();

  // Validate cron secret or admin token
  const cronSecret = request.headers.get('x-vercel-cron-secret');
  const authHeader = request.headers.get('authorization');

  const isValidCron = cronSecret === process.env.CRON_SECRET;
  const isValidAdmin = authHeader === `Bearer ${process.env.ADMIN_API_TOKEN}`;

  if (!isValidCron && !isValidAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const today = new Date().toISOString().split('T')[0];

  // Check if we already generated content today (limit: 1 per day)
  const { count: todayCount } = await supabase
    .from('seo_content_drafts' as any)
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`)
    .lt('created_at', `${today}T23:59:59Z`);

  // Allow admin to bypass daily limit with ?force=true
  const url = new URL(request.url);
  const forceGenerate = url.searchParams.get('force') === 'true';

  if (todayCount && todayCount >= 1 && !forceGenerate) {
    return Response.json({
      success: true,
      message: 'Daily limit reached (1 post per day). Use ?force=true to bypass.',
      generated: false,
      todayCount,
    });
  }

  // Get next pending keyword from queue
  const result = await supabase
    .from('seo_keyword_queue' as any)
    .select('*')
    .eq('status', 'pending')
    .or(`scheduled_date.is.null,scheduled_date.lte.${today}`)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (result.error || !result.data) {
    return Response.json({
      success: true,
      message: 'No keywords pending in queue',
      generated: false,
    });
  }

  const keyword = result.data as unknown as KeywordQueueItem;

  // Mark as in_progress
  await supabase
    .from('seo_keyword_queue' as any)
    .update({ status: 'in_progress' })
    .eq('id', keyword.id);

  // Log start
  const logResult = await supabase
    .from('seo_generation_log' as any)
    .insert({
      keyword_queue_id: keyword.id,
      status: 'started',
    })
    .select()
    .single();

  const logEntry = logResult.data as unknown as LogEntry | null;

  try {
    // Create content generator service for prompt building
    const generator = new ContentGeneratorService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build content prompt
    const contentType = (keyword.content_type || 'long') as 'short' | 'long' | 'mixed';
    const prompt = generator.buildContentPrompt({
      keyword: keyword.keyword,
      keywordId: keyword.id,
      language: keyword.language as 'nl' | 'en',
      contentType,
    });

    // Generate content with Gemini
    const rawContent = await generateContentWithGemini(
      prompt.systemPrompt,
      prompt.userPrompt
    );

    // Process the raw content
    const processedContent = await generator.processGeneratedContent(rawContent, {
      keyword: keyword.keyword,
      keywordId: keyword.id,
      language: keyword.language as 'nl' | 'en',
      contentType,
    });

    // Update log
    if (logEntry) {
      await supabase
        .from('seo_generation_log' as any)
        .update({
          status: 'content_generated',
          title: processedContent.title,
          slug: processedContent.slug,
        })
        .eq('id', logEntry.id);
    }

    // Generate images for the blog post
    let heroImageUrl: string | null = null;
    let heroImageAssetId: string | null = null;
    let thumbnailImageUrl: string | null = null;
    let thumbnailImageAssetId: string | null = null;

    try {
      const webflowClient = createWebflowClient({
        apiToken: process.env.WEBFLOW_API_TOKEN!,
        siteId: process.env.WEBFLOW_SITE_ID!,
        collectionId: process.env.WEBFLOW_COLLECTION_ID!,
      });

      const imageGenerator = createImageGeneratorWithWebflow(
        process.env.GEMINI_API_KEY!,
        webflowClient
      );

      // Generate hero and thumbnail images
      const imageResults = await imageGenerator.generatePostImages(
        keyword.keyword,
        processedContent.slug,
        keyword.language as 'nl' | 'en',
        process.env.WEBFLOW_SITE_ID
      );

      if (imageResults.hero?.success && imageResults.hero.image) {
        heroImageUrl = imageResults.hero.image.webflowUrl;
        heroImageAssetId = imageResults.hero.image.assetId;
      }
      if (imageResults.thumbnail?.success && imageResults.thumbnail.image) {
        thumbnailImageUrl = imageResults.thumbnail.image.webflowUrl;
        thumbnailImageAssetId = imageResults.thumbnail.image.assetId;
      }

      // Update log
      if (logEntry) {
        await supabase
          .from('seo_generation_log' as any)
          .update({ status: 'images_generated' })
          .eq('id', logEntry.id);
      }
    } catch (imageError) {
      console.error('Image generation failed (continuing without images):', imageError);
      // Don't fail the whole process if image generation fails
    }

    // Save to Supabase drafts table (NOT Webflow yet)
    const { data: draft, error: draftError } = await supabase
      .from('seo_content_drafts' as any)
      .insert({
        keyword: keyword.keyword,
        language: keyword.language,
        content_type: contentType,
        title: processedContent.title,
        slug: processedContent.slug,
        body: processedContent.body,
        summary: processedContent.summary,
        meta_title: processedContent.metaTitle,
        meta_description: processedContent.metaDescription,
        schema_type: processedContent.schemaType,
        hero_image_url: heroImageUrl,
        hero_image_asset_id: heroImageAssetId,
        thumbnail_image_url: thumbnailImageUrl,
        thumbnail_image_asset_id: thumbnailImageAssetId,
        status: 'pending_review',
      })
      .select()
      .single();

    if (draftError) {
      throw new Error(`Failed to save draft: ${draftError.message}`);
    }

    const draftId = (draft as any).id;

    // Update log
    if (logEntry) {
      await supabase
        .from('seo_generation_log' as any)
        .update({
          status: 'saved_to_supabase',
        })
        .eq('id', logEntry.id);
    }

    // Update keyword status
    await supabase
      .from('seo_keyword_queue' as any)
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', keyword.id);

    // Send email notification
    const adminEmails = process.env.SEO_ADMIN_EMAILS?.split(',') || [];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://check.ambitionvalley.nl';

    if (adminEmails.length > 0) {
      try {
        await resend.emails.send({
          from: 'SEO Engine <noreply@ambitionvalley.nl>',
          to: adminEmails,
          subject: `Nieuwe blog ter review: ${processedContent.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
                .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 16px; padding: 40px; }
                h1 { color: #ffffff; font-size: 24px; margin-bottom: 24px; }
                .info-box { background: #2a2a2a; border-radius: 12px; padding: 24px; margin: 24px 0; }
                .label { color: #666666; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
                .value { color: #ffffff; font-size: 16px; margin-bottom: 16px; }
                .button { display: inline-block; background: #22c55e; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 24px; }
                .footer { color: #666666; font-size: 12px; margin-top: 32px; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Nieuwe Blog Post</h1>
                <p style="color: #a0a0a0;">Er is een nieuwe blog post gegenereerd die wacht op jouw goedkeuring.</p>

                <div class="info-box">
                  <div class="label">Titel</div>
                  <div class="value">${processedContent.title}</div>

                  <div class="label">Keyword</div>
                  <div class="value">${keyword.keyword}</div>

                  <div class="label">Samenvatting</div>
                  <div class="value">${processedContent.summary.substring(0, 200)}...</div>

                  <div class="label">Gegenereerd op</div>
                  <div class="value">${new Date().toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' })}</div>
                </div>

                <a href="${appUrl}/admin/seo-engine/drafts/${draftId}" class="button">Review & Publiceren</a>

                <p class="footer">Dit is een automatische notificatie van de AmbitionValley SEO Content Engine.</p>
              </div>
            </body>
            </html>
          `,
        });

        // Update log
        if (logEntry) {
          await supabase
            .from('seo_generation_log' as any)
            .update({ status: 'email_sent' })
            .eq('id', logEntry.id);
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the whole process if email fails
      }
    }

    const durationMs = Date.now() - startTime;

    // Update log with completion
    if (logEntry) {
      await supabase
        .from('seo_generation_log' as any)
        .update({
          status: 'completed',
          duration_ms: durationMs,
        })
        .eq('id', logEntry.id);
    }

    return Response.json({
      success: true,
      generated: true,
      draftId,
      title: processedContent.title,
      slug: processedContent.slug,
      keyword: keyword.keyword,
      adminUrl: `${appUrl}/admin/seo-engine/drafts/${draftId}`,
      duration_ms: durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Update keyword status to failed
    await supabase
      .from('seo_keyword_queue' as any)
      .update({
        status: 'failed',
        error_message: errorMessage,
        retry_count: (keyword.retry_count || 0) + 1,
      })
      .eq('id', keyword.id);

    // Update log
    if (logEntry) {
      await supabase
        .from('seo_generation_log' as any)
        .update({
          status: 'failed',
          error_message: errorMessage,
          duration_ms: durationMs,
        })
        .eq('id', logEntry.id);
    }

    // Send error notification
    const adminEmails = process.env.SEO_ADMIN_EMAILS?.split(',') || [];
    if (adminEmails.length > 0) {
      try {
        await resend.emails.send({
          from: 'SEO Engine <noreply@ambitionvalley.nl>',
          to: adminEmails,
          subject: `[FOUT] Blog generatie mislukt: ${keyword.keyword}`,
          text: `De blog generatie voor keyword "${keyword.keyword}" is mislukt.\n\nFoutmelding: ${errorMessage}\n\nRetry count: ${(keyword.retry_count || 0) + 1}`,
        });
      } catch (emailError) {
        console.error('Failed to send error notification:', emailError);
      }
    }

    console.error('Content generation failed:', error);

    return Response.json(
      {
        success: false,
        error: errorMessage,
        keyword: keyword.keyword,
        duration_ms: durationMs,
      },
      { status: 500 }
    );
  }
}
