/**
 * GET /api/seo-engine/content/drafts
 * List content drafts
 */

import {
  validateAdminToken,
  unauthorizedResponse,
  successResponse,
  serverErrorResponse,
  parseQueryParams,
  createRequestLogger,
} from '../../_shared/utils';
import type { ContentDraft, Language } from '@/integrations/seo-engine';

// Mock data store - in production, use database
const mockDrafts: ContentDraft[] = [];

export async function GET(request: Request) {
  const logger = createRequestLogger('drafts_list');
  logger.log('List content drafts');

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  try {
    const { page, limit, offset, params } = parseQueryParams(request.url);

    // Parse filters
    const language = params.get('language') as Language | null;
    const status = params.get('status');
    const contentType = params.get('contentType');

    logger.log('Query params', { page, limit, language, status, contentType });

    // Filter drafts
    let filtered = [...mockDrafts];

    if (language) {
      filtered = filtered.filter((d) => d.language === language);
    }
    if (status) {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (contentType) {
      filtered = filtered.filter((d) => d.contentType === contentType);
    }

    // Sort by createdAt descending
    filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const total = filtered.length;
    const drafts = filtered.slice(offset, offset + limit);

    logger.log('Returning drafts', { total, returned: drafts.length });
    logger.done('SUCCESS');

    return successResponse(
      { drafts },
      200,
      {
        total,
        page,
        limit,
        hasMore: offset + limit < total,
      }
    );
  } catch (error) {
    logger.error('Failed to get drafts', error);
    logger.done('ERROR');
    return serverErrorResponse('Failed to retrieve drafts');
  }
}
