/**
 * GET /api/seo-engine/performance/metrics
 * Get performance metrics for content
 */

import {
  validateAdminToken,
  unauthorizedResponse,
  successResponse,
  serverErrorResponse,
  parseQueryParams,
  createRequestLogger,
} from '../../_shared/utils';
import { createPerformanceMonitoring } from '@/integrations/seo-engine';
import type { PerformanceMetric } from '@/integrations/seo-engine';

export async function GET(request: Request) {
  const logger = createRequestLogger('perf_metrics');
  logger.log('Get performance metrics');

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  try {
    const { params } = parseQueryParams(request.url);

    // Parse filters
    const postId = params.get('postId');
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');

    logger.log('Query params', { postId, startDate, endDate });

    // Create performance monitoring service
    const monitoring = createPerformanceMonitoring();

    // Get metrics for a specific post
    const metrics: PerformanceMetric[] = postId
      ? monitoring.getMetrics(postId)
      : [];

    // Filter by date range if provided
    let filteredMetrics = metrics;
    if (startDate || endDate) {
      filteredMetrics = metrics.filter((m) => {
        const date = new Date(m.date);
        if (startDate && date < new Date(startDate)) return false;
        if (endDate && date > new Date(endDate)) return false;
        return true;
      });
    }

    // Calculate summary stats
    const summary = {
      totalImpressions: filteredMetrics.reduce((sum, m) => sum + m.impressions, 0),
      totalClicks: filteredMetrics.reduce((sum, m) => sum + m.clicks, 0),
      avgCTR: filteredMetrics.length > 0
        ? filteredMetrics.reduce((sum, m) => sum + m.ctr, 0) / filteredMetrics.length
        : 0,
      avgPosition: filteredMetrics.length > 0
        ? filteredMetrics.reduce((sum, m) => sum + m.position, 0) / filteredMetrics.length
        : 0,
      totalPageViews: filteredMetrics.reduce((sum, m) => sum + m.pageViews, 0),
    };

    logger.log('Returning metrics', { count: filteredMetrics.length });
    logger.done('SUCCESS');

    return successResponse({
      metrics: filteredMetrics,
      summary,
      dateRange: {
        start: startDate ?? filteredMetrics[0]?.date,
        end: endDate ?? filteredMetrics[filteredMetrics.length - 1]?.date,
      },
    });
  } catch (error) {
    logger.error('Failed to get metrics', error);
    logger.done('ERROR');
    return serverErrorResponse('Failed to retrieve performance metrics');
  }
}
