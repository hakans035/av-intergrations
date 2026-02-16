# Webflow SEO Engine

Automated SEO content pipeline that discovers keywords, generates articles with AI, and publishes them to the Webflow CMS blog.

## What It Does

- **Keyword Discovery** — AI discovers trending Dutch financial topics weekly
- **Content Generation** — Gemini AI writes SEO-optimized articles in Dutch/English
- **Image Generation** — AI-generated hero and thumbnail images
- **Compliance Checking** — Financial regulatory validation before publishing
- **Approval Workflow** — 3-gate review process (editor → compliance → publisher)
- **Auto-Publishing** — Publishes approved content directly to Webflow CMS

## Architecture

```
src/integrations/seo-engine/
└── lib/
    ├── webflow-api.ts          # Webflow CMS API v2 client
    ├── content-generator.ts    # Gemini AI content generation + validation
    ├── keyword-discovery.ts    # Keyword research + queue management
    ├── image-generator.ts      # AI image generation + Webflow upload
    ├── approval-workflow.ts    # 3-gate approval state machine
    └── compliance-checker.ts   # Financial regulatory compliance

src/app/api/seo-engine/
├── cron/
│   ├── generate/route.ts       # Daily content generation (05:00 CET)
│   └── discover/route.ts       # Weekly keyword discovery (Mon 05:00 CET)
├── content/
│   ├── generate/route.ts       # Manual content generation
│   └── [id]/publish/route.ts   # Publish content to Webflow
├── drafts/
│   └── [id]/publish/route.ts   # Publish draft to Webflow
├── images/
│   └── generate/route.ts       # Generate images for posts
├── keywords/
│   └── discover/route.ts       # Manual keyword discovery
├── webhooks/
│   └── webflow/route.ts        # Webflow webhook handler
└── _shared/
    └── utils.ts                # Shared auth + helpers

src/app/admin/(dashboard)/seo-engine/
├── page.tsx                    # Dashboard (all Webflow posts)
├── [id]/page.tsx               # Post detail view
├── drafts/                     # Draft review pages
├── queue/                      # Keyword queue management
└── generate/                   # Manual generation UI
```

## Environment Variables

```env
# Webflow CMS
WEBFLOW_API_TOKEN=""           # API token from Webflow project settings
WEBFLOW_SITE_ID=""             # Site ID from Webflow dashboard
WEBFLOW_COLLECTION_ID=""       # Blog collection ID
WEBFLOW_WEBHOOK_SECRET=""      # For validating incoming webhooks

# AI Content Generation
GEMINI_API_KEY=""              # Google Gemini API key

# Notifications
SEO_ADMIN_EMAILS=""            # Comma-separated emails for generation alerts
```

Also requires `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN`, `CRON_SECRET`, and `RESEND_API_KEY` (configured elsewhere).

## Webflow API Client

Located at `src/integrations/seo-engine/lib/webflow-api.ts`.

### Features

- **Rate limiting**: 60 req/min, 1000 req/hour (automatic throttling)
- **Retry logic**: Exponential backoff on 409/429/5xx errors (max 5 retries)
- **Bulk operations**: Up to 100 items per request
- **Idempotent upserts**: Uses slug + language as composite key to prevent duplicates

### Key Operations

```typescript
const client = createWebflowClient(apiToken, siteId, collectionId);

// Collection items
client.listItems(limit?, offset?)
client.getItem(itemId)
client.createItem(fieldData, isDraft?)
client.updateItem(itemId, fieldData)
client.upsertItem(fieldData, isDraft?)    // Create or update by slug+language

// Publishing
client.publishItems(itemIds)
client.unpublishItems(itemIds)
client.archiveItems(itemIds)

// Assets
client.uploadAsset(fileBuffer, fileName, displayName?)

// Webhooks
client.validateWebhookSignature(body, signature)
```

### Blog Post Field Mapping

