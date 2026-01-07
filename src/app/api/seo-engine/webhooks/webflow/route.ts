/**
 * POST /api/seo-engine/webhooks/webflow
 * Handle Webflow webhooks
 */

import crypto from 'crypto';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  createRequestLogger,
} from '../../_shared/utils';

// Webflow webhook event types
type WebflowEvent =
  | 'collection_item_created'
  | 'collection_item_changed'
  | 'collection_item_deleted'
  | 'collection_item_unpublished'
  | 'site_publish';

interface WebflowWebhookPayload {
  _id: string;
  triggerType: WebflowEvent;
  createdAt: string;
  site?: {
    _id: string;
    name: string;
  };
  item?: {
    _id: string;
    name: string;
    slug: string;
    _archived: boolean;
    _draft: boolean;
  };
}

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: Request) {
  const logger = createRequestLogger('webhook_webflow');
  logger.log('Webflow webhook received');

  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-webflow-signature');
    const webhookSecret = process.env.WEBFLOW_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret) {
      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        logger.warn('Invalid webhook signature');
        return errorResponse('INVALID_SIGNATURE', 'Invalid webhook signature', 401);
      }
      logger.log('Webhook signature verified');
    }

    // Parse payload
    let payload: WebflowWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      logger.warn('Invalid JSON payload');
      return errorResponse('INVALID_PAYLOAD', 'Invalid JSON payload', 400);
    }

    const { triggerType, item, site } = payload;
    logger.log('Processing webhook', { triggerType, itemId: item?._id, siteId: site?._id });

    // Handle different event types
    switch (triggerType) {
      case 'collection_item_created':
        logger.log('Item created', { itemId: item?._id, name: item?.name });
        // Sync new item to local database
        break;

      case 'collection_item_changed':
        logger.log('Item changed', { itemId: item?._id, name: item?.name });
        // Update local cache
        break;

      case 'collection_item_deleted':
        logger.log('Item deleted', { itemId: item?._id });
        // Remove from local database
        break;

      case 'collection_item_unpublished':
        logger.log('Item unpublished', { itemId: item?._id });
        // Update status in local database
        break;

      case 'site_publish':
        logger.log('Site published', { siteId: site?._id });
        // Trigger cache invalidation or sync
        break;

      default:
        logger.log('Unknown event type', { triggerType });
    }

    logger.done('SUCCESS');

    return successResponse({
      received: true,
      eventType: triggerType,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Webhook processing failed', error);
    logger.done('ERROR');
    return serverErrorResponse('Webhook processing failed');
  }
}
