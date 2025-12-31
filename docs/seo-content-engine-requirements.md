# AmbitionValley AI-Driven SEO Content Engine Technical Requirements

## 1 System Overview

### Goal

Build an automated content engine that discovers trending keywords in the Dutch financial advisory space, generates SEO-optimized blog content in Dutch and English, creates supporting images via Gemini, and publishes to Webflow CMS through its API with mandatory human approval before publication.

### Boundaries

- Product scope: Financial advisory services only (belastingadvies, fiscale planning, vermogensadvies)
- No financial transactions, no investment platforms, no trading functionality
- Target geography: Netherlands
- Languages: Dutch (primary), English (secondary)
- Tone: Professional, corporate, compliance-first, risk-averse
- No direct financial advice; informational content only
- All content requires human review and approval before publication

### High Level Components

- Keyword Discovery Engine: Identifies trending search terms in the Dutch financial advisory domain
- Content Generation Service: Produces blog posts using AI with compliance guardrails
- Image Generation Service: Creates images via Gemini API
- Webflow CMS Integration: Manages content lifecycle via Webflow API
- Human Approval Interface: Dashboard for reviewers to approve, reject, or request revisions
- Quality Assurance Module: Validates SEO, compliance, and content quality
- Performance Monitoring: Tracks published content performance and feeds insights back

---

## 2 Content Safety and Compliance Rules

### Required Financial Disclaimer Text

#### Site-Wide Disclaimer

The following text must appear in the website footer on all pages:

```
De informatie op deze website is uitsluitend bedoeld voor algemene informatieve doeleinden en vormt geen persoonlijk financieel, fiscaal of juridisch advies. AmbitionValley is geen financiele instelling en verricht geen financiele transacties. Raadpleeg altijd een gekwalificeerde adviseur voordat u financiele beslissingen neemt.
```

English equivalent for English pages:

```
The information on this website is intended for general informational purposes only and does not constitute personal financial, tax, or legal advice. AmbitionValley is not a financial institution and does not perform financial transactions. Always consult a qualified advisor before making financial decisions.
```

#### Per-Post Disclaimer

Each blog post must include a disclaimer block at the end of the Post Body:

```
Disclaimer: Dit artikel is uitsluitend bedoeld ter informatie en vormt geen persoonlijk advies. De genoemde bedragen, regelingen en percentages kunnen wijzigen. Raadpleeg een gekwalificeerde adviseur voor uw specifieke situatie.
```

English equivalent:

```
Disclaimer: This article is for informational purposes only and does not constitute personal advice. The amounts, regulations, and percentages mentioned are subject to change. Consult a qualified advisor for your specific situation.
```

### Prohibited Claims and Wording Patterns

The following patterns must be blocked during content generation:

- Guaranteed returns or savings (e.g., "gegarandeerde besparing", "guaranteed savings")
- Specific tax reduction promises without qualification (e.g., "u bespaart exact X euro")
- Investment recommendations (e.g., "investeer in", "buy this stock")
- Urgency language (e.g., "nu handelen", "act now", "limited time")
- Absolute statements about tax law (e.g., "altijd", "never", "always allowed")
- Comparisons claiming superiority over competitors
- Claims of expertise without qualification (e.g., "de beste", "the best")
- Medical or health-related financial advice
- Cryptocurrency or speculative investment content

### Tone Restrictions

- Professional and neutral; no casual or conversational language
- No exclamation marks except in direct quotes
- No rhetorical questions in headlines
- No first-person plural implying partnership (e.g., "wij helpen u besparen")
- No superlatives without factual substantiation
- No emotional appeals or fear-based messaging

### Risk Controls for Tax and Investment Topics

- All tax figures must include the year and source reference
- Statements about tax law must include phrases such as "volgens de huidige regelgeving" or "as of [year]"
- Investment-related content must explicitly state that AmbitionValley does not provide investment advice
- Content discussing tax optimization must clarify legal boundaries
- Any mention of specific tax rates or thresholds must be verifiable against official sources (Belastingdienst, Rijksoverheid)

### Human Review Requirements and Approval Gates

| Gate | Trigger | Required Reviewer | Actions |
|------|---------|-------------------|---------|
| Draft Review | Content generation complete | Content Editor | Approve, Reject, Request Revision |
| Compliance Review | Draft approved by Content Editor | Compliance Officer | Approve, Reject, Flag for Legal |
| Final Approval | Compliance approved | Publishing Manager | Publish, Schedule, Reject |

