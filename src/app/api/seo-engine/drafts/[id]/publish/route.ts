/**
 * POST /api/seo-engine/drafts/[id]/publish
 * Publish a draft to Webflow
 */

import { createServiceClient } from '@/lib/supabase/server';
import { createWebflowClient } from '@/integrations/seo-engine';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ContentDraft {
  id: string
  keyword: string
  title: string
  slug: string
  body: string
  summary: string | null
  meta_title: string | null
  meta_description: string | null
  status: string
  language: string
  webflow_item_id: string | null
  hero_image_url: string | null
  hero_image_asset_id: string | null
  thumbnail_image_url: string | null
  thumbnail_image_asset_id: string | null
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate admin token
  const authHeader = request.headers.get('authorization');
  const isValidAdmin = authHeader === `Bearer ${process.env.ADMIN_API_TOKEN}`;

  if (!isValidAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    // Get the draft
    const { data: draft, error: draftError } = await supabase
      .from('seo_content_drafts' as any)
      .select('*')
      .eq('id', id)
      .single();

    if (draftError || !draft) {
      return Response.json({ error: 'Draft not found' }, { status: 404 });
    }

    const draftData = draft as unknown as ContentDraft;

    // Check if already published
    if (draftData.status === 'published' && draftData.webflow_item_id) {
      return Response.json({
        error: 'Draft is already published',
        webflow_item_id: draftData.webflow_item_id
      }, { status: 400 });
    }

    // Create Webflow client
    const webflowClient = createWebflowClient({
      apiToken: process.env.WEBFLOW_API_TOKEN!,
      siteId: process.env.WEBFLOW_SITE_ID!,
      collectionId: process.env.WEBFLOW_COLLECTION_ID!,
    });

    // Build field data with images if available
    const fieldData: Record<string, unknown> = {
      name: draftData.title,
      slug: draftData.slug,
      'post-summary': draftData.summary || '',
      'rich-text': draftData.body,
      'meta-title': draftData.meta_title || draftData.title,
      'meta-description': draftData.meta_description || '',
      'source-keyword': draftData.keyword,
      language: draftData.language === 'nl' ? 'Dutch' : 'English',
      'content-status': 'Published',
    };

    // Add hero image if available
    if (draftData.hero_image_asset_id && draftData.hero_image_url) {
      fieldData['main-image-2'] = {
        fileId: draftData.hero_image_asset_id,
        url: draftData.hero_image_url,
        alt: `Illustratie bij ${draftData.title}`,
      };
    }

    // Add thumbnail image if available
    if (draftData.thumbnail_image_asset_id && draftData.thumbnail_image_url) {
      fieldData['thumbnail-image'] = {
        fileId: draftData.thumbnail_image_asset_id,
        url: draftData.thumbnail_image_url,
        alt: `Thumbnail ${draftData.title}`,
      };
    }

    // Publish to Webflow
    const [item] = await webflowClient.createItems([{
      fieldData,
      isDraft: false, // Publish immediately
    }]);

    // Update draft status in Supabase
    await supabase
      .from('seo_content_drafts' as any)
      .update({
        status: 'published',
        webflow_item_id: item.id,
        published_at: new Date().toISOString(),
      })
      .eq('id', id);

    return Response.json({
      success: true,
      webflow_item_id: item.id,
      message: 'Successfully published to Webflow',
    });
  } catch (error) {
    console.error('Failed to publish to Webflow:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to publish' },
      { status: 500 }
    );
  }
}
