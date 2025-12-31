# Task 02: Types and Configuration

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 3: Webflow CMS Data Model and Field Mapping
- Section 5: Keyword Discovery Engine
- Section 9: Publishing Workflow

## Objective

Define all TypeScript interfaces, types, and configuration objects for the SEO content engine.

## Requirements

### Webflow CMS Types

Define interfaces for existing fields:
- Name (string, required)
- Slug (string, required)
- Main Image (image reference)
- Thumbnail image (image reference)
- Post Body (rich text string)
- Post Summary (string)
- Featured? (boolean)
- Next Post (reference)
- Previous Post (reference)
- Alt Text (string)
- Author Image (image reference)
- Author Name (string)

Define interfaces for new fields:
- Language (option: "nl" | "en")
- Alternate Language Post (reference)
- Content Status (option: "draft" | "pending_review" | "approved" | "published" | "archived")
- Source Keyword (string)
- Generation Timestamp (string, ISO 8601)
- Last Reviewed By (string)
- Review Notes (string)
- Meta Title (string)
- Meta Description (string)
- Canonical URL (string)
- Schema Type (option: "Article" | "FAQPage" | "Article+FAQ")
- Thumbnail Alt Text (string)

### Keyword Types

- KeywordIntent: "informational" | "transactional" | "local"
- KeywordStatus: "new" | "approved" | "used" | "rejected" | "expired"
- Keyword interface with: keyword, language, intent, volume, difficulty, discovered_date, status, last_used

### Content Types

- ContentType: "short" | "long" | "mixed"
- ContentDraft interface
- ContentRevision interface

### Approval Types

- ApprovalGate: "content_editor" | "compliance_officer" | "publishing_manager"
- ApprovalAction: "approve" | "reject" | "request_revision" | "flag_for_legal"
- ApprovalLog interface

### Compliance Types

- ComplianceViolation interface
- ComplianceCheckResult interface

### Performance Types

- PerformanceMetric interface
- PerformanceReport interface

### Configuration

Define configuration objects for:
- Webflow API settings (base URL, rate limits, retry strategy)
- Gemini API settings
- SEO validation rules
- Word count ranges per content type
- Approval workflow settings

## Acceptance Criteria

- [ ] All Webflow CMS field types defined
- [ ] All keyword types defined
- [ ] All content types defined
- [ ] All approval types defined
- [ ] All compliance types defined
- [ ] All performance types defined
- [ ] Configuration objects defined
- [ ] Types exported from types.ts
- [ ] Config exported from config.ts
- [ ] TypeScript compiles without errors
- [ ] Zod schemas defined for runtime validation

## Dependencies

- Task 01: Integration Setup

## Estimated Effort

Medium