- No content may be published without passing all three gates
- Rejection at any gate returns content to draft status with mandatory revision
- All review actions must be logged with timestamp, reviewer ID, and comments

---

## 3 Webflow CMS Data Model and Field Mapping

### Existing Fields Mapping

| Field Name | Type | Required | Usage | Population Rule |
|------------|------|----------|-------|-----------------|
| Name | Plain text | Yes | Blog post title; used as H1 | AI-generated; must follow SEO title rules; max 60 characters |
| Slug | Plain text | Yes | URL path segment | Auto-generated from Name; lowercase; hyphens for spaces; no special characters |
| Main Image | Image | No | Hero image at top of post | Uploaded via Webflow API after Gemini generation; 1200x630px minimum |
| Thumbnail image | Image | No | Preview image in listings | Uploaded via Webflow API; 600x400px; cropped version of Main Image or separate generation |
| Post Body | Rich text | No | Full article content | AI-generated; includes headings, paragraphs, lists, internal links; ends with disclaimer |
| Post Summary | Plain text | No | Excerpt for listings and meta description base | AI-generated; max 160 characters; no line breaks |
| Featured? | Switch | No | Marks post for homepage feature | Default: false; manually set by Publishing Manager |
| Next Post | Reference | No | Links to next post in series | Optional; populated manually if part of a series; otherwise left empty |
| Previous Post | Reference | No | Links to previous post in series | Optional; populated manually if part of a series; otherwise left empty |
| Alt Text | Plain text | No | Alt text for Main Image | AI-generated based on image content; max 125 characters; descriptive |
| Author Image | Image | No | Profile image of author | Uploaded once per author; reused via reference or direct upload |
| Author Name | Plain text | No | Display name of author | Static value per author; e.g., "AmbitionValley Redactie" |

### Rules for Next Post and Previous Post Fields

- These fields are retained and not deleted
- For standalone posts: leave fields empty (null value via API)
- For series posts: populate manually through Webflow CMS interface or via API if series structure is defined
- Automation does not auto-populate these fields; they are excluded from automated workflows

### Language Handling Strategy

Since Webflow CMS does not natively support multi-language within a single collection, the following approach applies:

- Create separate Blog Posts collection items for Dutch and English versions
- Use a naming convention to link versions: `{base-slug}-nl` and `{base-slug}-en`
- Add a new field (see below) to store language code and link to alternate version

### Additional Fields Required

| Field Name | Type | Required | Purpose | Population Rule | Default Value |
|------------|------|----------|---------|-----------------|---------------|
| Language | Option | Yes | Identifies content language | Set during creation; values: "nl", "en" | "nl" |
| Alternate Language Post | Reference | No | Links to translated version of same content | Populated after both versions exist; references other collection item | Empty |
| Content Status | Option | Yes | Tracks approval workflow state | Updated by automation; values: "draft", "pending_review", "approved", "published", "archived" | "draft" |
| Source Keyword | Plain text | No | Primary keyword that triggered content creation | Populated during keyword selection | Empty |
| Generation Timestamp | Plain text | No | ISO 8601 timestamp of content generation | Set during draft creation | Empty |
| Last Reviewed By | Plain text | No | Reviewer identifier | Updated after each review gate | Empty |
| Review Notes | Plain text | No | Comments from reviewers | Updated during review process | Empty |
| Meta Title | Plain text | No | Custom SEO title if different from Name | AI-generated; max 60 characters | Empty (falls back to Name) |
| Meta Description | Plain text | No | SEO meta description | AI-generated; max 160 characters | Empty (falls back to Post Summary) |
| Canonical URL | Plain text | No | Canonical URL if cross-posted | Set manually if needed | Empty |
| Schema Type | Option | No | Primary schema markup type | Values: "Article", "FAQPage", "Article+FAQ" | "Article" |
| Thumbnail Alt Text | Plain text | No | Alt text for Thumbnail image | AI-generated; max 125 characters | Empty |

---

## 4 Webflow API Integration Requirements

### Authentication Approach

- Use Webflow API v2 with OAuth 2.0 or API Token authentication
- Store API token in environment variables; never commit to version control
- Token naming convention: `WEBFLOW_API_TOKEN_{ENV}` where ENV is DEV, STAGING, or PROD
- Tokens must have scopes: `cms:read`, `cms:write`, `assets:read`, `assets:write`

