# SEO Content Engine - Setup Guide

This guide explains how to configure the environment variables and API keys required for the SEO Content Engine.

## Required Environment Variables

Add the following to your `.env.local` file:

```env
# =============================================================================
# SEO Content Engine API Authentication
# =============================================================================

# Admin API token for authenticating API requests
# Generate a secure random string (min 32 characters)
# Used in Authorization header: Bearer <ADMIN_API_TOKEN>
ADMIN_API_TOKEN=your-secure-admin-token-here

# =============================================================================
# Webflow CMS Integration
# =============================================================================

# Webflow API Token (v2)
# Get from: Webflow Dashboard > Site Settings > Integrations > API Access
# Required scopes: cms:read, cms:write, assets:read, assets:write
WEBFLOW_API_TOKEN=your-webflow-api-token

# Webflow Site ID
# Find in: Webflow Dashboard > Site Settings > General > Site ID
# Or from the URL: https://webflow.com/design/[site-id]
WEBFLOW_SITE_ID=your-site-id

# Webflow Blog Posts Collection ID
# Find by running: npx tsx scripts/webflow-cms-setup.ts
# Or from Webflow API: GET /sites/{site_id}/collections
WEBFLOW_COLLECTION_ID=your-blog-posts-collection-id

# Webflow Webhook Secret (optional, for webhook signature verification)
# Generate a secure random string
# Configure in: Webflow Dashboard > Site Settings > Integrations > Webhooks
WEBFLOW_WEBHOOK_SECRET=your-webhook-secret

# =============================================================================
# Google Gemini API (Image Generation)
# =============================================================================

# Gemini API Key
# Get from: https://aistudio.google.com/app/apikey
# Used for AI-powered image generation
GEMINI_API_KEY=your-gemini-api-key

# =============================================================================
# Supabase (Database)
# =============================================================================

# Already configured in your project:
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step-by-Step Setup

### 1. Generate Admin API Token

Generate a secure random token for API authentication:

```bash
# Using OpenSSL
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add this as `ADMIN_API_TOKEN` in your `.env.local`.

### 2. Set Up Webflow API Access

1. Go to [Webflow Dashboard](https://webflow.com/dashboard)
2. Open your site settings
3. Navigate to **Integrations** > **API Access**
4. Generate a new API token with these scopes:
   - `cms:read` - Read CMS collections and items
   - `cms:write` - Create/update CMS items
   - `assets:read` - Read uploaded assets
   - `assets:write` - Upload images

5. Copy the token to `WEBFLOW_API_TOKEN`

### 3. Find Webflow Site ID

The Site ID is visible in:
- Site Settings > General > Site ID
- The URL when editing: `https://webflow.com/design/[SITE-ID]`

### 4. Find Webflow Collection ID

Run the CMS setup script to discover your collection ID:

```bash
WEBFLOW_API_TOKEN=your-token WEBFLOW_SITE_ID=your-site-id npx tsx scripts/webflow-cms-setup.ts
```

This will list all collections and their IDs.

### 5. Set Up Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to `GEMINI_API_KEY`

### 6. Configure Webflow Webhooks (Optional)

To receive real-time updates when content changes in Webflow:

1. Go to Webflow Dashboard > Site Settings > Integrations > Webhooks
2. Add a new webhook:
   - **URL**: `https://your-domain.com/api/seo-engine/webhooks/webflow`
   - **Events**: `collection_item_created`, `collection_item_changed`, `collection_item_deleted`
3. Generate a webhook secret and add it to `WEBFLOW_WEBHOOK_SECRET`

## API Usage

### Authentication

All API endpoints require Bearer token authentication:

```bash
curl -X POST https://your-domain.com/api/seo-engine/keywords/discover \
  -H "Authorization: Bearer YOUR_ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sources": ["manual"], "keywords": [{"keyword": "belastingadvies", "language": "nl"}]}'
```

### Available Endpoints

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

## Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Rotate tokens regularly** - Especially after team member changes
3. **Use environment-specific tokens** - Different tokens for dev/staging/production
4. **Restrict Webflow API scopes** - Only grant necessary permissions
5. **Monitor API usage** - Check Webflow and Gemini dashboards for unusual activity

## Troubleshooting

### "Unauthorized" error (401)
- Check that `ADMIN_API_TOKEN` is set correctly
- Verify the Authorization header format: `Bearer <token>`

### "Webflow API error"
- Verify `WEBFLOW_API_TOKEN` has correct scopes
- Check that `WEBFLOW_SITE_ID` and `WEBFLOW_COLLECTION_ID` are correct
- Ensure you're not hitting rate limits (60 req/min)

### "Image generation failed"
- Verify `GEMINI_API_KEY` is valid
- Check your Gemini API quota at https://aistudio.google.com/

### "Database error"
- Ensure Supabase migrations are applied: `npx supabase db reset`
- Verify `SUPABASE_SERVICE_ROLE_KEY` has admin privileges