| Webflow Field | Type | Description |
|---|---|---|
| `name` | string | Post title |
| `slug` | string | URL slug |
| `rich-text` | HTML | Article body |
| `post-summary` | string | Summary (max 140 chars) |
| `main-image-2` | image | Hero image (1200x630) |
| `thumbnail-image` | image | Thumbnail (600x400) |
| `meta-title` | string | SEO title (max 60 chars) |
| `meta-description` | string | SEO description (max 160 chars) |
| `language` | string | 'Dutch' or 'English' |
| `source-keyword` | string | Original target keyword |
| `schema-type` | string | 'article' or 'article-faq' |

## Content Generation Pipeline

### 1. Keyword Discovery (Weekly)

Cron: `POST /api/seo-engine/cron/discover` — Mondays at 05:00 CET

1. Gemini AI analyzes 20 Dutch financial topic categories (belasting, pensioen, ondernemer, vermogen, etc.)
2. Evaluates each keyword for: trending score, relevance, competition, angle
3. Filters out: crypto, specific stocks, non-Dutch, niche topics
4. Deduplicates against existing queue + published content
5. Creates 7 keywords with scheduled dates (1 per day)
6. Logs to `seo_discovery_log`

Keywords are stored in the `seo_keyword_queue` table with priority and scheduled dates.

### 2. Content Generation (Daily)

Cron: `POST /api/seo-engine/cron/generate` — Daily at 05:00 CET

1. Gets next pending keyword from queue
2. Generates article using Gemini 2.0 Flash (fallback: 2.5 Flash)
3. Content types:
   - **Short**: 600–900 words
   - **Long**: 1500–2500 words
   - **Mixed**: 1000–1500 words
4. Processes HTML for Webflow compatibility (only h2-h6, p, blockquote, a, strong, em, img)
5. Generates metadata: title, slug, summary, meta tags, schema type
6. Extracts FAQs from H3 questions (3–7 per post)
7. Generates hero + thumbnail images
8. Saves to `seo_content_drafts` table (NOT published yet)
9. Sends email notification to admins
10. Logs to `seo_generation_log`

### 3. Content Processing

**HTML sanitization** — Webflow rich text only supports a subset of HTML:
- Converts `<ul>/<ol>/<li>` to paragraphs with bullet characters
- Strips unsupported tags: div, span, section, table, etc.
- Normalizes headers to sentence case (preserves Dutch acronyms: ZZP, AOW, FOR, BTW, BV, IB, KVK, UWV)

**Link processing**:
- Internal links: `[INTERNAL_LINK:anchor:topic]` → resolves to pillar pages
- External links: `[EXTERNAL_LINK:anchor:domain]` → validates against approved domains (belastingdienst.nl, rijksoverheid.nl, kvk.nl, cbs.nl, nibud.nl, afm.nl, dnb.nl)

### 4. Image Generation

Uses Gemini image models (`gemini-3-pro-image-preview` primary, `gemini-2.5-flash` fallback).

| Category | Dimensions | Aspect Ratio | Use |
|---|---|---|---|
| Hero | 1200x630 | 16:9 | Top of blog post |
| Thumbnail | 600x400 | 3:2 | Article listing |
| Infographic | 800x1200 | 2:3 | Vertical explainer |

