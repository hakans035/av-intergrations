# Task 04: Keyword Discovery Engine

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 5: Keyword Discovery Engine

## Objective

Implement keyword discovery functionality for trending Dutch financial advisory topics.

## Requirements

### Data Sources

Integrate with approved sources only:
- Google Trends (API or rate-limited scraping)
- Google Search Console API
- Ahrefs or SEMrush API (if subscription available)
- AnswerThePublic (API or export)

### Keyword Categories

Focus on Dutch financial advisory terms:
- belastingadvies
- fiscale planning
- vermogensadvies
- ondernemersaftrek
- Box 3
- belastingaangifte
- BTW
- loonheffing
- pensioenopbouw

### Language Separation

- Maintain separate queues: keywords_nl and keywords_en
- Dutch: nl-NL locale data
- English: en-NL and en-GB locale data
- Cross-reference to avoid duplicate topics

### Intent Classification

Classify each keyword by intent:
- Informational: User seeks knowledge
- Transactional: User seeks service
- Local: User seeks location-specific info

### Scheduling

- Daily discovery: 06:00 CET
- Weekly deep analysis: Monday 05:00 CET
- Monthly trend report: First day of month

### Storage

Store keywords in database with fields:
- keyword
- language
- intent
- volume
- difficulty
- discovered_date
- status (new, approved, used, rejected, expired)
- last_used

Retain history for 24 months.

## Acceptance Criteria

- [ ] Keyword discovery function implemented
- [ ] At least one data source integrated
- [ ] Language separation working
- [ ] Intent classification working
- [ ] Database storage implemented
- [ ] Duplicate detection working
- [ ] Scheduling capability defined
- [ ] Keyword status management working
- [ ] Unit tests for discovery logic

## Dependencies

- Task 02: Types and Configuration
- Task 03: Webflow API Client (for existing content check)

## Estimated Effort

Large
