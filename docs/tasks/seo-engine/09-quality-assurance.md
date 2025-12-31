# Task 09: Quality Assurance

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 10: Quality Assurance Checks

## Objective

Implement comprehensive QA checks that run before approval submission and before publication.

## Requirements

### Pre-Approval Checks

Run before submission for review:

| Check | Rule | Action |
|-------|------|--------|
| SEO Title Length | Name <= 60 characters | Block |
| SEO Description Length | Post Summary <= 160 characters | Block |
| Slug Format | Lowercase, hyphens only | Block |
| Heading Structure | One H1, minimum two H2 | Block |
| Keyword Presence | Primary keyword in first 100 words | Warning |
| Word Count | Within range for content type | Warning |
| Internal Links | Minimum 2 present | Block |
| External Links | Only approved domains | Block |
| Disclaimer Present | Disclaimer at end of Post Body | Block |
| Image Present | Main Image populated | Warning |
| Alt Text Present | Alt Text if Main Image exists | Block |
| Language Field | Valid value (nl or en) | Block |

### Pre-Publish Checks

Run before final publication:

| Check | Rule | Action |
|-------|------|--------|
| All Gates Passed | Content Status = approved | Block |
| Compliance Sign-off | Compliance review completed | Block |
| Link Validation | All links return 200 | Block |
| Image Validation | Images accessible | Block |
| Duplicate Check | No existing post with same Slug+Language | Block |
| Plagiarism Check | Similarity < 15% external | Block |
| Schema Validation | JSON-LD valid syntax | Warning |
| Hreflang Check | Alternate reference valid if set | Warning |

### Language Correctness

- Dutch: Spell check against Dutch dictionary
- English: Spell check against British English dictionary
- Grammar check via language processing
- Flag non-standard terminology

### Plagiarism Detection

- Compare against existing posts in collection
- Compare against external content
- Similarity threshold: maximum 15%
- Store content hashes for internal comparison
- Log all plagiarism check results

## Output

Return QAResult with:
- canSubmit: boolean (pre-approval checks passed)
- canPublish: boolean (pre-publish checks passed)
- blockingErrors: array
- warnings: array
- checkResults: object with per-check details

## Acceptance Criteria

- [ ] All pre-approval checks implemented
- [ ] All pre-publish checks implemented
- [ ] Language spell checking working
- [ ] Grammar checking working
- [ ] Link validation working
- [ ] Plagiarism detection working
- [ ] Clear blocking vs warning distinction
- [ ] Detailed check results returned
- [ ] Unit tests for all checks
- [ ] Integration with workflow

## Dependencies

- Task 07: Compliance Checker
- Task 08: SEO Validator

## Estimated Effort

Large
