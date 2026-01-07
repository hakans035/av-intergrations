/**
 * SEO Content Engine - Approval Workflow
 *
 * Three-gate approval workflow with audit logging for content review.
 */

import { approvalConfig } from '../config';
import type {
  ContentStatus,
  ApprovalGate,
  ApprovalAction,
  ApprovalLog,
  ContentDraft,
} from '../types';

// =============================================================================
// Types
// =============================================================================

export interface Reviewer {
  id: string;
  name: string;
  role: ApprovalGate;
}

export interface ApprovalRequest {
  draftId: string;
  gate: ApprovalGate;
  action: ApprovalAction;
  reviewer: Reviewer;
  notes?: string;
  scheduledPublishDate?: string;
}

export interface ApprovalResult {
  success: boolean;
  draft?: ContentDraft;
  newStatus: ContentStatus;
  log: ApprovalLog;
  error?: string;
}

export interface WorkflowState {
  currentGate: ApprovalGate | null;
  passedGates: ApprovalGate[];
  revisionCount: number;
  isEscalated: boolean;
  lastReviewedBy?: string;
  lastReviewedAt?: string;
  reviewNotes?: string;
}

export interface StateTransition {
  from: ContentStatus;
  to: ContentStatus;
  gate: ApprovalGate;
  action: ApprovalAction;
}

// =============================================================================
// Constants
// =============================================================================

const { maxRevisions, gates } = approvalConfig;

/** Valid state transitions */
const STATE_TRANSITIONS: StateTransition[] = [
  // Submit for review (initiates workflow)
  { from: 'draft', to: 'pending_review', gate: 'content_editor', action: 'approve' },

  // Gate 1: Content Editor (reviews pending content)
  { from: 'pending_review', to: 'pending_review', gate: 'content_editor', action: 'approve' },
  { from: 'pending_review', to: 'draft', gate: 'content_editor', action: 'reject' },
  { from: 'pending_review', to: 'draft', gate: 'content_editor', action: 'request_revision' },

  // Gate 2: Compliance Officer
  { from: 'pending_review', to: 'pending_review', gate: 'compliance_officer', action: 'approve' },
  { from: 'pending_review', to: 'draft', gate: 'compliance_officer', action: 'reject' },
  { from: 'pending_review', to: 'pending_review', gate: 'compliance_officer', action: 'flag_for_legal' },

  // Gate 3: Publishing Manager
  { from: 'pending_review', to: 'approved', gate: 'publishing_manager', action: 'approve' },
  { from: 'pending_review', to: 'draft', gate: 'publishing_manager', action: 'reject' },

  // Publishing
  { from: 'approved', to: 'published', gate: 'publishing_manager', action: 'approve' },

  // Archiving
  { from: 'published', to: 'archived', gate: 'publishing_manager', action: 'reject' },
];

/** Gate order for progression */
const GATE_ORDER: Record<ApprovalGate, number> = {
  content_editor: 0,
  compliance_officer: 1,
  publishing_manager: 2,
};

// =============================================================================
// Approval Workflow Service
// =============================================================================

export class ApprovalWorkflowService {
  private auditLogs: ApprovalLog[] = [];

  // ===========================================================================
  // Main Approval Methods
  // ===========================================================================

  /**
   * Process an approval request.
   */
  processApproval(
    draft: ContentDraft,
    request: ApprovalRequest,
    workflowState: WorkflowState
  ): ApprovalResult {
    // Validate the request
    const validation = this.validateApprovalRequest(draft, request, workflowState);
    if (!validation.valid) {
      return {
        success: false,
        newStatus: draft.status,
        log: this.createLog(draft, request, draft.status, draft.status),
        error: validation.error,
      };
    }

    // Determine new status
    const newStatus = this.determineNewStatus(draft.status, request.gate, request.action);

    // Create audit log
    const log = this.createLog(draft, request, draft.status, newStatus);
    this.auditLogs.push(log);

    // Update draft (in real implementation, this would persist to database)
    const updatedDraft: ContentDraft = {
      ...draft,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      draft: updatedDraft,
      newStatus,
      log,
    };
  }

  /**
   * Submit draft for review (initiates workflow).
   */
  submitForReview(draft: ContentDraft, submitter: Reviewer): ApprovalResult {
    if (draft.status !== 'draft') {
      return {
        success: false,
        newStatus: draft.status,
        log: this.createLog(
          draft,
          { draftId: draft.id, gate: 'content_editor', action: 'approve', reviewer: submitter },
          draft.status,
          draft.status
        ),
        error: 'Only drafts can be submitted for review',
      };
    }

    const request: ApprovalRequest = {
      draftId: draft.id,
      gate: 'content_editor',
      action: 'approve',
      reviewer: submitter,
      notes: 'Submitted for review',
    };

    const newStatus: ContentStatus = 'pending_review';
    const log = this.createLog(draft, request, draft.status, newStatus);
    this.auditLogs.push(log);

    return {
      success: true,
      draft: { ...draft, status: newStatus, updatedAt: new Date().toISOString() },
      newStatus,
      log,
    };
  }

