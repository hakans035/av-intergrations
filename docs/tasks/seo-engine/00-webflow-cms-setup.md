# Task 00: Webflow CMS Setup Script

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 3: Webflow CMS Data Model and Field Mapping
- Section 4: Webflow API Integration Requirements

Webflow API v2 Documentation:
- https://developers.webflow.com/data/reference/rest-introduction
- https://developers.webflow.com/data/reference/cms/collection-fields/create

## Objective

Create a standalone TypeScript script that retrieves existing Blog Posts collection fields from Webflow CMS via API, displays the current schema, compares against required fields, and adds any missing new fields.

## Requirements

### Script Location

```
scripts/webflow-cms-setup.ts
```

### Environment Variables

Required:
- `WEBFLOW_API_TOKEN` - Bearer token with `cms:read` and `cms:write` scopes
- `WEBFLOW_SITE_ID` - Site identifier
- `WEBFLOW_COLLECTION_ID` - Blog Posts collection identifier

### Webflow API v2 Endpoints Used

| Action | Method | Endpoint |
|--------|--------|----------|
| Get collection with fields | GET | `/collections/{collection_id}` |
| Create field | POST | `/collections/{collection_id}/fields` |

Base URL: `https://api.webflow.com/v2`

### Script Functionality

#### 1. Retrieve Existing Fields

Call `GET /collections/{collection_id}` to retrieve:
- Collection metadata
- Fields array with: id, slug, displayName, type, required, validations

Display in table format:
```
| Field Name | Slug | Type | Required | Field ID |
|------------|------|------|----------|----------|
| Name | name | PlainText | Yes | abc123 |
| Slug | slug | PlainText | Yes | def456 |
...
```

#### 2. Define Required Fields

Existing fields (must be present):
- Name (PlainText, required)
- Slug (PlainText, required)
- Main Image (ImageRef)
- Thumbnail image (ImageRef)
- Post Body (RichText)
- Post Summary (PlainText)
- Featured? (Bool)
- Next Post (ItemRef)
- Previous Post (ItemRef)
- Alt Text (PlainText)
- Author Image (ImageRef)
- Author Name (PlainText)

New fields to add:
- Language (Option: "nl", "en")
- Alternate Language Post (ItemRef)
- Content Status (Option: "draft", "pending_review", "approved", "published", "archived")
- Source Keyword (PlainText)
- Generation Timestamp (PlainText)
- Last Reviewed By (PlainText)
- Review Notes (PlainText)
- Meta Title (PlainText)
- Meta Description (PlainText)
- Canonical URL (PlainText)
- Schema Type (Option: "Article", "FAQPage", "Article+FAQ")
- Thumbnail Alt Text (PlainText)

#### 3. Compare and Report

- List existing fields that match requirements
- List existing fields not in requirements (warn only)
- List required fields that are missing
- Count total fields (max 60 per collection)

#### 4. Add Missing Fields

For each missing new field, call `POST /collections/{collection_id}/fields`:

Static Field request body:
```json
{
  "type": "PlainText",
  "displayName": "Field Name",
  "slug": "field-name",
  "isRequired": false,
  "helpText": "Description of the field"
}
```

Option Field request body:
```json
{
  "type": "Option",
  "displayName": "Language",
  "slug": "language",
  "isRequired": true,
  "metadata": {
    "options": [
      { "name": "Dutch", "id": "nl" },
      { "name": "English", "id": "en" }
    ]
  }
}
```

Reference Field request body:
```json
{
  "type": "ItemRef",
  "displayName": "Alternate Language Post",
  "slug": "alternate-language-post",
  "isRequired": false,
  "metadata": {
    "collectionId": "{same_collection_id}"
  }
}
```

#### 5. Generate TypeScript Types

After setup, generate types file:
- Read final field list from API
- Output TypeScript interfaces to console or file
- Include both existing and new fields

### Rate Limiting

- Maximum 60 requests per minute
- Add delay between field creation calls (1 second)
- Implement retry on 429 with exponential backoff

### Error Handling

- 401: Invalid token - display setup instructions
- 403: Insufficient permissions - list required scopes
- 404: Collection not found - verify collection ID
- 422: Validation error - display field details
- 429: Rate limited - wait and retry

### CLI Output

```
Webflow CMS Setup Script
========================

Connecting to Webflow API v2...
Site ID: {site_id}
Collection ID: {collection_id}

Retrieving existing fields...

Existing Fields (12 found):
| Field Name | Slug | Type | Required |
|------------|------|------|----------|
| Name | name | PlainText | Yes |
...

Comparing against required schema...

Missing Fields (12 required):
- Language (Option)
- Alternate Language Post (ItemRef)
...

Adding missing fields...
[1/12] Creating field: Language... OK
[2/12] Creating field: Alternate Language Post... OK
...

Setup Complete!
Total fields: 24/60

Generated TypeScript types saved to: src/integrations/seo-engine/types.generated.ts
```

### Flags

- `--dry-run`: Show what would be created without making changes
- `--force`: Skip confirmation prompts
- `--output-types`: Path to output generated types file

## Acceptance Criteria

- [ ] Script connects to Webflow API v2 successfully
- [ ] Existing fields retrieved and displayed
- [ ] Missing fields identified correctly
- [ ] New fields created via API
- [ ] Option fields created with correct options
- [ ] Reference fields point to correct collection
- [ ] Rate limiting respected
- [ ] Error handling for all status codes
- [ ] Dry-run mode works
- [ ] TypeScript types generated
- [ ] Script can be run via `npx tsx scripts/webflow-cms-setup.ts`

## Dependencies

- None (runs before integration development)

## Estimated Effort

Medium
