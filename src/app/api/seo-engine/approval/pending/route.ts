/**
 * GET /api/seo-engine/approval/pending
 * List pending approvals
 */

import {
  validateAdminToken,
  unauthorizedResponse,
  successResponse,
  serverErrorResponse,
  parseQueryParams,
  createRequestLogger,
} from '../../_shared/utils';
import type { ApprovalGate } from '@/integrations/seo-engine';

interface PendingApproval {
  id: string;
  draftId: string;
  draftTitle: string;
  gate: ApprovalGate;
  requestedAt: string;
  requestedBy: string;
}

// Mock data store - in production, use database
const mockPendingApprovals: PendingApproval[] = [];

export async function GET(request: Request) {
  const logger = createRequestLogger('approval_pending');
  logger.log('List pending approvals');

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  try {
    const { page, limit, offset, params } = parseQueryParams(request.url);

    // Parse filters
    const gate = params.get('gate') as ApprovalGate | null;
    const reviewerId = params.get('reviewerId');

    logger.log('Query params', { page, limit, gate, reviewerId });

    // Filter approvals
    let filtered = [...mockPendingApprovals];

    if (gate) {
      filtered = filtered.filter((a) => a.gate === gate);
    }

    // Sort by requestedAt descending (oldest first for fairness)
    filtered.sort((a, b) =>
      new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
    );

    // Paginate
    const total = filtered.length;
    const approvals = filtered.slice(offset, offset + limit);

    logger.log('Returning approvals', { total, returned: approvals.length });
    logger.done('SUCCESS');

    return successResponse(
      { approvals },
      200,
      {
        total,
        page,
        limit,
        hasMore: offset + limit < total,
      }
    );
  } catch (error) {
    logger.error('Failed to get approvals', error);
    logger.done('ERROR');
    return serverErrorResponse('Failed to retrieve pending approvals');
  }
}
