# Task 11: Publishing Workflow

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 9: Publishing Workflow

## Objective

Implement the end-to-end publishing workflow from keyword selection to publication.

## Requirements

### Step 1: Keyword Selection

- Retrieve ranked keyword list from discovery engine
- Content Editor selects keyword from approved queue
- Update keyword status to "in_progress"
- Record selection with timestamp and editor ID

### Step 2: Draft Generation

- Generate content based on keyword, intent, content type
- Generate images via Gemini
- Assemble draft with all fields populated
- Run automatic compliance checks
- Record Generation Timestamp

### Step 3: Save to Webflow CMS

- Create collection item via API with _draft: true
- Set Content Status to "draft"
- Populate all fields per mapping rules
- Leave Next Post and Previous Post empty
- Log API response with item ID

### Step 4: Human Approval

- Route through Gate 1 (Content Editor)
- Route through Gate 2 (Compliance Officer)
- Route through Gate 3 (Publishing Manager)
- Handle revisions at each gate

### Step 5: Revision Loop

- On rejection, return to Step 2 or Step 4a
- Update Review Notes with required changes
- Track revision count
- Escalate after 3 revisions
- Log all revisions with diffs

### Step 6: Final Publish

- Update item via API: _draft: false, _archived: false
- Set Content Status to "published"
- Record publish timestamp
- Trigger Webflow site publish if required
- Log confirmation

### Step 7: Rollback

- Immediate unpublish capability
- Set _draft: true, Content Status to "archived"
- Log rollback with reason
- Notify Content Editor and Compliance Officer
- Retain versions via Generation Timestamp

### Orchestration

Implement workflow orchestrator that:
- Tracks current step for each content item
- Enforces step order
- Handles parallel processing of multiple items
- Provides status visibility
- Handles failures gracefully

## Acceptance Criteria

- [ ] Keyword selection step implemented
- [ ] Draft generation step implemented
- [ ] CMS save step implemented
- [ ] Approval routing implemented
- [ ] Revision loop implemented
- [ ] Publish step implemented
- [ ] Rollback step implemented
- [ ] Workflow orchestrator working
- [ ] Status tracking accurate
- [ ] Error handling robust
- [ ] Unit tests for workflow
- [ ] Integration test for full flow

## Dependencies

- Task 03: Webflow API Client
- Task 05: Content Generation
- Task 06: Gemini Image Generation
- Task 10: Approval Workflow

## Estimated Effort

Large
