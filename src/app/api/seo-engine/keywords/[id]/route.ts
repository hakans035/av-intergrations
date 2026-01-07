/**
 * PATCH /api/seo-engine/keywords/[id]
 * Update keyword status
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
import type { KeywordStatus } from '@/integrations/seo-engine';

const updateKeywordSchema = z.object({
  status: z.enum(['new', 'approved', 'in_progress', 'used', 'rejected', 'expired']),
  reviewerNotes: z.string().optional(),
});

// Mock data store - in production, use database
const mockKeywords = new Map<string, { id: string; status: KeywordStatus; keyword: string }>();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logger = createRequestLogger('kw_update');
  logger.log('Update keyword', { id });

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  // Validate body
  const validation = await validateBody(request, updateKeywordSchema);
  if (validation.error) {
    logger.warn('Validation failed');
    return validation.error;
  }

  const { status, reviewerNotes } = validation.data;
  logger.log('Request validated', { status, hasNotes: !!reviewerNotes });

  try {
    // In production: update in database
    const keyword = mockKeywords.get(id);

    if (!keyword) {
      // For demo purposes, create a mock response
      logger.log('Keyword updated (mock)', { id, status });
      logger.done('SUCCESS');

      return successResponse({
        id,
        status,
        updatedAt: new Date().toISOString(),
      });
    }

    keyword.status = status;
    mockKeywords.set(id, keyword);

    logger.log('Keyword updated', { id, status });
    logger.done('SUCCESS');

    return successResponse({
      id,
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Update failed', error);
    logger.done('ERROR');
    return serverErrorResponse('Failed to update keyword');
  }
}
