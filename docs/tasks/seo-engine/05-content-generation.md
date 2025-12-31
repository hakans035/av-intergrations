# Task 05: Content Generation

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 6: Content Generation Requirements
- Section 7: SEO Metadata and On-Page Requirements

## Objective

Implement AI-powered content generation with SEO optimization and compliance rules.

## Requirements

### Content Types

Generate content by type:
- Short: 600-900 words (quick answers, definitions)
- Long: 1500-2500 words (comprehensive guides)
- Mixed: 1000-1500 words (standard posts)

### Structure Rules

- Exactly one H1 (from Name field)
- Minimum two H2 headings
- H3 under H2 where appropriate
- No skipping heading levels
- Primary keyword in first 100 words
- Conclusion section with H2

### Snippet Targeting

- Concise definitions (40-60 words) after first H2
- Bullet lists (3-7 items) for list queries
- Numbered lists for step-by-step
- FAQ with question as H3, answer as paragraph

### Internal Linking

- Minimum 2 internal links per post
- Link to pillar pages and related posts
- Descriptive anchor text (no "click here")
- Maximum 5 links per 1000 words

### External Linking

Approved domains only:
- belastingdienst.nl
- rijksoverheid.nl
- kvk.nl
- cbs.nl
- nibud.nl
- afm.nl
- dnb.nl

Properties:
- target="_blank"
- rel="noopener noreferrer"
- Maximum 3 per post

### FAQ Generation

- Minimum 3, maximum 7 questions
- Natural language matching search queries
- Answers 40-80 words each
- Placed before conclusion

### Readability

- Flesch-Douma score: 50-60 (Dutch)
- Average sentence: 25 words max
- Paragraph: 100 words max
- Passive voice: less than 15%
- Define technical terms on first use

### Banned Patterns

Block these during generation:
- Keyword stuffing (over 2% density)
- Duplicate paragraphs
- Placeholder text
- Plain text URLs
- Empty headings
- Single-sentence Q&A

### Duplicate Avoidance

- Check existing posts for same keyword
- Require 30% content difference between NL and EN
- Store content hashes

## Acceptance Criteria

- [ ] Content generation function implemented
- [ ] All content types supported
- [ ] Heading structure enforced
- [ ] Snippet targeting working
- [ ] Internal linking implemented
- [ ] External linking restricted to approved domains
- [ ] FAQ generation working
- [ ] Readability checks implemented
- [ ] Banned patterns blocked
- [ ] Duplicate detection working
- [ ] Unit tests for generation logic

## Dependencies

- Task 02: Types and Configuration
- Task 04: Keyword Discovery Engine

## Estimated Effort

Large
