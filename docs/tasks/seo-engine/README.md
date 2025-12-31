# SEO Content Engine - Task Index

## Overview

This folder contains implementation tasks for the AI-driven SEO content engine integration. Each task file describes requirements, acceptance criteria, and dependencies.

Reference document: `docs/seo-content-engine-requirements.md`

## Webflow API v2 Reference

Base URL: `https://api.webflow.com/v2`

Key documentation:
- https://developers.webflow.com/data/reference/rest-introduction
- https://developers.webflow.com/data/reference/rate-limits
- https://developers.webflow.com/data/reference/cms/collection-fields/create

Rate limits:
- 60 requests per minute
- 1,000 requests per hour per site
- Bulk operations: up to 100 items per request
- Maximum 60 fields per collection

## Task List

| ID | Task | Status | Dependencies |
|----|------|--------|--------------|
| 00 | Webflow CMS Setup Script | Not Started | None |
| 01 | Integration Setup | Not Started | 00 |
| 02 | Types and Configuration | Not Started | 01 |
| 03 | Webflow API v2 Client | Not Started | 02 |
| 04 | Keyword Discovery Engine | Not Started | 02, 03 |
| 05 | Content Generation | Not Started | 02, 04 |
| 06 | Gemini Image Generation | Not Started | 02, 03 |
| 07 | Compliance Checker | Not Started | 02 |
| 08 | SEO Validator | Not Started | 02 |
| 09 | Quality Assurance | Not Started | 07, 08 |
| 10 | Approval Workflow | Not Started | 02, 09 |
| 11 | Publishing Workflow | Not Started | 03, 05, 06, 10 |
| 12 | Performance Monitoring | Not Started | 02, 03 |
| 13 | UI Components | Not Started | All lib modules |
| 14 | API Routes | Not Started | All lib modules |

## Implementation Order

0. **Webflow CMS Setup Script** (Task 00) - RUN FIRST
   - Retrieve existing CMS fields via API
   - Add required new fields
   - Generate TypeScript types from schema
1. Integration Setup (01)
2. Types and Configuration (02)
3. Webflow API v2 Client (03)
4. Keyword Discovery Engine (04)
5. Content Generation (05)
6. Gemini Image Generation (06)
7. Compliance Checker (07)
8. SEO Validator (08)
9. Quality Assurance (09)
10. Approval Workflow (10)
11. Publishing Workflow (11)
12. API Routes (14)
13. UI Components (13)
14. Performance Monitoring (12)

## Script Location

```
scripts/webflow-cms-setup.ts
```

Run with: `npx tsx scripts/webflow-cms-setup.ts`

## Integration Location

```
src/integrations/seo-engine/
```

## Database Tables

- seo_keywords
- seo_content_drafts
- seo_approval_logs
- seo_performance_metrics

## Environment Variables Required

### Webflow
- WEBFLOW_API_TOKEN
- WEBFLOW_SITE_ID
- WEBFLOW_COLLECTION_ID

### Gemini
- GEMINI_API_KEY

### Google Search Console
- GOOGLE_SEARCH_CONSOLE_CREDENTIALS

## New CMS Fields to Add

The setup script (Task 00) will add these fields to the existing Blog Posts collection:

| Field Name | Type | Required |
|------------|------|----------|
| Language | Option (nl/en) | Yes |
| Alternate Language Post | Reference | No |
| Content Status | Option | Yes |
| Source Keyword | PlainText | No |
| Generation Timestamp | PlainText | No |
| Last Reviewed By | PlainText | No |
| Review Notes | PlainText | No |
| Meta Title | PlainText | No |
| Meta Description | PlainText | No |
| Canonical URL | PlainText | No |
| Schema Type | Option | No |
| Thumbnail Alt Text | PlainText | No |
