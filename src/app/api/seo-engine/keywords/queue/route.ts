/**
 * GET /api/seo-engine/keywords/queue
 * List queued keywords
 */

import {
  validateAdminToken,
  unauthorizedResponse,
  successResponse,
  serverErrorResponse,
  parseQueryParams,
  createRequestLogger,
} from '../../_shared/utils';
import type { Keyword, Language, KeywordStatus, KeywordIntent } from '@/integrations/seo-engine';

// Mock data store - in production, use database
const mockKeywords: Keyword[] = [];

export async function GET(request: Request) {
  const logger = createRequestLogger('kw_queue');
  logger.log('Get keyword queue');

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  try {
    const { page, limit, offset, params } = parseQueryParams(request.url);

    // Parse filters
    const language = params.get('language') as Language | null;
    const status = params.get('status') as KeywordStatus | null;
    const intent = params.get('intent') as KeywordIntent | null;

    logger.log('Query params', { page, limit, language, status, intent });

    // Filter keywords
    let filtered = [...mockKeywords];

    if (language) {
      filtered = filtered.filter((k) => k.language === language);
    }
    if (status) {
      filtered = filtered.filter((k) => k.status === status);
    }
    if (intent) {
      filtered = filtered.filter((k) => k.intent === intent);
    }

    // Sort by volume descending
    filtered.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));

    // Paginate
    const total = filtered.length;
    const keywords = filtered.slice(offset, offset + limit);

    logger.log('Returning keywords', { total, returned: keywords.length });
    logger.done('SUCCESS');

    return successResponse(
      { keywords },
      200,
      {
        total,
        page,
        limit,
        hasMore: offset + limit < total,
      }
    );
  } catch (error) {
    logger.error('Failed to get keywords', error);
    logger.done('ERROR');
    return serverErrorResponse('Failed to retrieve keywords');
  }
}
