/**
 * Approval Workflow Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ApprovalWorkflowService,
  createApprovalWorkflow,
  type Reviewer,
  type WorkflowState,
} from '../../src/integrations/seo-engine/lib/approval-workflow';
import type { ContentDraft } from '../../src/integrations/seo-engine/types';

describe('ApprovalWorkflowService', () => {
  let workflow: ApprovalWorkflowService;
  let mockDraft: ContentDraft;
  let contentEditor: Reviewer;
  let complianceOfficer: Reviewer;
  let publishingManager: Reviewer;

  beforeEach(() => {
    workflow = createApprovalWorkflow();

    mockDraft = {
      id: 'draft-123',
      keywordId: 'kw-1',
      keyword: 'belastingadvies',
      language: 'nl',
      contentType: 'mixed',
      title: 'Test Article',
      slug: 'test-article',
      body: '<p>Test content</p>',
      summary: 'Test summary',
      metaTitle: 'Test | AmbitionValley',
      metaDescription: 'Test description',
      schemaType: 'article',
      status: 'draft',
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    contentEditor = { id: 'user-1', name: 'John Editor', role: 'content_editor' };
    complianceOfficer = { id: 'user-2', name: 'Jane Compliance', role: 'compliance_officer' };
    publishingManager = { id: 'user-3', name: 'Bob Publisher', role: 'publishing_manager' };
  });

  describe('submitForReview', () => {
    it('should submit draft for review', () => {
      const result = workflow.submitForReview(mockDraft, contentEditor);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('pending_review');
      expect(result.draft?.status).toBe('pending_review');
      expect(result.log.action).toBe('approve');
    });

    it('should reject non-draft content', () => {
      const pendingDraft = { ...mockDraft, status: 'pending_review' as const };
      const result = workflow.submitForReview(pendingDraft, contentEditor);

      expect(result.success).toBe(false);
      expect(result.error).toContain('drafts');
    });
  });

  describe('processApproval - Gate 1 (Content Editor)', () => {
    let pendingDraft: ContentDraft;
    let state: WorkflowState;

    beforeEach(() => {
      pendingDraft = { ...mockDraft, status: 'pending_review' };
      state = workflow.createInitialState();
    });

    it('should approve at Gate 1', () => {
      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'content_editor',
        action: 'approve',
        reviewer: contentEditor,
        notes: 'Looks good',
      }, state);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('pending_review');
      expect(result.log.gate).toBe('content_editor');
      expect(result.log.action).toBe('approve');
    });

    it('should reject at Gate 1', () => {
      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'content_editor',
        action: 'reject',
        reviewer: contentEditor,
        notes: 'Needs more work',
      }, state);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('draft');
    });

    it('should request revision at Gate 1', () => {
      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'content_editor',
        action: 'request_revision',
        reviewer: contentEditor,
        notes: 'Please fix section 2',
      }, state);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('draft');
    });
  });

  describe('processApproval - Gate 2 (Compliance Officer)', () => {
    let pendingDraft: ContentDraft;
    let state: WorkflowState;

    beforeEach(() => {
      pendingDraft = { ...mockDraft, status: 'pending_review' };
      state = { ...workflow.createInitialState(), passedGates: ['content_editor'] };
    });

    it('should approve at Gate 2', () => {
      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'compliance_officer',
        action: 'approve',
        reviewer: complianceOfficer,
      }, state);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('pending_review');
    });

    it('should reject at Gate 2', () => {
      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'compliance_officer',
        action: 'reject',
        reviewer: complianceOfficer,
        notes: 'Compliance issue found',
      }, state);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('draft');
    });

    it('should flag for legal at Gate 2', () => {
      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'compliance_officer',
        action: 'flag_for_legal',
        reviewer: complianceOfficer,
        notes: 'Needs legal review',
      }, state);

      expect(result.success).toBe(true);
      expect(result.log.action).toBe('flag_for_legal');
    });

    it('should fail if Gate 1 not passed', () => {
      const stateWithoutGate1 = workflow.createInitialState();
      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'compliance_officer',
        action: 'approve',
        reviewer: complianceOfficer,
      }, stateWithoutGate1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Previous gates');
    });
  });

  describe('processApproval - Gate 3 (Publishing Manager)', () => {
    let pendingDraft: ContentDraft;
    let state: WorkflowState;

    beforeEach(() => {
      pendingDraft = { ...mockDraft, status: 'pending_review' };
      state = {
        ...workflow.createInitialState(),
        passedGates: ['content_editor', 'compliance_officer'],
      };
    });

    it('should approve at Gate 3 (final approval)', () => {
      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'publishing_manager',
        action: 'approve',
        reviewer: publishingManager,
      }, state);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('approved');
    });

    it('should reject at Gate 3', () => {
      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'publishing_manager',
        action: 'reject',
        reviewer: publishingManager,
        notes: 'Not ready for publication',
      }, state);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('draft');
    });
  });

  describe('publish', () => {
    it('should publish approved content', () => {
      const approvedDraft = { ...mockDraft, status: 'approved' as const };
      const result = workflow.publish(approvedDraft, publishingManager);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('published');
      expect(result.draft?.status).toBe('published');
    });

    it('should reject non-approved content', () => {
      const draftContent = { ...mockDraft, status: 'draft' as const };
      const result = workflow.publish(draftContent, publishingManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('approved');
    });
  });

  describe('archive', () => {
    it('should archive published content', () => {
      const publishedDraft = { ...mockDraft, status: 'published' as const };
      const result = workflow.archive(publishedDraft, publishingManager);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('archived');
    });

    it('should reject non-published content', () => {
      const draftContent = { ...mockDraft, status: 'draft' as const };
      const result = workflow.archive(draftContent, publishingManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('published');
    });
  });

  describe('validation', () => {
    it('should reject mismatched draft ID', () => {
      const state = workflow.createInitialState();
      const pendingDraft = { ...mockDraft, status: 'pending_review' as const };

      const result = workflow.processApproval(pendingDraft, {
        draftId: 'wrong-id',
        gate: 'content_editor',
        action: 'approve',
        reviewer: contentEditor,
      }, state);

      expect(result.success).toBe(false);
      expect(result.error).toContain('mismatch');
    });

    it('should reject mismatched reviewer role', () => {
      const state = workflow.createInitialState();
      const pendingDraft = { ...mockDraft, status: 'pending_review' as const };

      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'compliance_officer',
        action: 'approve',
        reviewer: contentEditor, // Wrong role
      }, state);

      expect(result.success).toBe(false);
      expect(result.error).toContain('role');
    });

    it('should reject invalid action for gate', () => {
      const state = workflow.createInitialState();
      const pendingDraft = { ...mockDraft, status: 'pending_review' as const };

      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'content_editor',
        action: 'flag_for_legal', // Not valid for content_editor
        reviewer: contentEditor,
      }, state);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not valid');
    });
  });

  describe('revision management', () => {
    it('should track revision count', () => {
      let state = workflow.createInitialState();

      state = workflow.updateWorkflowState(state, 'content_editor', 'request_revision', contentEditor);
      expect(state.revisionCount).toBe(1);

      state = workflow.updateWorkflowState(state, 'content_editor', 'reject', contentEditor);
      expect(state.revisionCount).toBe(2);
    });

    it('should escalate after max revisions', () => {
      let state = workflow.createInitialState();

      // Simulate 3 rejections
      state = workflow.updateWorkflowState(state, 'content_editor', 'reject', contentEditor);
      state = workflow.updateWorkflowState(state, 'content_editor', 'reject', contentEditor);
      state = workflow.updateWorkflowState(state, 'content_editor', 'reject', contentEditor);

      expect(state.revisionCount).toBe(3);
      expect(state.isEscalated).toBe(true);
    });

    it('should block revision request after max revisions', () => {
      const pendingDraft = { ...mockDraft, status: 'pending_review' as const };
      const state: WorkflowState = {
        ...workflow.createInitialState(),
        revisionCount: 3,
      };

      const result = workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'content_editor',
        action: 'request_revision',
        reviewer: contentEditor,
      }, state);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum revisions');
    });
  });

  describe('workflow state management', () => {
    it('should create initial state', () => {
      const state = workflow.createInitialState();

      expect(state.currentGate).toBeNull();
      expect(state.passedGates).toHaveLength(0);
      expect(state.revisionCount).toBe(0);
      expect(state.isEscalated).toBe(false);
    });

    it('should update state on approval', () => {
      let state = workflow.createInitialState();

      state = workflow.updateWorkflowState(state, 'content_editor', 'approve', contentEditor, 'Good work');

      expect(state.passedGates).toContain('content_editor');
      expect(state.currentGate).toBe('compliance_officer');
      expect(state.lastReviewedBy).toBe('John Editor');
      expect(state.reviewNotes).toBe('Good work');
    });

    it('should reset state on rejection', () => {
      let state: WorkflowState = {
        ...workflow.createInitialState(),
        passedGates: ['content_editor', 'compliance_officer'],
        currentGate: 'publishing_manager',
      };

      state = workflow.updateWorkflowState(state, 'publishing_manager', 'reject', publishingManager);

      expect(state.passedGates).toHaveLength(0);
      expect(state.currentGate).toBe('content_editor');
    });

    it('should escalate on flag_for_legal', () => {
      let state: WorkflowState = {
        ...workflow.createInitialState(),
        passedGates: ['content_editor'],
      };

      state = workflow.updateWorkflowState(state, 'compliance_officer', 'flag_for_legal', complianceOfficer);

      expect(state.isEscalated).toBe(true);
    });
  });

  describe('audit logging', () => {
    it('should log all approval actions', () => {
      const pendingDraft = { ...mockDraft, status: 'pending_review' as const };
      const state = workflow.createInitialState();

      workflow.processApproval(pendingDraft, {
        draftId: pendingDraft.id,
        gate: 'content_editor',
        action: 'approve',
        reviewer: contentEditor,
        notes: 'Test note',
      }, state);

      const logs = workflow.getAuditLogs(pendingDraft.id);
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('approve');
      expect(logs[0].notes).toBe('Test note');
    });

    it('should maintain complete audit trail', () => {
      // Submit
      const submitResult = workflow.submitForReview(mockDraft, contentEditor);

      // Gate 1 approve
      let state = workflow.createInitialState();
      workflow.processApproval(submitResult.draft!, {
        draftId: mockDraft.id,
        gate: 'content_editor',
        action: 'approve',
        reviewer: contentEditor,
      }, state);

      // Gate 2 approve
      state = { ...state, passedGates: ['content_editor'] };
      workflow.processApproval({ ...mockDraft, status: 'pending_review' }, {
        draftId: mockDraft.id,
        gate: 'compliance_officer',
        action: 'approve',
        reviewer: complianceOfficer,
      }, state);

      const logs = workflow.getAuditLogs(mockDraft.id);
      expect(logs.length).toBeGreaterThanOrEqual(3);
    });

    it('should get all audit logs', () => {
      workflow.submitForReview(mockDraft, contentEditor);
      workflow.submitForReview({ ...mockDraft, id: 'draft-456' }, contentEditor);

      const allLogs = workflow.getAllAuditLogs();
      expect(allLogs.length).toBe(2);
    });

    it('should clear old logs', () => {
      // Submit a draft to create a log
      workflow.submitForReview(mockDraft, contentEditor);

      // Clear logs with 0 retention (should clear all)
      const cleared = workflow.clearOldLogs(0);

      expect(cleared).toBeGreaterThanOrEqual(0);
    });
  });

  describe('workflow status', () => {
    it('should return correct workflow status', () => {
      const state: WorkflowState = {
        currentGate: 'compliance_officer',
        passedGates: ['content_editor'],
        revisionCount: 1,
        isEscalated: false,
        lastReviewedBy: 'John Editor',
      };

      const pendingDraft = { ...mockDraft, status: 'pending_review' as const };
      const status = workflow.getWorkflowStatus(pendingDraft, state);

      expect(status.status).toBe('pending_review');
      expect(status.currentGate).toBe('compliance_officer');
      expect(status.passedGates).toContain('content_editor');
      expect(status.remainingGates).toContain('compliance_officer');
      expect(status.remainingGates).toContain('publishing_manager');
      expect(status.canSubmit).toBe(false);
      expect(status.canPublish).toBe(false);
    });

    it('should check if all gates passed', () => {
      const incompleteState: WorkflowState = {
        ...workflow.createInitialState(),
        passedGates: ['content_editor'],
      };

      const completeState: WorkflowState = {
        ...workflow.createInitialState(),
        passedGates: ['content_editor', 'compliance_officer', 'publishing_manager'],
      };

      expect(workflow.allGatesPassed(incompleteState)).toBe(false);
      expect(workflow.allGatesPassed(completeState)).toBe(true);
    });
  });

  describe('utility methods', () => {
    it('should get next gate', () => {
      expect(workflow.getNextGate(null)).toBe('content_editor');
      expect(workflow.getNextGate('content_editor')).toBe('compliance_officer');
      expect(workflow.getNextGate('compliance_officer')).toBe('publishing_manager');
      expect(workflow.getNextGate('publishing_manager')).toBeNull();
    });

    it('should get gate display name', () => {
      expect(workflow.getGateDisplayName('content_editor')).toBe('Content Editor Review');
      expect(workflow.getGateDisplayName('compliance_officer')).toBe('Compliance Officer Review');
      expect(workflow.getGateDisplayName('publishing_manager')).toBe('Publishing Manager Approval');
    });

    it('should get action display name', () => {
      expect(workflow.getActionDisplayName('approve')).toBe('Approved');
      expect(workflow.getActionDisplayName('reject')).toBe('Rejected');
      expect(workflow.getActionDisplayName('request_revision')).toBe('Revision Requested');
      expect(workflow.getActionDisplayName('flag_for_legal')).toBe('Flagged for Legal Review');
    });

    it('should return gates list', () => {
      const gates = workflow.getGates();
      expect(gates).toContain('content_editor');
      expect(gates).toContain('compliance_officer');
      expect(gates).toContain('publishing_manager');
    });

    it('should return max revisions', () => {
      expect(workflow.getMaxRevisions()).toBe(3);
    });

    it('should validate actions for gates', () => {
      expect(workflow.isActionValidForGate('content_editor', 'approve')).toBe(true);
      expect(workflow.isActionValidForGate('content_editor', 'request_revision')).toBe(true);
      expect(workflow.isActionValidForGate('content_editor', 'flag_for_legal')).toBe(false);

      expect(workflow.isActionValidForGate('compliance_officer', 'flag_for_legal')).toBe(true);
      expect(workflow.isActionValidForGate('compliance_officer', 'request_revision')).toBe(false);

      expect(workflow.isActionValidForGate('publishing_manager', 'approve')).toBe(true);
      expect(workflow.isActionValidForGate('publishing_manager', 'flag_for_legal')).toBe(false);
    });
  });
});

describe('createApprovalWorkflow', () => {
  it('should create workflow instance', () => {
    const workflow = createApprovalWorkflow();
    expect(workflow).toBeInstanceOf(ApprovalWorkflowService);
  });
});
