/**
 * GET /api/seo-engine/keywords/queue
 * List queued keywords from database
 */

import { createServiceClient } from '@/lib/supabase/server';
import {
  validateAdminToken,
  unauthorizedResponse,
  successResponse,
  serverErrorResponse,
  parseQueryParams,
  createRequestLogger,
} from '../../_shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    const status = params.get('status');

    logger.log('Query params', { page, limit, status });

    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from('seo_keyword_queue' as any)
      .select('*', { count: 'exact' });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Order by priority and created_at
    query = query
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: keywords, count, error } = await query;

    if (error) {
      logger.error('Database error', error);
      throw error;
    }

    const total = count || 0;

    logger.log('Returning keywords', { total, returned: keywords?.length || 0 });
    logger.done('SUCCESS');

    return successResponse(
      { keywords: keywords || [] },
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
