# Task 03: Webflow API v2 Client

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 4: Webflow API Integration Requirements

Webflow API v2 Documentation:
- https://developers.webflow.com/data/reference/rest-introduction
- https://developers.webflow.com/data/reference/rate-limits
- https://developers.webflow.com/data/reference/cms

## Objective

Implement a Webflow API v2 client with rate limiting, bulk operations, error handling, and idempotency.

## Requirements

### API Configuration

Base URL: `https://api.webflow.com/v2`

Authentication:
- Bearer token authentication
- Header: `Authorization: Bearer {token}`
- Required scopes: `cms:read`, `cms:write`, `assets:read`, `assets:write`

Environment variables:
- `WEBFLOW_API_TOKEN` - API token (per environment)
- `WEBFLOW_SITE_ID` - Site identifier
- `WEBFLOW_COLLECTION_ID` - Blog Posts collection ID

### Client Class

Location: `src/integrations/seo-engine/lib/webflow-api.ts`

```typescript
class WebflowClient {
  constructor(config: WebflowClientConfig)

  // Collections
  getCollection(collectionId: string): Promise<Collection>

  // Collection Items (supports bulk)
  createItems(collectionId: string, items: ItemData[]): Promise<Item[]>
  updateItems(collectionId: string, items: ItemUpdate[]): Promise<Item[]>
  deleteItems(collectionId: string, itemIds: string[]): Promise<void>
  getItem(collectionId: string, itemId: string): Promise<Item>
  listItems(collectionId: string, options?: ListOptions): Promise<PaginatedItems>

  // Assets
  uploadAsset(siteId: string, file: Buffer, filename: string): Promise<Asset>
  getAsset(assetId: string): Promise<Asset>

  // Publishing
  publishSite(siteId: string): Promise<void>
}
```

### Endpoints

| Action | Method | Endpoint | Bulk |
|--------|--------|----------|------|
| Get collection | GET | `/collections/{id}` | No |
| List items | GET | `/collections/{id}/items` | N/A |
| Get item | GET | `/collections/{id}/items/{id}` | No |
| Create items | POST | `/collections/{id}/items` | Yes (100) |
| Update items | PATCH | `/collections/{id}/items` | Yes (100) |
| Delete items | DELETE | `/collections/{id}/items` | Yes (100) |
| Upload asset | POST | `/sites/{id}/assets` | No |
| Publish site | POST | `/sites/{id}/publish` | No |

### Bulk Operations

Maximum 100 items per request for create/update/delete.

Create items request body:
```json
{
  "items": [
    {
      "fieldData": {
        "name": "Post Title",
        "slug": "post-title",
        "post-body": "<p>Content</p>",
        ...
      },
      "isDraft": true,
      "isArchived": false
    }
  ]
}
```

Update items request body:
```json
{
  "items": [
    {
      "id": "item_id",
      "fieldData": {
        "name": "Updated Title"
      },
      "isDraft": false
    }
  ]
}
```

### Pagination

List items supports:
- `limit`: Maximum items per page (up to 100)
- `offset`: Number of items to skip
- Sortable by `lastUpdated` and `createdOn`

Response includes pagination metadata:
```json
{
  "items": [...],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 250
  }
}
```

### Rate Limiting

Limits:
- 60 requests per minute
- 1,000 requests per hour per site
- Site publish: 1 per minute

Implementation:
- Track request timestamps in sliding window
- Wait when approaching limit
- Exponential backoff on 429 response
- Initial delay: 1 second
- Maximum delay: 60 seconds
- Maximum retries: 5
- Jitter: random 0-500ms added to delay

### Error Handling

| Status | Action | Retry |
|--------|--------|-------|
| 400 | Log details, throw | No |
| 401 | Halt, invalid token | No |
| 403 | Halt, insufficient permissions | No |
| 404 | Log, return null | No |
| 409 | Refresh data, retry | Yes |
| 422 | Log validation errors, throw | No |
| 429 | Exponential backoff | Yes |
| 500+ | Retry with backoff | Yes |

### Idempotency

Before creating items:
1. Query existing items by slug and language
2. If exists, update instead of create
3. Use composite key: `{slug}_{language}` for deduplication
4. Store Generation Timestamp for versioning

### Logging

Log all API calls with:
- Timestamp (ISO 8601)
- Method and endpoint
- Request ID (from response headers)
- Response status code
- Response time (ms)
- Item count (for bulk operations)

Log full response body on errors (4xx, 5xx).

### Item Status Flags

Webflow items have:
- `isDraft`: true = not published, false = published
- `isArchived`: true = archived/hidden

Publishing workflow:
- Create draft: `isDraft: true, isArchived: false`
- Publish: `isDraft: false, isArchived: false`
- Unpublish: `isDraft: true, isArchived: false`
- Archive: `isDraft: true, isArchived: true`

### Field Name Mapping

API uses slug format for field names:
- "Main Image" -> `main-image`
- "Post Body" -> `post-body`
- "Featured?" -> `featured`
- "Alt Text" -> `alt-text`

### Asset Upload

Images must be publicly accessible URLs OR uploaded via Assets API.

Upload request:
- Multipart form data
- Maximum file size: 4MB
- Returns asset ID and URL

### Webhook Support

Configure webhook for `collection_item_changed` event:
- Validate signature header
- Parse event payload
- Trigger cache invalidation or external sync

## Acceptance Criteria

- [ ] Client class implemented with all methods
- [ ] Bulk operations working (create, update, delete)
- [ ] Pagination implemented for list operations
- [ ] Rate limiting with sliding window
- [ ] Exponential backoff on 429
- [ ] All error codes handled correctly
- [ ] Idempotency check before create
- [ ] Comprehensive logging
- [ ] Asset upload working
- [ ] Draft/publish status management
- [ ] Field name mapping correct
- [ ] Unit tests for client methods
- [ ] Integration tests with mock server

## Dependencies

- Task 02: Types and Configuration

## Estimated Effort

Large
