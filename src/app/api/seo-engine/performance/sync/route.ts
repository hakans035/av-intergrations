/**
 * POST /api/seo-engine/performance/sync
 * Trigger performance data sync from external sources
 */

import { z } from 'zod';
import {
  validateBody,
  validateAdminToken,
  unauthorizedResponse,
  successResponse,
  serverErrorResponse,
  createRequestLogger,
} from '../../_shared/utils';
import {
  createPerformanceMonitoring,
  createMockSearchConsoleSource,
  createMockAnalyticsSource,
} from '@/integrations/seo-engine';

const syncRequestSchema = z.object({
  postIds: z.array(z.string()),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }),
  forceRefresh: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const logger = createRequestLogger('perf_sync');
  logger.log('Performance sync started');

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  // Validate body
  const validation = await validateBody(request, syncRequestSchema);
  if (validation.error) {
    logger.warn('Validation failed');
    return validation.error;
  }

  const { postIds, dateRange, forceRefresh } = validation.data;
  logger.log('Request validated', {
    postCount: postIds.length,
    dateRange,
    forceRefresh,
  });

  try {
    // Create performance monitoring service
    const monitoring = createPerformanceMonitoring();

    // In production, these would be real data sources connected to
    // Google Search Console and Analytics APIs.
    // For now, use mock sources with empty data.
    monitoring.setSearchConsoleSource(createMockSearchConsoleSource([]));
    monitoring.setAnalyticsSource(createMockAnalyticsSource([]));

    // Trigger sync
    const syncStartTime = Date.now();
    const result = await monitoring.syncData(postIds, dateRange);

    const syncDuration = Date.now() - syncStartTime;

    logger.log('Sync completed', {
      synced: result.synced,
      errors: result.errors.length,
      duration: syncDuration,
    });
    logger.done('SUCCESS');

    return successResponse({
      success: result.errors.length === 0,
      synced: result.synced,
      errors: result.errors,
      dateRange,
      syncDuration,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Sync failed', error);
    logger.done('ERROR');
    return serverErrorResponse('Performance data sync failed');
  }
}
