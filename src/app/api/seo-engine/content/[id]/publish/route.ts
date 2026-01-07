/**
 * POST /api/seo-engine/content/[id]/publish
 * Publish content to Webflow
 */

import {
  validateAdminToken,
  unauthorizedResponse,
  successResponse,
  serverErrorResponse,
  errorResponse,
  createRequestLogger,
} from '../../../_shared/utils';
import { createWebflowClient } from '@/integrations/seo-engine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logger = createRequestLogger('content_publish');
  logger.log('Publish content', { id });

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  try {
    const apiToken = process.env.WEBFLOW_API_TOKEN;
    const siteId = process.env.WEBFLOW_SITE_ID;
    const collectionId = process.env.WEBFLOW_COLLECTION_ID;

    if (!apiToken || !siteId || !collectionId) {
      logger.error('Missing Webflow environment variables');
      return serverErrorResponse('Webflow configuration missing');
    }

    const client = createWebflowClient({
      apiToken,
      siteId,
      collectionId,
    });

    // Get the item first to verify it exists
    const item = await client.getItem(id);
    if (!item) {
      logger.warn('Item not found', { id });
      return errorResponse('NOT_FOUND', 'Post not found', 404);
    }

    // Check if already published
    if (!item.isDraft) {
      logger.warn('Item already published', { id });
      return errorResponse('ALREADY_PUBLISHED', 'Post is already published', 400);
    }

    // Publish the item using Webflow API
    await client.publishItems([id]);

    const publishedAt = new Date().toISOString();
    logger.log('Content published successfully');
    logger.done('SUCCESS');

    return successResponse({
      status: 'published',
      publishedAt,
      itemId: id,
    });
  } catch (error) {
    logger.error('Publishing failed', error);
    logger.done('ERROR');
    return serverErrorResponse('Failed to publish content');
  }
}
