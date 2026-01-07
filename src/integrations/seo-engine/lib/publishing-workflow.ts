/**
 * SEO Content Engine - Publishing Workflow
 *
 * End-to-end orchestration from keyword selection to publication.
 */

import type {
  Language,
  ContentType,
  ContentStatus,
  ContentDraft,
  Keyword,
  ApprovalLog,
} from '../types';
import {
  ApprovalWorkflowService,
  createApprovalWorkflow,
  type Reviewer,
  type WorkflowState,
} from './approval-workflow';

// =============================================================================
// Types
// =============================================================================

export type WorkflowStep =
  | 'keyword_selection'
  | 'draft_generation'
  | 'cms_save'
  | 'approval_gate_1'
  | 'approval_gate_2'
  | 'approval_gate_3'
  | 'publishing'
  | 'published'
  | 'archived';

export interface WorkflowItem {
  id: string;
  keywordId: string;
  keyword: string;
  language: Language;
  contentType: ContentType;
  currentStep: WorkflowStep;
  draft?: ContentDraft;
  webflowItemId?: string;
  approvalState: WorkflowState;
  revisions: RevisionEntry[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
  error?: string;
}

export interface RevisionEntry {
  id: string;
  version: number;
  changes: string;
  changedBy: string;
  changedAt: string;
  gate?: string;
}

export interface WorkflowResult {
  success: boolean;
  item: WorkflowItem;
  step: WorkflowStep;
  message?: string;
  error?: string;
}

export interface GeneratedDraftData {
  title: string;
  slug: string;
  body: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  schemaMarkup?: string;
  mainImageUrl?: string;
  mainImageAlt?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
}

export interface WebflowSaveResult {
  success: boolean;
  itemId?: string;
  error?: string;
}

export interface PublishResult {
  success: boolean;
  publishedAt?: string;
  error?: string;
}

// =============================================================================
// Constants
// =============================================================================

const STEP_ORDER: WorkflowStep[] = [
  'keyword_selection',
  'draft_generation',
  'cms_save',
  'approval_gate_1',
  'approval_gate_2',
  'approval_gate_3',
  'publishing',
  'published',
];

// =============================================================================
// Publishing Workflow Service
// =============================================================================

export class PublishingWorkflowService {
  private approvalWorkflow: ApprovalWorkflowService;
  private items: Map<string, WorkflowItem> = new Map();

  constructor(approvalWorkflow?: ApprovalWorkflowService) {
    this.approvalWorkflow = approvalWorkflow || createApprovalWorkflow();
  }

  // ===========================================================================
  // Step 1: Keyword Selection
  // ===========================================================================

  /**
   * Start workflow by selecting a keyword.
   */
  selectKeyword(
    keyword: Keyword,
    contentType: ContentType,
    editorId: string
  ): WorkflowResult {
    const id = this.generateId();
    const now = new Date().toISOString();

    const item: WorkflowItem = {
      id,
      keywordId: keyword.id,
      keyword: keyword.keyword,
      language: keyword.language,
      contentType,
      currentStep: 'keyword_selection',
      approvalState: this.approvalWorkflow.createInitialState(),
      revisions: [],
      createdAt: now,
      updatedAt: now,
    };

    // Record selection
    item.revisions.push({
      id: this.generateId(),
      version: 1,
      changes: `Keyword selected: ${keyword.keyword}`,
      changedBy: editorId,
      changedAt: now,
    });

    // Move to next step
    item.currentStep = 'draft_generation';
    item.updatedAt = now;

    this.items.set(id, item);

    return {
      success: true,
      item,
      step: 'draft_generation',
      message: 'Keyword selected, ready for draft generation',
    };
  }

  // ===========================================================================
  // Step 2: Draft Generation
  // ===========================================================================