  /**
   * Publish approved content.
   */
  publish(draft: ContentDraft, publisher: Reviewer): ApprovalResult {
    if (draft.status !== 'approved') {
      return {
        success: false,
        newStatus: draft.status,
        log: this.createLog(
          draft,
          { draftId: draft.id, gate: 'publishing_manager', action: 'approve', reviewer: publisher },
          draft.status,
          draft.status
        ),
        error: 'Only approved content can be published',
      };
    }

    const request: ApprovalRequest = {
      draftId: draft.id,
      gate: 'publishing_manager',
      action: 'approve',
      reviewer: publisher,
      notes: 'Published',
    };

    const newStatus: ContentStatus = 'published';
    const log = this.createLog(draft, request, draft.status, newStatus);
    this.auditLogs.push(log);

    return {
      success: true,
      draft: { ...draft, status: newStatus, updatedAt: new Date().toISOString() },
      newStatus,
      log,
    };
  }

  /**
   * Archive published content.
   */
  archive(draft: ContentDraft, archiver: Reviewer): ApprovalResult {
    if (draft.status !== 'published') {
      return {
        success: false,
        newStatus: draft.status,
        log: this.createLog(
          draft,
          { draftId: draft.id, gate: 'publishing_manager', action: 'reject', reviewer: archiver },
          draft.status,
          draft.status
        ),
        error: 'Only published content can be archived',
      };
    }

    const request: ApprovalRequest = {
      draftId: draft.id,
      gate: 'publishing_manager',
      action: 'reject',
      reviewer: archiver,
      notes: 'Archived',
    };

    const newStatus: ContentStatus = 'archived';
    const log = this.createLog(draft, request, draft.status, newStatus);
    this.auditLogs.push(log);

    return {
      success: true,
      draft: { ...draft, status: newStatus, updatedAt: new Date().toISOString() },
      newStatus,
      log,
    };
  }

  // ===========================================================================
  // Validation
  // ===========================================================================

  /**
   * Validate an approval request.
   */
  validateApprovalRequest(
    draft: ContentDraft,
    request: ApprovalRequest,
    workflowState: WorkflowState
  ): { valid: boolean; error?: string } {
    // Check if draft ID matches
    if (draft.id !== request.draftId) {
      return { valid: false, error: 'Draft ID mismatch' };
    }

    // Check if reviewer role matches gate
    if (request.reviewer.role !== request.gate) {
      return { valid: false, error: `Reviewer role ${request.reviewer.role} does not match gate ${request.gate}` };
    }

    // Check if action is valid for gate
    if (!this.isActionValidForGate(request.gate, request.action)) {
      return { valid: false, error: `Action ${request.action} is not valid for gate ${request.gate}` };
    }

    // Check if gate is in correct order
    if (!this.isGateInOrder(request.gate, workflowState)) {
      return { valid: false, error: `Gate ${request.gate} cannot be processed yet. Previous gates not passed.` };
    }

    // Check revision count for escalation
    if (workflowState.revisionCount >= maxRevisions && request.action === 'request_revision') {
      return { valid: false, error: `Maximum revisions (${maxRevisions}) reached. Content must be escalated.` };
    }

    // Check state transition validity
    const transition = this.findTransition(draft.status, request.gate, request.action);
    if (!transition) {
      return { valid: false, error: `Invalid state transition from ${draft.status} with action ${request.action}` };
    }

    return { valid: true };
  }

  /**
   * Check if action is valid for gate.
   */
  isActionValidForGate(gate: ApprovalGate, action: ApprovalAction): boolean {
    const validActions: Record<ApprovalGate, ApprovalAction[]> = {
      content_editor: ['approve', 'reject', 'request_revision'],
      compliance_officer: ['approve', 'reject', 'flag_for_legal'],
      publishing_manager: ['approve', 'reject'],
    };

    return validActions[gate].includes(action);
  }

  /**
   * Check if gate is in correct order.
   */
  isGateInOrder(gate: ApprovalGate, workflowState: WorkflowState): boolean {
    const gateIndex = GATE_ORDER[gate];

    // First gate can always be processed
    if (gateIndex === 0) {
      return true;
    }

    // Check if previous gates are passed
    const previousGates = gates.slice(0, gateIndex);
    return previousGates.every((g) => workflowState.passedGates.includes(g));
  }

  // ===========================================================================
  // State Management
  // ===========================================================================

  /**
   * Determine new status based on current status, gate, and action.
   */
  determineNewStatus(
    currentStatus: ContentStatus,
    gate: ApprovalGate,
    action: ApprovalAction
  ): ContentStatus {
    const transition = this.findTransition(currentStatus, gate, action);
    return transition ? transition.to : currentStatus;
  }

  /**
   * Find a valid state transition.
   */
  private findTransition(
    from: ContentStatus,
    gate: ApprovalGate,
    action: ApprovalAction
  ): StateTransition | undefined {
    return STATE_TRANSITIONS.find(
      (t) => t.from === from && t.gate === gate && t.action === action
    );
  }

