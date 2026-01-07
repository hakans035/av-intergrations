/**
 * POST /api/seo-engine/approval/[id]
 * Submit approval decision
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
import { createApprovalWorkflow } from '@/integrations/seo-engine';
import type { ApprovalGate, ApprovalAction, ContentDraft, ContentType } from '@/integrations/seo-engine';

const approvalDecisionSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_revision', 'flag_for_legal']),
  gate: z.enum(['content_editor', 'compliance_officer', 'publishing_manager']),
  reviewerId: z.string(),
  reviewerName: z.string(),
  notes: z.string().optional(),
  scheduledPublishDate: z.string().datetime().optional(),
});

// Mock data store - in production, use database
const mockDrafts = new Map<string, ContentDraft>();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logger = createRequestLogger('approval_submit');
  logger.log('Submit approval decision', { id });

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  // Validate body
  const validation = await validateBody(request, approvalDecisionSchema);
  if (validation.error) {
    logger.warn('Validation failed');
    return validation.error;
  }

  const { action, gate, reviewerId, reviewerName, notes, scheduledPublishDate } = validation.data;
  logger.log('Request validated', { action, gate, reviewerId });

  try {
    // Create approval workflow
    const workflow = createApprovalWorkflow();

    // Get draft (or create mock)
    let draft = mockDrafts.get(id);
    if (!draft) {
      draft = {
        id,
        keywordId: 'kw_mock',
        keyword: 'mock keyword',
        language: 'nl',
        contentType: 'long' as ContentType,
        title: 'Mock Title',
        slug: 'mock-slug',
        body: 'Mock body content',
        summary: 'Mock summary',
        metaTitle: 'Mock Meta Title',
        metaDescription: 'Mock description',
        schemaType: 'article',
        status: 'pending_review',
        generatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Create initial workflow state
    const workflowState = workflow.createInitialState();

    // Process approval
    const result = workflow.processApproval(draft, {
      draftId: id,
      gate: gate as ApprovalGate,
      action: action as ApprovalAction,
      reviewer: {
        id: reviewerId,
        name: reviewerName,
        role: gate as ApprovalGate,
      },
      notes,
      scheduledPublishDate,
    }, workflowState);

    if (!result.success) {
      logger.error('Approval processing failed', result.error);
      return serverErrorResponse(result.error ?? 'Failed to process approval');
    }

    // Update draft in store
    if (result.draft) {
      mockDrafts.set(id, result.draft);
    }

    logger.log('Approval processed', {
      action,
      gate,
      newStatus: result.newStatus,
    });
    logger.done('SUCCESS');

    return successResponse({
      approvalId: id,
      action,
      gate,
      newStatus: result.newStatus,
      log: result.log,
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Approval processing failed', error);
    logger.done('ERROR');
    return serverErrorResponse('Failed to submit approval decision');
  }
}