  /**
   * Generate draft content for a workflow item.
   */
  generateDraft(
    itemId: string,
    draftData: GeneratedDraftData,
    generatorId: string
  ): WorkflowResult {
    const item = this.items.get(itemId);
    if (!item) {
      return this.errorResult(itemId, 'draft_generation', 'Workflow item not found');
    }

    if (item.currentStep !== 'draft_generation') {
      return this.errorResult(itemId, item.currentStep, `Cannot generate draft in step: ${item.currentStep}`);
    }

    const now = new Date().toISOString();

    // Create draft
    const draft: ContentDraft = {
      id: this.generateId(),
      keywordId: item.keywordId,
      keyword: item.keyword,
      language: item.language,
      contentType: item.contentType,
      title: draftData.title,
      slug: draftData.slug,
      body: draftData.body,
      summary: draftData.summary,
      metaTitle: draftData.metaTitle,
      metaDescription: draftData.metaDescription,
      schemaType: 'article',
      status: 'draft',
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    item.draft = draft;
    item.currentStep = 'cms_save';
    item.updatedAt = now;

    item.revisions.push({
      id: this.generateId(),
      version: item.revisions.length + 1,
      changes: 'Draft generated',
      changedBy: generatorId,
      changedAt: now,
    });

    this.items.set(itemId, item);

    return {
      success: true,
      item,
      step: 'cms_save',
      message: 'Draft generated, ready to save to CMS',
    };
  }

  // ===========================================================================
  // Step 3: Save to Webflow CMS
  // ===========================================================================

  /**
   * Record CMS save result.
   */
  saveToCMS(
    itemId: string,
    saveResult: WebflowSaveResult
  ): WorkflowResult {
    const item = this.items.get(itemId);
    if (!item) {
      return this.errorResult(itemId, 'cms_save', 'Workflow item not found');
    }

    if (item.currentStep !== 'cms_save') {
      return this.errorResult(itemId, item.currentStep, `Cannot save to CMS in step: ${item.currentStep}`);
    }

    const now = new Date().toISOString();

    if (!saveResult.success) {
      item.error = saveResult.error;
      item.updatedAt = now;
      this.items.set(itemId, item);
      return this.errorResult(itemId, 'cms_save', saveResult.error || 'Failed to save to CMS');
    }

    item.webflowItemId = saveResult.itemId;
    item.currentStep = 'approval_gate_1';
    item.updatedAt = now;
    item.error = undefined;

    if (item.draft) {
      item.draft.webflowItemId = saveResult.itemId;
      item.draft.status = 'pending_review';
    }

    item.revisions.push({
      id: this.generateId(),
      version: item.revisions.length + 1,
      changes: `Saved to CMS with item ID: ${saveResult.itemId}`,
      changedBy: 'system',
      changedAt: now,
    });

    this.items.set(itemId, item);

    return {
      success: true,
      item,
      step: 'approval_gate_1',
      message: 'Saved to CMS, ready for content editor review',
    };
  }

  // ===========================================================================
  // Step 4: Human Approval (Gates 1-3)
  // ===========================================================================

  /**
   * Process approval at a gate.
   */
  processApproval(
    itemId: string,
    gate: 1 | 2 | 3,
    action: 'approve' | 'reject' | 'request_revision' | 'flag_for_legal',
    reviewer: Reviewer,
    notes?: string
  ): WorkflowResult {
    const item = this.items.get(itemId);
    if (!item) {
      return this.errorResult(itemId, 'approval_gate_1', 'Workflow item not found');
    }

    const expectedStep = `approval_gate_${gate}` as WorkflowStep;
    if (item.currentStep !== expectedStep) {
      return this.errorResult(itemId, item.currentStep, `Cannot process gate ${gate} in step: ${item.currentStep}`);
    }

    if (!item.draft) {
      return this.errorResult(itemId, item.currentStep, 'No draft available for approval');
    }

    const now = new Date().toISOString();

    // Map gate number to approval gate type
    const gateMap = {
      1: 'content_editor',
      2: 'compliance_officer',
      3: 'publishing_manager',
    } as const;

    const approvalGate = gateMap[gate];

    // Process through approval workflow
    const approvalResult = this.approvalWorkflow.processApproval(
      item.draft,
      {
        draftId: item.draft.id,
        gate: approvalGate,
        action,
        reviewer,
        notes,
      },
      item.approvalState
    );

    if (!approvalResult.success) {
      return this.errorResult(itemId, item.currentStep, approvalResult.error || 'Approval failed');
    }

    // Update approval state
    item.approvalState = this.approvalWorkflow.updateWorkflowState(
      item.approvalState,
      approvalGate,
      action,
      reviewer,
      notes
    );

    // Update draft status
    if (approvalResult.draft) {
      item.draft = approvalResult.draft;
    }

    // Record revision
    item.revisions.push({
      id: this.generateId(),
      version: item.revisions.length + 1,
      changes: `${this.approvalWorkflow.getGateDisplayName(approvalGate)}: ${this.approvalWorkflow.getActionDisplayName(action)}${notes ? ` - ${notes}` : ''}`,
      changedBy: reviewer.name,
      changedAt: now,
      gate: approvalGate,
    });

    // Determine next step based on action
    if (action === 'approve') {
      if (gate === 3) {
        // Final approval - move to publishing
        item.currentStep = 'publishing';
        item.draft.status = 'approved';
      } else {
        // Move to next gate
        item.currentStep = `approval_gate_${gate + 1}` as WorkflowStep;
      }
    } else if (action === 'reject' || action === 'request_revision') {
      // Return to draft generation for revision
      item.currentStep = 'draft_generation';
      item.draft.status = 'draft';
    }
    // flag_for_legal stays at current gate but marks as escalated

    item.updatedAt = now;
    this.items.set(itemId, item);

    return {
      success: true,
      item,
      step: item.currentStep,
      message: `Gate ${gate} ${action === 'approve' ? 'approved' : action}`,
    };
  }

  // ===========================================================================
  // Step 5: Revision Loop
  // ===========================================================================

  /**
   * Submit revised draft.
   */
  submitRevision(
    itemId: string,
    draftData: GeneratedDraftData,
    editorId: string,
    changeDescription: string
  ): WorkflowResult {
    const item = this.items.get(itemId);
    if (!item) {
      return this.errorResult(itemId, 'draft_generation', 'Workflow item not found');
    }

    if (item.currentStep !== 'draft_generation') {
      return this.errorResult(itemId, item.currentStep, 'Item is not in revision state');
    }

    // Check revision limit
    if (item.approvalState.revisionCount >= this.approvalWorkflow.getMaxRevisions()) {
      return this.errorResult(
        itemId,
        item.currentStep,
        `Maximum revisions (${this.approvalWorkflow.getMaxRevisions()}) reached. Content must be escalated.`
      );
    }

    const now = new Date().toISOString();

    // Update draft with revisions
    if (item.draft) {
      item.draft.title = draftData.title;
      item.draft.slug = draftData.slug;
      item.draft.body = draftData.body;
      item.draft.summary = draftData.summary;
      item.draft.metaTitle = draftData.metaTitle;
      item.draft.metaDescription = draftData.metaDescription;
      item.draft.updatedAt = now;
    }

    item.revisions.push({
      id: this.generateId(),
      version: item.revisions.length + 1,
      changes: `Revision: ${changeDescription}`,
      changedBy: editorId,
      changedAt: now,
    });

    // Move back to CMS save (to update the item)
    item.currentStep = 'cms_save';
    item.updatedAt = now;

    this.items.set(itemId, item);

    return {
      success: true,
      item,
      step: 'cms_save',
      message: 'Revision submitted, ready to update CMS',
    };
  }

  // ===========================================================================
  // Step 6: Final Publish
  // ===========================================================================

  /**
   * Publish the content.
   */
  publish(
    itemId: string,
    publishResult: PublishResult,
    publisherId: string
  ): WorkflowResult {
    const item = this.items.get(itemId);
    if (!item) {
      return this.errorResult(itemId, 'publishing', 'Workflow item not found');
    }

    if (item.currentStep !== 'publishing') {
      return this.errorResult(itemId, item.currentStep, `Cannot publish in step: ${item.currentStep}`);
    }

    const now = new Date().toISOString();

    if (!publishResult.success) {
      item.error = publishResult.error;
      item.updatedAt = now;
      this.items.set(itemId, item);
      return this.errorResult(itemId, 'publishing', publishResult.error || 'Failed to publish');
    }

    item.currentStep = 'published';
    item.publishedAt = publishResult.publishedAt || now;
    item.updatedAt = now;
    item.error = undefined;

    if (item.draft) {
      item.draft.status = 'published';
    }

    item.revisions.push({
      id: this.generateId(),
      version: item.revisions.length + 1,
      changes: 'Published',
      changedBy: publisherId,
      changedAt: now,
    });

    this.items.set(itemId, item);

    return {
      success: true,
      item,
      step: 'published',
      message: 'Content published successfully',
    };
  }

  // ===========================================================================
  // Step 7: Rollback
  // ===========================================================================

  /**
   * Rollback (unpublish) content.
   */
  rollback(
    itemId: string,
    reason: string,
    rolledBackBy: string
  ): WorkflowResult {
    const item = this.items.get(itemId);
    if (!item) {
      return this.errorResult(itemId, 'archived', 'Workflow item not found');
    }

    if (item.currentStep !== 'published') {
      return this.errorResult(itemId, item.currentStep, 'Can only rollback published content');
    }

    const now = new Date().toISOString();

    item.currentStep = 'archived';
    item.archivedAt = now;
    item.updatedAt = now;

    if (item.draft) {
      item.draft.status = 'archived';
    }

    item.revisions.push({
      id: this.generateId(),
      version: item.revisions.length + 1,
      changes: `Rolled back: ${reason}`,
      changedBy: rolledBackBy,
      changedAt: now,
    });

    this.items.set(itemId, item);

    return {
      success: true,
      item,
      step: 'archived',
      message: 'Content rolled back and archived',
    };
  }

  // ===========================================================================
  // Workflow Status
  // ===========================================================================

  /**
   * Get workflow item by ID.
   */
  getItem(itemId: string): WorkflowItem | undefined {
    return this.items.get(itemId);
  }

  /**
   * Get all workflow items.
   */
  getAllItems(): WorkflowItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Get items by step.
   */
  getItemsByStep(step: WorkflowStep): WorkflowItem[] {
    return this.getAllItems().filter((item) => item.currentStep === step);
  }

  /**
   * Get items by status.
   */
  getItemsByStatus(status: ContentStatus): WorkflowItem[] {
    return this.getAllItems().filter((item) => item.draft?.status === status);
  }

  /**
   * Get workflow progress as percentage.
   */
  getProgress(itemId: string): number {
    const item = this.items.get(itemId);
    if (!item) return 0;

    const stepIndex = STEP_ORDER.indexOf(item.currentStep);
    if (stepIndex === -1) return 0;

    return Math.round((stepIndex / (STEP_ORDER.length - 1)) * 100);
  }

  /**
   * Get workflow status summary.
   */
  getStatus(itemId: string): {
    step: WorkflowStep;
    stepName: string;
    progress: number;
    isComplete: boolean;
    isArchived: boolean;
    hasError: boolean;
    revisionCount: number;
    isEscalated: boolean;
  } | null {
    const item = this.items.get(itemId);
    if (!item) return null;

    return {
      step: item.currentStep,
      stepName: this.getStepDisplayName(item.currentStep),
      progress: this.getProgress(itemId),
      isComplete: item.currentStep === 'published',
      isArchived: item.currentStep === 'archived',
      hasError: !!item.error,
      revisionCount: item.approvalState.revisionCount,
      isEscalated: item.approvalState.isEscalated,
    };
  }

  /**
   * Get step display name.
   */
  getStepDisplayName(step: WorkflowStep): string {
    const names: Record<WorkflowStep, string> = {
      keyword_selection: 'Keyword Selection',
      draft_generation: 'Draft Generation',
      cms_save: 'Saving to CMS',
      approval_gate_1: 'Content Editor Review',
      approval_gate_2: 'Compliance Review',
      approval_gate_3: 'Publishing Manager Approval',
      publishing: 'Publishing',
      published: 'Published',
      archived: 'Archived',
    };
    return names[step];
  }

  /**
   * Check if step can proceed to next.
   */
  canProceed(itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    // Can't proceed if there's an error
    if (item.error) return false;

    // Can't proceed if already complete or archived
    if (item.currentStep === 'published' || item.currentStep === 'archived') {
      return false;
    }

    // Check if escalated
    if (item.approvalState.isEscalated) return false;

    return true;
  }

  // ===========================================================================
  // Audit Trail
  // ===========================================================================

  /**
   * Get revision history for an item.
   */
  getRevisionHistory(itemId: string): RevisionEntry[] {
    const item = this.items.get(itemId);
    return item?.revisions || [];
  }

  /**
   * Get approval logs for an item.
   */
  getApprovalLogs(itemId: string): ApprovalLog[] {
    const item = this.items.get(itemId);
    if (!item?.draft) return [];
    return this.approvalWorkflow.getAuditLogs(item.draft.id);
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Generate unique ID.
   */
  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Create error result.
   */
  private errorResult(itemId: string, step: WorkflowStep, error: string): WorkflowResult {
    const item = this.items.get(itemId);
    return {
      success: false,
      item: item || this.createEmptyItem(itemId),
      step,
      error,
    };
  }

  /**
   * Create empty item for error cases.
   */
  private createEmptyItem(id: string): WorkflowItem {
    const now = new Date().toISOString();
    return {
      id,
      keywordId: '',
      keyword: '',
      language: 'nl',
      contentType: 'mixed',
      currentStep: 'keyword_selection',
      approvalState: this.approvalWorkflow.createInitialState(),
      revisions: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get the approval workflow service.
   */
  getApprovalWorkflow(): ApprovalWorkflowService {
    return this.approvalWorkflow;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a publishing workflow service.
 */
export function createPublishingWorkflow(
  approvalWorkflow?: ApprovalWorkflowService
): PublishingWorkflowService {
  return new PublishingWorkflowService(approvalWorkflow);
}