### Environment Separation

| Environment | Purpose | Webflow Site | API Token Variable |
|-------------|---------|--------------|-------------------|
| Development | Local testing and feature development | Separate dev site or collection | WEBFLOW_API_TOKEN_DEV |
| Staging | Pre-production review and QA | Staging site clone | WEBFLOW_API_TOKEN_STAGING |
| Production | Live content | Production site | WEBFLOW_API_TOKEN_PROD |

- Each environment uses a distinct Webflow site or collection
- Staging mirrors production structure exactly
- Promotion from staging to production requires manual trigger

### Content Lifecycle Actions

| Action | API Endpoint | Method | Notes |
|--------|--------------|--------|-------|
| Create Draft | `/collections/{collection_id}/items` | POST | Set `_draft: true` and Content Status to "draft" |
| Update Draft | `/collections/{collection_id}/items/{item_id}` | PATCH | Update fields; keep `_draft: true` |
| Submit for Review | `/collections/{collection_id}/items/{item_id}` | PATCH | Set Content Status to "pending_review" |
| Publish | `/collections/{collection_id}/items/{item_id}` | PATCH | Set `_draft: false`, `_archived: false`, Content Status to "published" |
| Unpublish | `/collections/{collection_id}/items/{item_id}` | PATCH | Set `_draft: true`, Content Status to "archived" |
| Delete | `/collections/{collection_id}/items/{item_id}` | DELETE | Soft delete; archive first |

### Rate Limits and Retry Strategy

- Webflow API rate limit: 60 requests per minute (standard plan)
- Implement exponential backoff with jitter
- Initial retry delay: 1 second
- Maximum retries: 5
- Backoff multiplier: 2
- Maximum delay cap: 60 seconds
- Log all rate limit responses with request details

### Idempotency Strategy

- Before creating a new item, query existing items by Slug and Language
- If item exists with same Slug and Language, perform update instead of create
- Store Generation Timestamp to track version
- Use Source Keyword + Language + Date as composite identifier for deduplication

### Error Handling and Logging Requirements

| Error Type | Handling | Logging Level |
|------------|----------|---------------|
| 401 Unauthorized | Halt; alert operations; do not retry | ERROR |
| 403 Forbidden | Halt; check permissions; alert operations | ERROR |
| 404 Not Found | Log and skip; item may have been deleted | WARN |
| 409 Conflict | Retry with fresh data fetch | WARN |
| 422 Validation Error | Log details; return to draft for correction | ERROR |
| 429 Rate Limited | Retry with exponential backoff | WARN |
| 500+ Server Error | Retry up to maximum; then halt and alert | ERROR |

- All API calls must be logged with: timestamp, endpoint, method, request ID, response status, duration
- Error logs must include full response body for debugging

### Webhook Usage

- Configure Webflow webhook for `collection_item_changed` event
- Use webhook to trigger external systems (analytics, cache invalidation)
- Webhook endpoint must validate Webflow signature header
- Process webhooks asynchronously; return 200 immediately

### Data Validation Before API Calls

- Validate Name: non-empty, max 60 characters
- Validate Slug: lowercase, alphanumeric with hyphens only, max 100 characters
- Validate Post Body: non-empty, contains at least one H2 heading
- Validate Post Summary: max 160 characters
- Validate Alt Text: max 125 characters if Main Image present
- Validate Language: must be "nl" or "en"
- Validate Content Status: must be valid option value
- Reject API call if validation fails; log validation errors

---

## 5 Keyword Discovery Engine

### Trend Discovery Method

- Query search trend APIs for rising keywords in financial advisory categories
- Focus on keywords related to: belastingadvies, fiscale planning, vermogensadvies, ondernemersaftrek, Box 3, belastingaangifte, BTW, loonheffing, pensioenopbouw
- Filter for Netherlands geographic region
- Separate Dutch and English keyword streams

### Approved Data Sources

| Source | Purpose | Access Method |
|--------|---------|---------------|
| Google Trends | Trending search terms | Google Trends API or scraping with rate limits |
| Google Search Console | Existing site query data | Search Console API with site verification |
| Ahrefs or SEMrush | Keyword difficulty and volume | API with subscription |
| AnswerThePublic | Question-based keywords | API or export |
| Belastingdienst.nl | Official terminology verification | Manual reference |