  /**
   * Get the next gate in the workflow.
   */
  getNextGate(currentGate: ApprovalGate | null): ApprovalGate | null {
    if (!currentGate) {
      return gates[0];
    }

    const currentIndex = GATE_ORDER[currentGate];
    const nextIndex = currentIndex + 1;

    if (nextIndex >= gates.length) {
      return null; // All gates passed
    }

    return gates[nextIndex];
  }

  /**
   * Create initial workflow state.
   */
  createInitialState(): WorkflowState {
    return {
      currentGate: null,
      passedGates: [],
      revisionCount: 0,
      isEscalated: false,
    };
  }

  /**
   * Update workflow state after approval action.
   */
  updateWorkflowState(
    state: WorkflowState,
    gate: ApprovalGate,
    action: ApprovalAction,
    reviewer: Reviewer,
    notes?: string
  ): WorkflowState {
    const newState: WorkflowState = { ...state };

    if (action === 'approve') {
      // Add gate to passed gates
      if (!newState.passedGates.includes(gate)) {
        newState.passedGates = [...newState.passedGates, gate];
      }
      newState.currentGate = this.getNextGate(gate);
    } else if (action === 'reject' || action === 'request_revision') {
      // Reset to beginning
      newState.passedGates = [];
      newState.currentGate = gates[0];
      newState.revisionCount++;

      // Check for escalation
      if (newState.revisionCount >= maxRevisions) {
        newState.isEscalated = true;
      }
    } else if (action === 'flag_for_legal') {
      newState.isEscalated = true;
    }

    // Update review tracking
    newState.lastReviewedBy = reviewer.name;
    newState.lastReviewedAt = new Date().toISOString();
    if (notes) {
      newState.reviewNotes = notes;
    }

    return newState;
  }

  // ===========================================================================
  // Audit Logging
  // ===========================================================================

  /**
   * Create an audit log entry.
   */
  private createLog(
    draft: ContentDraft,
    request: ApprovalRequest,
    previousStatus: ContentStatus,
    newStatus: ContentStatus
  ): ApprovalLog {
    return {
      id: this.generateId(),
      draftId: draft.id,
      gate: request.gate,
      action: request.action,
      reviewerId: request.reviewer.id,
      reviewerName: request.reviewer.name,
      notes: request.notes,
      previousStatus,
      newStatus,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Get audit logs for a draft.
   */
  getAuditLogs(draftId: string): ApprovalLog[] {
    return this.auditLogs.filter((log) => log.draftId === draftId);
  }

  /**
   * Get all audit logs.
   */
  getAllAuditLogs(): ApprovalLog[] {
    return [...this.auditLogs];
  }

  /**
   * Clear old audit logs (beyond retention period).
   */
  clearOldLogs(retentionMonths: number = approvalConfig.auditLogRetentionMonths): number {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);
    const cutoffIso = cutoffDate.toISOString();

    const originalCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter((log) => log.createdAt >= cutoffIso);

    return originalCount - this.auditLogs.length;
  }

  // ===========================================================================
  // Workflow Status
  // ===========================================================================

  /**
   * Get workflow status summary.
   */
  getWorkflowStatus(draft: ContentDraft, state: WorkflowState): {
    status: ContentStatus;
    currentGate: ApprovalGate | null;
    passedGates: ApprovalGate[];
    remainingGates: ApprovalGate[];
    revisionCount: number;
    isEscalated: boolean;
    canSubmit: boolean;
    canPublish: boolean;
  } {
    const remainingGates = gates.filter((g) => !state.passedGates.includes(g));

    return {
      status: draft.status,
      currentGate: state.currentGate,
      passedGates: state.passedGates,
      remainingGates,
      revisionCount: state.revisionCount,
      isEscalated: state.isEscalated,
      canSubmit: draft.status === 'draft',
      canPublish: draft.status === 'approved',
    };
  }

  /**
   * Check if all gates are passed.
   */
  allGatesPassed(state: WorkflowState): boolean {
    return gates.every((g) => state.passedGates.includes(g));
  }

  /**
   * Get gate display name.
   */
  getGateDisplayName(gate: ApprovalGate): string {
    const names: Record<ApprovalGate, string> = {
      content_editor: 'Content Editor Review',
      compliance_officer: 'Compliance Officer Review',
      publishing_manager: 'Publishing Manager Approval',
    };
    return names[gate];
  }

  /**
   * Get action display name.
   */
  getActionDisplayName(action: ApprovalAction): string {
    const names: Record<ApprovalAction, string> = {
      approve: 'Approved',
      reject: 'Rejected',
      request_revision: 'Revision Requested',
      flag_for_legal: 'Flagged for Legal Review',
    };
    return names[action];
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Generate a unique ID.
   */
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get the list of gates.
   */
  getGates(): readonly ApprovalGate[] {
    return gates;
  }

  /**
   * Get maximum revisions before escalation.
   */
  getMaxRevisions(): number {
    return maxRevisions;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create an approval workflow service.
 */
export function createApprovalWorkflow(): ApprovalWorkflowService {
  return new ApprovalWorkflowService();
}
