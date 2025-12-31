# Task 14: API Routes

## Reference

See all sections of `docs/seo-content-engine-requirements.md` for feature context.

## Objective

Create Next.js API routes for the SEO content engine.

## Requirements

### Keywords Routes

```
/api/seo-engine/keywords/
```

#### POST /discover
- Trigger keyword discovery
- Input: { sources?: string[], languages?: string[] }
- Output: { discovered: number, keywords: Keyword[] }

#### GET /queue
- List queued keywords
- Query params: language, status, intent, page, limit
- Output: { keywords: Keyword[], total: number }

#### PATCH /[id]
- Update keyword status
- Input: { status: KeywordStatus }
- Output: { keyword: Keyword }

### Content Routes

```
/api/seo-engine/content/
```

#### POST /generate
- Generate content draft
- Input: { keywordId: string, contentType: ContentType }
- Output: { draft: ContentDraft }

#### GET /drafts
- List content drafts
- Query params: status, language, page, limit
- Output: { drafts: ContentDraft[], total: number }

#### GET /[id]
- Get single draft
- Output: { draft: ContentDraft }

#### PATCH /[id]
- Update draft content
- Input: Partial<ContentDraft>
- Output: { draft: ContentDraft }

#### POST /[id]/publish
- Publish to Webflow
- Output: { success: boolean, webflowItemId: string }

### Approval Routes

```
/api/seo-engine/approval/
```

#### GET /pending
- List pending approvals
- Query params: gate, reviewer
- Output: { items: ApprovalItem[], total: number }

#### POST /[id]
- Submit approval decision
- Input: { action: ApprovalAction, notes?: string }
- Output: { item: ApprovalItem, nextGate?: ApprovalGate }

### Images Routes

```
/api/seo-engine/images/
```

#### POST /generate
- Generate image via Gemini
- Input: { topic: string, category: ImageCategory, postSlug: string }
- Output: { imageUrl: string, altText: string, assetId: string }

### Webhooks Routes

```
/api/seo-engine/webhooks/
```

#### POST /webflow
- Handle Webflow webhooks
- Validate signature
- Process collection_item_changed events
- Output: { received: true }

### Performance Routes

```
/api/seo-engine/performance/
```

#### GET /metrics
- Get performance metrics
- Query params: postId, dateFrom, dateTo
- Output: { metrics: PerformanceMetric[] }

#### POST /sync
- Trigger metrics sync
- Output: { synced: number }

### Common Requirements

- Authentication required for all routes
- Role-based authorization
- Input validation with Zod
- Consistent error responses
- Rate limiting where appropriate
- Request logging

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Acceptance Criteria

- [ ] All keyword routes implemented
- [ ] All content routes implemented
- [ ] All approval routes implemented
- [ ] Image generation route implemented
- [ ] Webhook route implemented
- [ ] Performance routes implemented
- [ ] Authentication enforced
- [ ] Authorization by role
- [ ] Input validation working
- [ ] Error responses consistent
- [ ] Rate limiting applied
- [ ] Request logging working
- [ ] API documentation generated

## Dependencies

- All lib modules (Tasks 03-12)

## Estimated Effort

Large
