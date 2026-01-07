# SEO Content Engine Integration

AI-driven SEO content engine for AmbitionValley that generates blog content, manages approval workflows, and publishes to Webflow CMS.

## Purpose

This integration automates the creation of SEO-optimized blog content for Dutch financial advisory services. It handles:

- Keyword discovery and trend analysis
- AI-powered content generation (Dutch and English)
- Image generation via Gemini
- Compliance validation for financial content
- Multi-gate approval workflow
- Publishing to Webflow CMS
- Performance monitoring and feedback loop

## Installation

The integration is part of the main application. No additional installation required.

## Environment Variables

Required environment variables in `.env.local`:

```bash
# API Authentication
ADMIN_API_TOKEN=your-secure-admin-token      # For API route authentication

# Webflow CMS API
WEBFLOW_API_TOKEN=your-webflow-api-token     # Webflow API v2 token
WEBFLOW_SITE_ID=your-site-id                 # Webflow site ID
WEBFLOW_COLLECTION_ID=your-collection-id    # Blog posts collection ID
WEBFLOW_WEBHOOK_SECRET=your-webhook-secret   # Optional: webhook signature verification

# Gemini API (for image generation)
GEMINI_API_KEY=your-gemini-api-key           # Google AI Studio API key

# Supabase (already configured)
# NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

**For detailed setup instructions, see: `docs/seo-engine-setup.md`**

## Usage

### Import Types and Configuration

```typescript
import {
  // Types
  type Keyword,
  type ContentDraft,
  type WebflowBlogPost,

  // Configuration
  webflowConfig,
  contentConfig,

  // Constants
  APPROVED_EXTERNAL_DOMAINS,
  POST_DISCLAIMER,
} from '@/integrations/seo-engine';
```

### Webflow Field Slugs

```typescript
import { WEBFLOW_FIELD_SLUGS } from '@/integrations/seo-engine';

// Access field slugs for API calls
const titleField = WEBFLOW_FIELD_SLUGS.NAME; // 'name'
const bodyField = WEBFLOW_FIELD_SLUGS.POST_BODY; // 'rich-text'
const languageField = WEBFLOW_FIELD_SLUGS.LANGUAGE; // 'language'
```

## Folder Structure

```
seo-engine/
├── components/           # React UI components
│   └── index.ts
├── lib/                  # Business logic
│   ├── webflow-api.ts    # Webflow API client
│   ├── keyword-discovery.ts
│   ├── content-generator.ts
│   ├── image-generator.ts
│   ├── compliance-checker.ts
│   ├── seo-validator.ts
│   ├── quality-assurance.ts
│   └── index.ts
├── hooks/                # React hooks
│   └── index.ts
├── types.ts              # TypeScript types
├── config.ts             # Configuration
├── constants.ts          # Constants and rules
├── index.ts              # Public exports
└── README.md
```

## API Reference

### Types

| Type | Description |
|------|-------------|
| `Language` | Content language (`'nl'` or `'en'`) |
| `ContentStatus` | Workflow status (`'draft'`, `'pending_review'`, etc.) |
| `Keyword` | Discovered keyword with metadata |
| `ContentDraft` | Generated content draft |
| `WebflowBlogPost` | Webflow CMS blog post item |

### Configuration Objects

| Config | Description |
|--------|-------------|
| `webflowConfig` | Webflow API settings |
| `contentConfig` | Content generation rules |
| `imageConfig` | Image generation settings |
| `approvalConfig` | Approval workflow settings |
| `keywordConfig` | Keyword discovery settings |

### Constants

| Constant | Description |
|----------|-------------|
| `SITE_DISCLAIMER` | Footer disclaimer text (NL/EN) |
| `POST_DISCLAIMER` | Per-post disclaimer text (NL/EN) |
| `PROHIBITED_PATTERNS` | Blocked content patterns |
| `APPROVED_EXTERNAL_DOMAINS` | Allowed external link domains |

## Approval Workflow

Content goes through three approval gates:

1. **Content Editor** - Reviews accuracy, readability, tone
2. **Compliance Officer** - Reviews disclaimers, prohibited claims
3. **Publishing Manager** - Final approval before publish

## API Routes

All routes require Bearer token authentication: `Authorization: Bearer <ADMIN_API_TOKEN>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/seo-engine/keywords/discover` | Discover new keywords |
| GET | `/api/seo-engine/keywords/queue` | List queued keywords |
| PATCH | `/api/seo-engine/keywords/[id]` | Update keyword status |
| POST | `/api/seo-engine/content/generate` | Generate content prompt |
| GET | `/api/seo-engine/content/drafts` | List content drafts |
| GET/PATCH | `/api/seo-engine/content/[id]` | Get/update a draft |
| POST | `/api/seo-engine/content/[id]/publish` | Publish to Webflow |
| GET | `/api/seo-engine/approval/pending` | List pending approvals |
| POST | `/api/seo-engine/approval/[id]` | Submit approval decision |
| POST | `/api/seo-engine/images/generate` | Generate image with Gemini |
| GET | `/api/seo-engine/performance/metrics` | Get performance metrics |
| POST | `/api/seo-engine/performance/sync` | Sync performance data |
| POST | `/api/seo-engine/webhooks/webflow` | Webflow webhook handler |

## Related Documentation

- **Setup Guide**: `docs/seo-engine-setup.md`
- Full specification: `docs/seo-content-engine-requirements.md`
- Task breakdown: `docs/tasks/seo-engine/`
- CMS setup script: `scripts/webflow-cms-setup.ts`
