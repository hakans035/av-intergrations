# Task 10: Approval Workflow

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 2: Human Review Requirements and Approval Gates
- Section 9: Publishing Workflow

## Objective

Implement the three-gate approval workflow with audit logging.

## Requirements

### Approval Gates

| Gate | Trigger | Reviewer | Actions |
|------|---------|----------|---------|
| Gate 1 | Draft complete | Content Editor | Approve, Reject, Request Revision |
| Gate 2 | Gate 1 approved | Compliance Officer | Approve, Reject, Flag for Legal |
| Gate 3 | Gate 2 approved | Publishing Manager | Publish, Schedule, Reject |

### Gate 1: Content Editor Review

Review criteria:
- Accuracy of information
- Readability and flow
- Tone appropriateness
- Completeness of content

Actions:
- Approve: Move to Gate 2
- Reject: Return to draft with notes
- Request Revision: Flag specific sections

### Gate 2: Compliance Officer Review

Review criteria:
- Disclaimer presence
- Prohibited claims absence
- Risk language appropriateness
- Source citations validity

Actions:
- Approve: Move to Gate 3
- Reject: Return to draft with notes
- Flag for Legal: Escalate for legal review

### Gate 3: Publishing Manager Approval

Review criteria:
- All previous gates passed
- Final quality check
- Publication timing appropriate

Actions:
- Publish: Immediate publication
- Schedule: Set future publish date
- Reject: Return to draft

### State Management

Content Status transitions:
- draft -> pending_review (submit for Gate 1)
- pending_review -> approved (Gate 3 approved)
- pending_review -> draft (any rejection)
- approved -> published (publish action)
- published -> archived (unpublish)

### Revision Loop

- Rejected content returns to draft
- Maximum 3 revisions before escalation
- All revisions tracked with diffs
- Review Notes field updated at each gate

### Audit Trail

Log all actions with:
- timestamp
- action
- actor_id
- item_id
- previous_state
- new_state
- notes

Retention: 36 months
Audit log immutable

## Acceptance Criteria

- [ ] All three gates implemented
- [ ] State transitions enforced
- [ ] Role-based access control ready
- [ ] Revision counter working
- [ ] Maximum revision escalation working
- [ ] Audit logging implemented
- [ ] Review Notes field updated
- [ ] Last Reviewed By field updated
- [ ] Unit tests for state machine
- [ ] Integration with QA checks

## Dependencies

- Task 02: Types and Configuration
- Task 09: Quality Assurance

## Estimated Effort

Large
