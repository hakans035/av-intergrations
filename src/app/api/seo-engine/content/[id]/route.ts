/**
 * GET/PATCH /api/seo-engine/content/[id]
 * Get or update a content draft
 */

import { z } from 'zod';
import {
  validateBody,
  validateAdminToken,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
  serverErrorResponse,
  createRequestLogger,
} from '../../_shared/utils';
import type { ContentDraft, ContentStatus } from '@/integrations/seo-engine';

// Mock data store - in production, use database
const mockDrafts = new Map<string, ContentDraft>();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logger = createRequestLogger('draft_get');
  logger.log('Get draft', { id });

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  try {
    const draft = mockDrafts.get(id);

    if (!draft) {
      logger.warn('Draft not found', { id });
      return notFoundResponse('Draft');
    }

    logger.log('Returning draft', { id });
    logger.done('SUCCESS');

    return successResponse({ draft });
  } catch (error) {
    logger.error('Failed to get draft', error);
    logger.done('ERROR');
    return serverErrorResponse('Failed to retrieve draft');
  }
}

const updateDraftSchema = z.object({
  title: z.string().optional(),
  metaDescription: z.string().optional(),
  body: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'published', 'archived']).optional(),
  reviewerNotes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logger = createRequestLogger('draft_update');
  logger.log('Update draft', { id });

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  // Validate body
  const validation = await validateBody(request, updateDraftSchema);
  if (validation.error) {
    logger.warn('Validation failed');
    return validation.error;
  }

  const updates = validation.data;
  logger.log('Request validated', { fields: Object.keys(updates) });

  try {
    const existingDraft = mockDrafts.get(id);

    if (!existingDraft) {
      // For demo purposes, create a mock response
      logger.log('Draft updated (mock)', { id });
      logger.done('SUCCESS');

      return successResponse({
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }

    // Apply updates
    const updatedDraft: ContentDraft = {
      ...existingDraft,
      ...(updates.title && { title: updates.title }),
      ...(updates.metaDescription && { metaDescription: updates.metaDescription }),
      ...(updates.body && { body: updates.body }),
      ...(updates.slug && { slug: updates.slug }),
      ...(updates.status && { status: updates.status as ContentStatus }),
      updatedAt: new Date().toISOString(),
    };
    mockDrafts.set(id, updatedDraft);

    logger.log('Draft updated', { id });
    logger.done('SUCCESS');

    return successResponse({ draft: updatedDraft });
  } catch (error) {
    logger.error('Update failed', error);
    logger.done('ERROR');
    return serverErrorResponse('Failed to update draft');
  }
}
