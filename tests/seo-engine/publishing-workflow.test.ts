/**
 * Publishing Workflow Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PublishingWorkflowService,
  createPublishingWorkflow,
  type GeneratedDraftData,
} from '../../src/integrations/seo-engine/lib/publishing-workflow';
import type { Reviewer } from '../../src/integrations/seo-engine/lib/approval-workflow';
import type { Keyword } from '../../src/integrations/seo-engine/types';

describe('PublishingWorkflowService', () => {
  let workflow: PublishingWorkflowService;
  let mockKeyword: Keyword;
  let mockDraftData: GeneratedDraftData;
  let contentEditor: Reviewer;
  let complianceOfficer: Reviewer;
  let publishingManager: Reviewer;

  beforeEach(() => {
    workflow = createPublishingWorkflow();

    mockKeyword = {
      id: 'kw-123',
      keyword: 'belastingadvies',
      language: 'nl',
      intent: 'informational',
      status: 'approved',
      volume: 1000,
      difficulty: 45,
      discoveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDraftData = {
      title: 'Belastingadvies voor Ondernemers',
      slug: 'belastingadvies-ondernemers',
      body: '<h1>Belastingadvies</h1><p>Content here...</p>',
      summary: 'A comprehensive guide to tax advice.',
      metaTitle: 'Belastingadvies voor Ondernemers | AmbitionValley',
      metaDescription: 'Ontdek alles over belastingadvies voor ondernemers.',
    };

    contentEditor = { id: 'user-1', name: 'John Editor', role: 'content_editor' };
    complianceOfficer = { id: 'user-2', name: 'Jane Compliance', role: 'compliance_officer' };
    publishingManager = { id: 'user-3', name: 'Bob Publisher', role: 'publishing_manager' };
  });

  describe('Step 1: selectKeyword', () => {
    it('should start workflow with keyword selection', () => {
      const result = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');

      expect(result.success).toBe(true);
      expect(result.item.keyword).toBe('belastingadvies');
      expect(result.item.currentStep).toBe('draft_generation');
      expect(result.item.revisions.length).toBe(1);
    });

    it('should record selection in revisions', () => {
      const result = workflow.selectKeyword(mockKeyword, 'long', 'editor-1');

      expect(result.item.revisions[0].changes).toContain('Keyword selected');
      expect(result.item.revisions[0].changedBy).toBe('editor-1');
    });
  });

  describe('Step 2: generateDraft', () => {
    it('should generate draft after keyword selection', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      const result = workflow.generateDraft(selectResult.item.id, mockDraftData, 'generator-1');

      expect(result.success).toBe(true);
      expect(result.item.draft).toBeDefined();
      expect(result.item.draft?.title).toBe('Belastingadvies voor Ondernemers');
      expect(result.item.currentStep).toBe('cms_save');
    });

    it('should fail if item not found', () => {
      const result = workflow.generateDraft('non-existent', mockDraftData, 'generator-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should fail if not in draft_generation step', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      workflow.generateDraft(selectResult.item.id, mockDraftData, 'generator-1');

      // Try to generate again
      const result = workflow.generateDraft(selectResult.item.id, mockDraftData, 'generator-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot generate draft');
    });
  });

  describe('Step 3: saveToCMS', () => {
    it('should save to CMS and move to approval', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      workflow.generateDraft(selectResult.item.id, mockDraftData, 'generator-1');

      const result = workflow.saveToCMS(selectResult.item.id, {
        success: true,
        itemId: 'webflow-item-123',
      });

      expect(result.success).toBe(true);
      expect(result.item.webflowItemId).toBe('webflow-item-123');
      expect(result.item.currentStep).toBe('approval_gate_1');
    });

    it('should handle CMS save failure', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      workflow.generateDraft(selectResult.item.id, mockDraftData, 'generator-1');

      const result = workflow.saveToCMS(selectResult.item.id, {
        success: false,
        error: 'API error',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('API error');
    });
  });

  describe('Step 4: processApproval', () => {
    let itemId: string;

    beforeEach(() => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      itemId = selectResult.item.id;
      workflow.generateDraft(itemId, mockDraftData, 'generator-1');
      workflow.saveToCMS(itemId, { success: true, itemId: 'webflow-123' });
    });

    it('should approve at Gate 1', () => {
      const result = workflow.processApproval(itemId, 1, 'approve', contentEditor);

      expect(result.success).toBe(true);
      expect(result.item.currentStep).toBe('approval_gate_2');
    });

    it('should reject at Gate 1 and return to draft', () => {
      const result = workflow.processApproval(itemId, 1, 'reject', contentEditor, 'Needs improvement');

      expect(result.success).toBe(true);
      expect(result.item.currentStep).toBe('draft_generation');
      expect(result.item.draft?.status).toBe('draft');
    });

    it('should approve through all gates', () => {
      workflow.processApproval(itemId, 1, 'approve', contentEditor);
      workflow.processApproval(itemId, 2, 'approve', complianceOfficer);
      const result = workflow.processApproval(itemId, 3, 'approve', publishingManager);

      expect(result.success).toBe(true);
      expect(result.item.currentStep).toBe('publishing');
      expect(result.item.draft?.status).toBe('approved');
    });

    it('should fail if wrong gate', () => {
      // Try Gate 2 without passing Gate 1
      const result = workflow.processApproval(itemId, 2, 'approve', complianceOfficer);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot process gate 2');
    });
  });

  describe('Step 5: submitRevision', () => {
    let itemId: string;

    beforeEach(() => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      itemId = selectResult.item.id;
      workflow.generateDraft(itemId, mockDraftData, 'generator-1');
      workflow.saveToCMS(itemId, { success: true, itemId: 'webflow-123' });
      workflow.processApproval(itemId, 1, 'reject', contentEditor, 'Needs changes');
    });

    it('should submit revision', () => {
      const revisedData = { ...mockDraftData, title: 'Revised Title' };
      const result = workflow.submitRevision(itemId, revisedData, 'editor-1', 'Fixed title');

      expect(result.success).toBe(true);
      expect(result.item.draft?.title).toBe('Revised Title');
      expect(result.item.currentStep).toBe('cms_save');
    });

    it('should track revision count', () => {
      const item = workflow.getItem(itemId);
      expect(item?.approvalState.revisionCount).toBe(1);
    });

    it('should block after max revisions', () => {
      // Simulate reaching max revisions
      const item = workflow.getItem(itemId)!;
      item.approvalState.revisionCount = 3;

      const result = workflow.submitRevision(itemId, mockDraftData, 'editor-1', 'Fix');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum revisions');
    });
  });

  describe('Step 6: publish', () => {
    let itemId: string;

    beforeEach(() => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      itemId = selectResult.item.id;
      workflow.generateDraft(itemId, mockDraftData, 'generator-1');
      workflow.saveToCMS(itemId, { success: true, itemId: 'webflow-123' });
      workflow.processApproval(itemId, 1, 'approve', contentEditor);
      workflow.processApproval(itemId, 2, 'approve', complianceOfficer);
      workflow.processApproval(itemId, 3, 'approve', publishingManager);
    });

    it('should publish content', () => {
      const result = workflow.publish(itemId, { success: true }, 'publisher-1');

      expect(result.success).toBe(true);
      expect(result.item.currentStep).toBe('published');
      expect(result.item.publishedAt).toBeDefined();
      expect(result.item.draft?.status).toBe('published');
    });

    it('should handle publish failure', () => {
      const result = workflow.publish(itemId, { success: false, error: 'Publish failed' }, 'publisher-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Publish failed');
    });

    it('should fail if not in publishing step', () => {
      // Reset to draft
      const item = workflow.getItem(itemId)!;
      item.currentStep = 'draft_generation';

      const result = workflow.publish(itemId, { success: true }, 'publisher-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot publish');
    });
  });

  describe('Step 7: rollback', () => {
    let itemId: string;

    beforeEach(() => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      itemId = selectResult.item.id;
      workflow.generateDraft(itemId, mockDraftData, 'generator-1');
      workflow.saveToCMS(itemId, { success: true, itemId: 'webflow-123' });
      workflow.processApproval(itemId, 1, 'approve', contentEditor);
      workflow.processApproval(itemId, 2, 'approve', complianceOfficer);
      workflow.processApproval(itemId, 3, 'approve', publishingManager);
      workflow.publish(itemId, { success: true }, 'publisher-1');
    });

    it('should rollback published content', () => {
      const result = workflow.rollback(itemId, 'Found compliance issue', 'admin-1');

      expect(result.success).toBe(true);
      expect(result.item.currentStep).toBe('archived');
      expect(result.item.archivedAt).toBeDefined();
      expect(result.item.draft?.status).toBe('archived');
    });

    it('should fail if not published', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      const result = workflow.rollback(selectResult.item.id, 'Test', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('only rollback published');
    });

    it('should record rollback reason', () => {
      workflow.rollback(itemId, 'Legal issue found', 'admin-1');
      const revisions = workflow.getRevisionHistory(itemId);
      const lastRevision = revisions[revisions.length - 1];

      expect(lastRevision.changes).toContain('Legal issue found');
    });
  });

  describe('Full workflow integration', () => {
    it('should complete full workflow from selection to publish', () => {
      // Step 1: Select keyword
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      expect(selectResult.success).toBe(true);
      const itemId = selectResult.item.id;

      // Step 2: Generate draft
      const draftResult = workflow.generateDraft(itemId, mockDraftData, 'generator-1');
      expect(draftResult.success).toBe(true);

      // Step 3: Save to CMS
      const cmsResult = workflow.saveToCMS(itemId, { success: true, itemId: 'webflow-123' });
      expect(cmsResult.success).toBe(true);

      // Step 4a: Gate 1
      const gate1Result = workflow.processApproval(itemId, 1, 'approve', contentEditor);
      expect(gate1Result.success).toBe(true);

      // Step 4b: Gate 2
      const gate2Result = workflow.processApproval(itemId, 2, 'approve', complianceOfficer);
      expect(gate2Result.success).toBe(true);

      // Step 4c: Gate 3
      const gate3Result = workflow.processApproval(itemId, 3, 'approve', publishingManager);
      expect(gate3Result.success).toBe(true);

      // Step 6: Publish
      const publishResult = workflow.publish(itemId, { success: true }, 'publisher-1');
      expect(publishResult.success).toBe(true);

      // Verify final state
      const item = workflow.getItem(itemId);
      expect(item?.currentStep).toBe('published');
      expect(item?.draft?.status).toBe('published');
    });

    it('should handle rejection and revision flow', () => {
      // Initial flow
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      const itemId = selectResult.item.id;
      workflow.generateDraft(itemId, mockDraftData, 'generator-1');
      workflow.saveToCMS(itemId, { success: true, itemId: 'webflow-123' });

      // Reject at Gate 1
      workflow.processApproval(itemId, 1, 'reject', contentEditor, 'Needs work');

      // Submit revision
      const revisedData = { ...mockDraftData, body: '<h1>Revised</h1>' };
      workflow.submitRevision(itemId, revisedData, 'editor-1', 'Fixed content');

      // Save again
      workflow.saveToCMS(itemId, { success: true, itemId: 'webflow-123' });

      // Now approve through all gates
      workflow.processApproval(itemId, 1, 'approve', contentEditor);
      workflow.processApproval(itemId, 2, 'approve', complianceOfficer);
      workflow.processApproval(itemId, 3, 'approve', publishingManager);
      workflow.publish(itemId, { success: true }, 'publisher-1');

      const item = workflow.getItem(itemId);
      expect(item?.currentStep).toBe('published');
      expect(item?.approvalState.revisionCount).toBe(1);
    });
  });

  describe('Status and progress tracking', () => {
    it('should track workflow progress', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      const itemId = selectResult.item.id;

      // After selection
      expect(workflow.getProgress(itemId)).toBe(14); // 1/7

      // After draft
      workflow.generateDraft(itemId, mockDraftData, 'generator-1');
      expect(workflow.getProgress(itemId)).toBe(29); // 2/7

      // After CMS save
      workflow.saveToCMS(itemId, { success: true, itemId: 'wf-123' });
      expect(workflow.getProgress(itemId)).toBe(43); // 3/7
    });

    it('should get workflow status', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      const status = workflow.getStatus(selectResult.item.id);

      expect(status).not.toBeNull();
      expect(status?.step).toBe('draft_generation');
      expect(status?.stepName).toBe('Draft Generation');
      expect(status?.isComplete).toBe(false);
      expect(status?.isArchived).toBe(false);
    });

    it('should check if can proceed', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      expect(workflow.canProceed(selectResult.item.id)).toBe(true);

      // Complete workflow
      const itemId = selectResult.item.id;
      workflow.generateDraft(itemId, mockDraftData, 'gen-1');
      workflow.saveToCMS(itemId, { success: true, itemId: 'wf-123' });
      workflow.processApproval(itemId, 1, 'approve', contentEditor);
      workflow.processApproval(itemId, 2, 'approve', complianceOfficer);
      workflow.processApproval(itemId, 3, 'approve', publishingManager);
      workflow.publish(itemId, { success: true }, 'pub-1');

      expect(workflow.canProceed(itemId)).toBe(false); // Already published
    });
  });

  describe('Item management', () => {
    it('should get item by ID', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      const item = workflow.getItem(selectResult.item.id);

      expect(item).toBeDefined();
      expect(item?.keyword).toBe('belastingadvies');
    });

    it('should get all items', () => {
      workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      workflow.selectKeyword({ ...mockKeyword, id: 'kw-456' }, 'long', 'editor-1');

      const items = workflow.getAllItems();
      expect(items.length).toBe(2);
    });

    it('should get items by step', () => {
      workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      workflow.selectKeyword({ ...mockKeyword, id: 'kw-456' }, 'long', 'editor-1');

      const items = workflow.getItemsByStep('draft_generation');
      expect(items.length).toBe(2);
    });
  });

  describe('Audit trail', () => {
    it('should get revision history', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      const itemId = selectResult.item.id;
      workflow.generateDraft(itemId, mockDraftData, 'gen-1');

      const revisions = workflow.getRevisionHistory(itemId);
      expect(revisions.length).toBe(2);
    });

    it('should include gate info in revisions', () => {
      const selectResult = workflow.selectKeyword(mockKeyword, 'mixed', 'editor-1');
      const itemId = selectResult.item.id;
      workflow.generateDraft(itemId, mockDraftData, 'gen-1');
      workflow.saveToCMS(itemId, { success: true, itemId: 'wf-123' });
      workflow.processApproval(itemId, 1, 'approve', contentEditor, 'Good work');

      const revisions = workflow.getRevisionHistory(itemId);
      const approvalRevision = revisions.find((r) => r.gate === 'content_editor');

      expect(approvalRevision).toBeDefined();
      expect(approvalRevision?.changes).toContain('Content Editor Review');
    });
  });

  describe('Utility methods', () => {
    it('should get step display name', () => {
      expect(workflow.getStepDisplayName('keyword_selection')).toBe('Keyword Selection');
      expect(workflow.getStepDisplayName('approval_gate_2')).toBe('Compliance Review');
      expect(workflow.getStepDisplayName('published')).toBe('Published');
    });

    it('should get approval workflow', () => {
      const approvalWorkflow = workflow.getApprovalWorkflow();
      expect(approvalWorkflow).toBeDefined();
    });
  });
});

describe('createPublishingWorkflow', () => {
  it('should create workflow instance', () => {
    const workflow = createPublishingWorkflow();
    expect(workflow).toBeInstanceOf(PublishingWorkflowService);
  });

  it('should accept custom approval workflow', () => {
    const customApproval = createPublishingWorkflow().getApprovalWorkflow();
    const workflow = createPublishingWorkflow(customApproval);
    expect(workflow).toBeInstanceOf(PublishingWorkflowService);
  });
});
