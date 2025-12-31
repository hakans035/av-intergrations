# Task 13: UI Components

## Reference

See all sections of `docs/seo-content-engine-requirements.md` for feature context.

## Objective

Create React components for the SEO content engine admin interface.

## Requirements

### KeywordQueue Component

Display and manage keyword queue:
- List view of discovered keywords
- Filter by language, intent, status
- Sort by volume, difficulty, date
- Select keyword for content generation
- Approve/reject keywords
- Show keyword details on hover/click

### ContentEditor Component

Review and edit generated content:
- Display draft content with formatting
- Inline editing capability
- Heading structure visualization
- Word count display
- Keyword density indicator
- Internal/external link highlighting
- Disclaimer presence indicator

### ApprovalWorkflow Component

Manage approval process:
- Current gate indicator
- Reviewer assignment
- Action buttons (Approve, Reject, Request Revision)
- Review notes input
- History of previous reviews
- Status timeline visualization

### QAChecklist Component

Display QA check results:
- List of all checks with pass/fail status
- Blocking vs warning distinction
- Detailed error messages
- Fix suggestions
- Rerun checks button
- Overall readiness indicator

### PerformanceDashboard Component

Display content performance:
- Metrics overview cards
- Performance trends chart
- Top/bottom performing posts
- Filter by date range
- Filter by language
- Export capability

### Shared Components

- StatusBadge: Display content status
- LanguageSelector: NL/EN toggle
- ReviewerSelect: Dropdown for reviewer assignment
- ActionButton: Styled action buttons
- MetricCard: Single metric display
- LoadingState: Loading indicators
- ErrorState: Error display

### Design Requirements

- Follow existing admin UI patterns
- Responsive design
- Accessible (WCAG 2.1 AA)
- Dark mode support if existing admin has it
- Consistent with Tailwind CSS usage

## Acceptance Criteria

- [ ] KeywordQueue component working
- [ ] ContentEditor component working
- [ ] ApprovalWorkflow component working
- [ ] QAChecklist component working
- [ ] PerformanceDashboard component working
- [ ] All shared components created
- [ ] Responsive on all screen sizes
- [ ] Accessibility requirements met
- [ ] Consistent styling
- [ ] Components exported from index.ts
- [ ] Storybook stories (if project uses Storybook)

## Dependencies

- All lib modules (Tasks 03-12)

## Estimated Effort

Large