- No other data sources are approved without explicit addition to this list

### Frequency and Scheduling

- Keyword discovery runs daily at 06:00 CET
- Weekly deep analysis every Monday at 05:00 CET
- Monthly trend report generated on first day of month

### Language Separation

- Maintain two separate keyword queues: `keywords_nl` and `keywords_en`
- Dutch keywords: sourced from nl-NL locale data
- English keywords: sourced from en-NL and en-GB locale data
- Cross-reference to avoid duplicate topics across languages

### Intent Classification

| Intent Type | Definition | Content Approach |
|-------------|------------|------------------|
| Informational | User seeks knowledge (e.g., "wat is Box 3") | Educational article with definitions |
| Transactional | User seeks service (e.g., "belastingadviseur Amsterdam") | Service-focused content with CTA to contact |
| Local | User seeks location-specific info (e.g., "fiscalist Utrecht") | Location-targeted content |

- Classify each keyword before content generation
- Store intent classification with keyword record

### Storage and Versioning

- Store keywords in database table with fields: keyword, language, intent, volume, difficulty, discovered_date, status, last_used
- Status values: "new", "approved", "used", "rejected", "expired"
- Retain keyword history for 24 months
- Version keyword lists with date stamp for audit trail

---

## 6 Content Generation Requirements

### Content Types and Word Count

| Type | Word Count Range | Use Case |
|------|------------------|----------|
| Short | 600-900 words | Quick answers, definitions, news updates |
| Long | 1500-2500 words | Comprehensive guides, pillar content |
| Mixed | 1000-1500 words | Standard blog posts, topic overviews |

- Default type: Mixed
- Type selection based on keyword intent and competition analysis

### Structure Rules for SEO

- Exactly one H1 per post (the Name field rendered as H1)
- Minimum two H2 headings per post
- H3 headings under H2 sections where appropriate
- No skipping heading levels (H1 to H3 without H2)
- First paragraph must contain primary keyword within first 100 words
- Conclusion section required with H2 heading

### Snippet Targeting Rules

- Include a concise definition (40-60 words) after the first H2 for definition keywords
- Use bullet lists (3-7 items) for list-based queries
- Use numbered lists for step-by-step processes
- Format FAQ sections with question as H3 and answer as paragraph

### Internal Linking Rules

- Each post must contain minimum 2 internal links
- Link to relevant pillar pages (e.g., /diensten/belastingadvies)
- Link to related blog posts within same topic cluster
- Anchor text must be descriptive; no "click here" or "read more"
- Maximum 5 internal links per 1000 words

### External Linking Rules

Approved external link domains:

- belastingdienst.nl
- rijksoverheid.nl
- kvk.nl
- cbs.nl
- nibud.nl
- afm.nl
- dnb.nl

- All external links must open in new tab (target="_blank")
- All external links must have rel="noopener noreferrer"
- Maximum 3 external links per post
- No links to competitors, affiliate sites, or unverified sources

### FAQ Requirements

- Posts targeting question keywords must include FAQ section
- Minimum 3 questions, maximum 7 questions
- Questions must be in natural language matching search queries
- Answers must be 40-80 words each
- FAQ section placed before conclusion

### Readability Constraints

- Target Flesch-Douma score: 50-60 for Dutch content
- Maximum sentence length: 25 words average
- Maximum paragraph length: 100 words
- No passive voice exceeding 15% of sentences
- No jargon without explanation
- Define technical terms on first use

### Banned Patterns

- Keyword stuffing (same keyword more than 2% density)
- Duplicate paragraphs within same post
- Lorem ipsum or placeholder text
- URLs in plain text (must be hyperlinked)
- Empty headings
- Headings that are questions followed by single-sentence answers

### Duplicate Avoidance Strategy

- Before generation, check existing posts for same primary keyword
- If Dutch version exists, English version must have distinct angle or updated information
- Use semantic similarity check (minimum 30% content difference required)
- Store content hashes for plagiarism detection

---

## 7 SEO Metadata and On-Page Requirements

### Meta Title Rules

- Maximum 60 characters including spaces
- Primary keyword within first 40 characters
- Brand name at end: "| AmbitionValley"
- No duplicate meta titles across site
- Store in Meta Title field; fall back to Name if empty

### Meta Description Rules

