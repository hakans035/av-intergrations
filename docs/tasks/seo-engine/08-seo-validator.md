# Task 08: SEO Validator

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 7: SEO Metadata and On-Page Requirements

## Objective

Implement SEO validation for all on-page elements.

## Requirements

### Meta Title Validation

- Maximum 60 characters including spaces
- Primary keyword within first 40 characters
- Brand name at end: "| AmbitionValley"
- No duplicate titles across site

### Meta Description Validation

- Maximum 160 characters including spaces
- Primary keyword included naturally
- Contains call to action or value proposition
- No duplicate descriptions across site

### URL Slug Validation

- Maximum 75 characters
- Lowercase only
- Words separated by hyphens
- No stop words unless necessary
- Primary keyword included
- No dates unless time-sensitive
- Format: /blog/{slug} (NL), /en/blog/{slug} (EN)

### Heading Structure Validation

- Exactly one H1
- Minimum two H2 headings
- No skipping levels (H1 to H3 without H2)
- Primary keyword in H1

### Content Validation

- Primary keyword in first 100 words
- Keyword density between 1-2%
- Minimum word count by content type
- Internal links present (minimum 2)
- External links from approved domains only

### Image Validation

- Main Image present (warning if missing)
- Alt Text present if Main Image exists
- Alt Text maximum 125 characters
- Alt Text descriptive and keyword-relevant
- Thumbnail Alt Text present if Thumbnail exists

### Schema Validation

- Article schema required for all posts
- FAQ schema required if FAQ section present
- JSON-LD syntax valid

### Hreflang Validation

- Alternate Language Post reference valid if set
- Both language versions exist before publishing either

## Output

Return SEOValidationResult with:
- passed: boolean
- errors: array (blocking issues)
- warnings: array (non-blocking issues)
- score: number (0-100)
- details: object with per-check results

## Acceptance Criteria

- [ ] Meta title validation implemented
- [ ] Meta description validation implemented
- [ ] URL slug validation implemented
- [ ] Heading structure validation implemented
- [ ] Content validation implemented
- [ ] Image validation implemented
- [ ] Schema validation implemented
- [ ] Hreflang validation implemented
- [ ] Clear error/warning reporting
- [ ] SEO score calculation
- [ ] Unit tests for all validators

## Dependencies

- Task 02: Types and Configuration

## Estimated Effort

Medium