Style: Abstract shapes, subtle financial icons (charts, graphs), primary blue (#1062eb). No faces, text, watermarks, or dark colors.

Images are compressed to WebP via Sharp (target < 4MB for Webflow upload limit), then uploaded to Webflow's asset API.

## Compliance & Approval

### Compliance Checker

Runs before publishing to enforce Dutch financial advisory regulations.

**Errors (block publishing)**:
- Guaranteed returns/savings claims
- Unqualified financial promises
- Investment recommendations or advice
- Missing mandatory disclaimer
- Absolute tax law statements without qualifiers ("may", "could", "typically")
- Tax figures without year reference or source citation

**Warnings (advisory)**:
- Urgency language ("Now!", "Limited time", "Act now")
- Superiority claims ("best advisor", "number 1")
- Exclamation marks outside quotes
- Rhetorical questions in headlines
- First-person partnership language ("we help you")

**Mandatory disclaimer** (must appear at end of article):
> "Disclaimer: Dit artikel is uitsluitend bedoeld ter informatie..."

### 3-Gate Approval Workflow

```
draft → pending_review → approved → published
```

| Gate | Reviewer | Checks |
|---|---|---|
| 1. Content Editor | Quality, grammar, structure |
| 2. Compliance Officer | Regulatory compliance |
| 3. Publishing Manager | Final approval |

- Max 3 revisions before escalation
- Can be flagged for legal review
- Full audit trail with 36-month retention

### Content Validation

Before approval, content is validated for:
- Word count within range for content type
- Heading structure (min 2 H2s, no skipped levels)
- Keyword in first 100 words
- Keyword density max 2%
- Readability: Flesch-Douma score 50–60, max 25-word sentences, max 100-word paragraphs
- No lorem ipsum, plain URLs, or duplicate paragraphs

## Database Tables

| Table | Purpose |
|---|---|
| `seo_keyword_queue` | Keywords waiting for content generation (keyword, language, priority, status, scheduled_date) |
| `seo_content_drafts` | Generated content awaiting review (title, body, images, meta, status, webflow_item_id) |
| `seo_keywords` | Keyword research library (keyword, intent, volume, difficulty, status) |
| `seo_generation_log` | Audit trail for content generation runs |
| `seo_discovery_log` | Audit trail for keyword discovery runs |

### Keyword Statuses

```
new → approved → in_progress → used
                              → rejected
                              → expired (after 24 months)
```

### Draft Statuses

```
pending_review → approved → published
                          → archived
```

## Admin UI

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/admin/seo-engine` | All Webflow posts with stats (total, drafts, published) |
| Post Detail | `/admin/seo-engine/[id]` | View post, publish drafts |
| Drafts | `/admin/seo-engine/drafts` | Review generated content |
| Draft Detail | `/admin/seo-engine/drafts/[id]` | Full content editor with approval workflow |
| Queue | `/admin/seo-engine/queue` | Keyword queue, trigger discovery/generate |
| Generate | `/admin/seo-engine/generate` | Manual content generation |

## API Routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/seo-engine/cron/discover` | CRON_SECRET / ADMIN_API_TOKEN | Weekly keyword discovery |
| POST | `/api/seo-engine/cron/generate` | CRON_SECRET / ADMIN_API_TOKEN | Daily content generation |
| POST | `/api/seo-engine/content/generate` | ADMIN_API_TOKEN | Manual content generation |
| POST | `/api/seo-engine/content/[id]/publish` | ADMIN_API_TOKEN | Publish content to Webflow |
| POST | `/api/seo-engine/drafts/[id]/publish` | ADMIN_API_TOKEN | Publish draft to Webflow |
| POST | `/api/seo-engine/images/generate` | ADMIN_API_TOKEN | Generate images for a post |
| POST | `/api/seo-engine/keywords/discover` | ADMIN_API_TOKEN | Manual keyword discovery |
| POST | `/api/seo-engine/webhooks/webflow` | HMAC-SHA256 signature | Handle Webflow events |

## Webflow Setup

### 1. Get API Token

1. Go to Webflow Dashboard → Site Settings → **Integrations**
2. Generate an **API v2 token** with CMS read/write permissions
3. Copy → `WEBFLOW_API_TOKEN`

### 2. Get Site ID

1. Go to Site Settings → **General**
2. Copy the Site ID → `WEBFLOW_SITE_ID`

### 3. Get Collection ID

1. Go to the CMS → Blog Posts collection
2. The collection ID is in the URL or available via the API
3. Copy → `WEBFLOW_COLLECTION_ID`

### 4. Set Up Webhooks (Optional)

1. Go to Site Settings → **Integrations** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/seo-engine/webhooks/webflow`
3. Select triggers: item_created, item_changed, item_deleted, site_publish
4. Copy the webhook secret → `WEBFLOW_WEBHOOK_SECRET`

## Testing Scripts

```bash
# Check blog posts in Webflow
npx tsx scripts/check-blog-post.ts

# Test full SEO engine pipeline
npx tsx scripts/test-seo-engine.ts

# Get specific post content from Webflow
npx tsx scripts/get-post-content.ts
```