- Maximum 160 characters including spaces
- Primary keyword included naturally
- Contains call to action or value proposition
- No duplicate meta descriptions across site
- Store in Meta Description field; fall back to Post Summary if empty

### URL Slug Rules

- Maximum 75 characters
- Lowercase only
- Words separated by hyphens
- No stop words (de, het, een, the, a, an) unless necessary for meaning
- Primary keyword included
- No dates in URL unless time-sensitive content
- Format: `/blog/{slug}` for Dutch, `/en/blog/{slug}` for English

### Canonical Handling

- Self-referencing canonical by default
- If content exists on multiple URLs, set canonical to primary version
- Store in Canonical URL field if override needed
- Webflow handles canonical tag in page settings; use custom code embed if API does not support

### Hreflang Requirements

- Dutch posts: `hreflang="nl"` pointing to Dutch URL
- English posts: `hreflang="en"` pointing to English URL
- Each post must include alternate hreflang pointing to translated version
- Use Alternate Language Post field to determine linked version
- Implement via Webflow custom code in page head or site-wide embed

Example implementation for head:

```html
<link rel="alternate" hreflang="nl" href="https://ambitionvalley.nl/blog/{slug-nl}" />
<link rel="alternate" hreflang="en" href="https://ambitionvalley.nl/en/blog/{slug-en}" />
<link rel="alternate" hreflang="x-default" href="https://ambitionvalley.nl/blog/{slug-nl}" />
```

### Schema Markup Requirements

#### Article Schema (all posts)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{Name}",
  "description": "{Post Summary}",
  "image": "{Main Image URL}",
  "author": {
    "@type": "Organization",
    "name": "AmbitionValley"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AmbitionValley",
    "logo": {
      "@type": "ImageObject",
      "url": "https://ambitionvalley.nl/logo.png"
    }
  },
  "datePublished": "{publish date ISO 8601}",
  "dateModified": "{last modified date ISO 8601}"
}
```

#### FAQ Schema (when FAQ section present)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{question text}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{answer text}"
      }
    }
  ]
}
```

- Schema Type field determines which schema to render
- Implement via Webflow custom code embed in collection template
- Use dynamic embeds pulling from CMS fields

### Image SEO Rules

#### File Naming

- Format: `{primary-keyword}-{descriptor}-{dimensions}.{extension}`
- Example: `belastingadvies-mkb-hero-1200x630.webp`
- Lowercase only, hyphens for spaces
- No special characters or spaces

#### Alt Text

- Descriptive of image content
- Include primary keyword naturally if relevant
- Maximum 125 characters
- Store in Alt Text field for Main Image
- Store in Thumbnail Alt Text field for Thumbnail image

#### Compression

- WebP format preferred
- JPEG fallback for compatibility
- Maximum file size: 200KB for hero images, 100KB for thumbnails
- Compression quality: 80-85%

---

## 8 Gemini Image Generation Requirements

### Image Categories

| Category | Purpose | Dimensions | Aspect Ratio |
|----------|---------|------------|--------------|
| Hero | Main Image at top of post | 1200x630px | 1.91:1 |
| Thumbnail | Preview in listings | 600x400px | 3:2 |
| Infographic | Data visualization within post | 800x1200px | 2:3 |

### Resolution Targets

- Hero images: minimum 1200x630px, maximum 2400x1260px
- Thumbnail images: exactly 600x400px
- Infographics: minimum 800x1200px
- Output format: PNG for generation, convert to WebP for storage

### Corporate Clean Style Guidelines

- Color palette: AmbitionValley brand colors (blues, whites, professional tones)
- Style: Clean, minimalist, professional
- No people faces (avoid likeness issues)
- Abstract geometric patterns acceptable
- Icons and simple illustrations preferred
- No stock photo appearance
- No text in images (text added separately if needed)
- White or light gradient backgrounds

### Prompt Structure

Base prompt template:

```
Create a professional, corporate illustration for a financial advisory blog post about {topic}.
Style: Clean, minimalist, modern corporate design.
Color palette: Professional blues (#1062eb), white, light grays.
Include: Abstract geometric shapes, subtle financial iconography (charts, graphs, documents).
Exclude: Human faces, text, cluttered elements, stock photo style.
Background: Clean white or subtle light gradient.
Purpose: {hero|thumbnail|infographic}
```

### Negative Prompts

Include in all image generation requests:

```
Negative: human faces, realistic people, text, words, letters, numbers, watermarks, logos, cluttered backgrounds, dark colors, red warning colors, stock photo style, clipart, cartoons, 3D renders, photorealistic
```

### Alt Text Generation Rules

- Generate alt text immediately after image creation
- Alt text must describe the visual content accurately
- Include context of how image relates to article topic
- Format: "{Description of visual elements} illustrating {topic}"
- Example: "Abstract geometric shapes with upward trending chart lines illustrating tax optimization strategies"

### Storage and Naming Conventions

- Store generated images in Webflow Assets via API
- File naming: `{slug}-{category}-{timestamp}.webp`
- Maintain mapping between post Slug and associated images
- Store original PNG in separate archive for regeneration needs

### Association with Posts

- Upload Main Image to Webflow Assets; retrieve asset ID
- Set Main Image field to asset reference
- Upload Thumbnail image separately; retrieve asset ID
- Set Thumbnail image field to asset reference
- Alt Text and Thumbnail Alt Text fields populated with generated descriptions

---

## 9 Publishing Workflow

### Step 1: Keyword Selection

- Keyword Discovery Engine provides ranked keyword list
- Content Editor selects keyword from approved queue
- Keyword status updated to "in_progress"
- Record keyword selection with timestamp and editor ID

### Step 2: Draft Generation

- AI generates content based on keyword, intent, and content type
- Images generated via Gemini
- Draft assembled with all fields populated
- Compliance checks run automatically
- Generation Timestamp recorded

### Step 3: Draft Saved to Webflow CMS

- API call creates new collection item with `_draft: true`
- Content Status set to "draft"
- All fields populated per mapping rules
- Next Post and Previous Post left empty unless series
- API response logged with item ID

### Step 4: Human Approval Steps

#### Gate 1: Content Editor Review

- Editor accesses draft via Webflow CMS or approval dashboard
- Reviews: accuracy, readability, tone, completeness
- Actions: Approve (proceed to Gate 2), Reject (return to generation), Request Revision (flag specific sections)
- Update Last Reviewed By and Review Notes

#### Gate 2: Compliance Officer Review

- Compliance officer reviews approved draft
- Checks: disclaimer presence, prohibited claims, risk language, source citations
- Actions: Approve (proceed to Gate 3), Reject (return to draft), Flag for Legal (escalate)
- Update Last Reviewed By and Review Notes

#### Gate 3: Publishing Manager Approval

- Final review of approved content
- Verifies all checks passed
- Actions: Publish (immediate), Schedule (set future date), Reject (return to draft)

### Step 5: Revision Loop

- Rejected content returns to Step 2 or Step 4a depending on rejection gate
- Review Notes field contains required changes
- Revision count tracked (maximum 3 revisions before escalation)
- All revisions logged with diffs

### Step 6: Final Publish

- API call updates item: `_draft: false`, `_archived: false`
- Content Status set to "published"
- Publish timestamp recorded
- Webflow site publish triggered if required
- Confirmation logged

### Step 7: Rollback Strategy

- If post-publish issues discovered, immediate unpublish via API
- Set `_draft: true`, Content Status to "archived"
- Log rollback with reason
- Notify Content Editor and Compliance Officer
- Retain previous versions via Generation Timestamp for recovery

### Audit Trail Requirements

- All workflow actions logged in database
- Log entry fields: timestamp, action, actor_id, item_id, previous_state, new_state, notes
- Retention: 36 months
- Audit log immutable; no deletions permitted

---

## 10 Quality Assurance Checks

### Pre-Approval Checks (before submission for review)

| Check | Validation Rule | Failure Action |
|-------|-----------------|----------------|
| SEO Title Length | Name <= 60 characters | Block submission |
| SEO Description Length | Post Summary <= 160 characters | Block submission |
| Slug Format | Lowercase, hyphens only, no special characters | Block submission |
| Heading Structure | Exactly one H1, minimum two H2 | Block submission |
| Keyword Presence | Primary keyword in first 100 words | Warning |
| Word Count | Within range for content type | Warning |
| Internal Links | Minimum 2 internal links present | Block submission |
| External Links | Only approved domains | Block submission |
| Disclaimer Present | Disclaimer text at end of Post Body | Block submission |
| Image Present | Main Image field populated | Warning |
| Alt Text Present | Alt Text field populated if Main Image exists | Block submission |
| Language Field | Valid value (nl or en) | Block submission |

### Pre-Publish Checks (before final publication)

| Check | Validation Rule | Failure Action |
|-------|-----------------|----------------|
| All Gates Passed | Content Status = "approved" | Block publish |
| Compliance Sign-off | Compliance review completed | Block publish |
| Link Validation | All internal and external links return 200 | Block publish |
| Image Validation | Main Image and Thumbnail image accessible | Block publish |
| Duplicate Check | No existing post with same Slug and Language | Block publish |
| Plagiarism Check | Content similarity < 15% with external sources | Block publish |
| Schema Validation | JSON-LD schema valid syntax | Warning |
| Hreflang Check | Alternate Language Post reference valid if set | Warning |

### Language Correctness

- Dutch content: Spell check against Dutch dictionary
- English content: Spell check against British English dictionary
- Grammar check via language processing tool
- Flag non-standard terminology for manual review

### Plagiarism and Duplication Checks

- Compare generated content against:
  - Existing posts in same collection
  - External content via plagiarism detection API
- Similarity threshold: maximum 15%
- Hash storage for internal comparison
- Log all plagiarism check results

---

## 11 Performance Monitoring and Feedback Loop

### Metrics Tracked

| Metric | Source | Purpose |
|--------|--------|---------|
| Impressions | Google Search Console | Visibility measurement |
| Clicks | Google Search Console | Traffic from search |
| Average Position | Google Search Console | Ranking performance |
| CTR | Google Search Console | Title/description effectiveness |
| Page Views | Web Analytics | Overall traffic |
| Time on Page | Web Analytics | Content engagement |
| Bounce Rate | Web Analytics | Content relevance |
| Scroll Depth | Web Analytics | Content consumption |
| Conversions | Web Analytics | Lead generation attribution |

### Data Collection

- Connect Google Search Console via API
- Connect web analytics platform via API
- Daily data sync at 07:00 CET
- Store metrics per post with date dimension

### Content Performance Review Cadence

| Review Type | Frequency | Participants | Output |
|-------------|-----------|--------------|--------|
| Weekly Performance | Every Monday | Content Editor | Underperforming posts flagged |
| Monthly Analysis | First week of month | Content Team | Trend report and keyword adjustments |
| Quarterly Strategy | First month of quarter | Content Team + Management | Strategy refinement |

### Rules for Updating Existing Posts

Trigger conditions for content update:

- Post older than 6 months with declining traffic (>20% drop)
- Tax law changes affecting post content
- New related keywords with high volume discovered
- Factual inaccuracies identified
- User feedback indicating confusion

Update process:

- Create revision in draft status
- Follow same approval workflow as new content
- Preserve original publish date; update modified date
- Log all changes with diff

### Versioning Strategy for Revisions

- Each revision stored with incremented version number
- Version format: `v{major}.{minor}` where major = structural changes, minor = text edits
- Retain all versions for 24 months
- Version history accessible via Generation Timestamp + version field
- Enable rollback to any previous version

---

## Appendix: Field Summary Table

### Existing Fields (Unchanged)

| Field | Type | Required | Automated |
|-------|------|----------|-----------|
| Name | Plain text | Yes | Yes |
| Slug | Plain text | Yes | Yes |
| Main Image | Image | No | Yes |
| Thumbnail image | Image | No | Yes |
| Post Body | Rich text | No | Yes |
| Post Summary | Plain text | No | Yes |
| Featured? | Switch | No | No (manual) |
| Next Post | Reference | No | No (manual) |
| Previous Post | Reference | No | No (manual) |
| Alt Text | Plain text | No | Yes |
| Author Image | Image | No | No (manual) |
| Author Name | Plain text | No | No (manual) |

### New Fields (To Be Added)

| Field | Type | Required | Automated |
|-------|------|----------|-----------|
| Language | Option | Yes | Yes |
| Alternate Language Post | Reference | No | Yes |
| Content Status | Option | Yes | Yes |
| Source Keyword | Plain text | No | Yes |
| Generation Timestamp | Plain text | No | Yes |
| Last Reviewed By | Plain text | No | Yes |
| Review Notes | Plain text | No | Yes |
| Meta Title | Plain text | No | Yes |
| Meta Description | Plain text | No | Yes |
| Canonical URL | Plain text | No | No (manual) |
| Schema Type | Option | No | Yes |
| Thumbnail Alt Text | Plain text | No | Yes |
