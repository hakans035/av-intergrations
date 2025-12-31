/**
 * Webflow API Client Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  WebflowClient,
  WebflowApiError,
  createWebflowClient,
  validateWebhookSignature,
} from '../../src/integrations/seo-engine/lib/webflow-api';

// Mock environment variables
vi.stubEnv('WEBFLOW_API_TOKEN', 'test-token');
vi.stubEnv('WEBFLOW_SITE_ID', 'test-site-id');
vi.stubEnv('WEBFLOW_COLLECTION_ID', 'test-collection-id');

describe('WebflowClient', () => {
  let client: WebflowClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = createWebflowClient({
      apiToken: 'test-token',
      siteId: 'test-site-id',
      collectionId: 'test-collection-id',
    });

    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCollection', () => {
    it('should fetch collection details', async () => {
      const mockCollection = {
        id: 'test-collection-id',
        displayName: 'Blog Posts',
        singularName: 'Blog Post',
        slug: 'blog-posts',
        createdOn: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-02T00:00:00Z',
        fields: [],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () => Promise.resolve(JSON.stringify(mockCollection)),
      });

      const result = await client.getCollection();

      expect(result).toEqual(mockCollection);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.webflow.com/v2/collections/test-collection-id',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('listItems', () => {
    it('should list items with pagination', async () => {
      const mockResponse = {
        items: [
          {
            id: 'item-1',
            isDraft: false,
            isArchived: false,
            createdOn: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-02T00:00:00Z',
            fieldData: { name: 'Test Post', slug: 'test-post' },
          },
        ],
        pagination: { limit: 100, offset: 0, total: 1 },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.listItems({ limit: 100, offset: 0 });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('createItems', () => {
    it('should create items in bulk', async () => {
      const mockResponse = {
        items: [
          {
            id: 'new-item-1',
            isDraft: true,
            isArchived: false,
            createdOn: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-01T00:00:00Z',
            fieldData: { name: 'New Post', slug: 'new-post' },
          },
        ],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.createItems([
        { fieldData: { name: 'New Post', slug: 'new-post' }, isDraft: true },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('new-item-1');
    });

    it('should chunk large batches into multiple requests', async () => {
      const items = Array.from({ length: 150 }, (_, i) => ({
        fieldData: { name: `Post ${i}`, slug: `post-${i}` },
        isDraft: true,
      }));

      // First batch of 100
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-1' }),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              items: items.slice(0, 100).map((item, i) => ({
                id: `item-${i}`,
                ...item,
                createdOn: '2024-01-01T00:00:00Z',
                lastUpdated: '2024-01-01T00:00:00Z',
                isArchived: false,
              })),
            })
          ),
      });

      // Second batch of 50
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-2' }),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              items: items.slice(100).map((item, i) => ({
                id: `item-${100 + i}`,
                ...item,
                createdOn: '2024-01-01T00:00:00Z',
                lastUpdated: '2024-01-01T00:00:00Z',
                isArchived: false,
              })),
            })
          ),
      });

      const result = await client.createItems(items);

      expect(result).toHaveLength(150);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateItems', () => {
    it('should update items', async () => {
      const mockResponse = {
        items: [
          {
            id: 'item-1',
            isDraft: false,
            isArchived: false,
            createdOn: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-02T00:00:00Z',
            fieldData: { name: 'Updated Post', slug: 'test-post' },
          },
        ],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await client.updateItems([
        { id: 'item-1', fieldData: { name: 'Updated Post' } },
      ]);

      expect(result[0].fieldData.name).toBe('Updated Post');
    });
  });

  describe('deleteItems', () => {
    it('should delete items', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () => Promise.resolve(''),
      });

      await expect(client.deleteItems(['item-1', 'item-2'])).resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw WebflowApiError on 401', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () =>
          Promise.resolve(JSON.stringify({ message: 'Unauthorized', code: 'UNAUTHORIZED' })),
      });

      try {
        await client.getCollection();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(WebflowApiError);
        expect((error as WebflowApiError).statusCode).toBe(401);
      }
    });

    it('should return null for 404 on getItem', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () =>
          Promise.resolve(JSON.stringify({ message: 'Not found', code: 'NOT_FOUND' })),
      });

      const result = await client.getItem('non-existent');
      expect(result).toBeNull();
    });

    it('should retry on 429 rate limit', async () => {
      // First call: rate limited
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'x-request-id': 'req-1' }),
        text: () =>
          Promise.resolve(JSON.stringify({ message: 'Rate limited', code: 'RATE_LIMITED' })),
      });

      // Second call: success
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-2' }),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              id: 'collection-1',
              displayName: 'Test',
              singularName: 'Test',
              slug: 'test',
              createdOn: '2024-01-01T00:00:00Z',
              lastUpdated: '2024-01-01T00:00:00Z',
              fields: [],
            })
          ),
      });

      const result = await client.getCollection();

      expect(result.id).toBe('collection-1');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('WebflowApiError', () => {
    it('should correctly identify error types', () => {
      const rateLimitError = new WebflowApiError('Rate limited', 429);
      expect(rateLimitError.isRateLimited).toBe(true);
      expect(rateLimitError.isNotFound).toBe(false);

      const notFoundError = new WebflowApiError('Not found', 404);
      expect(notFoundError.isNotFound).toBe(true);
      expect(notFoundError.isRateLimited).toBe(false);

      const serverError = new WebflowApiError('Server error', 500);
      expect(serverError.isServerError).toBe(true);
    });
  });

  describe('publishItems', () => {
    it('should publish items by setting isDraft to false', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              items: [
                {
                  id: 'item-1',
                  isDraft: false,
                  isArchived: false,
                  createdOn: '2024-01-01T00:00:00Z',
                  lastUpdated: '2024-01-02T00:00:00Z',
                  fieldData: {},
                },
              ],
            })
          ),
      });

      await client.publishItems(['item-1']);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/items'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"isDraft":false'),
        })
      );
    });
  });

  describe('archiveItems', () => {
    it('should archive items by setting isDraft and isArchived', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              items: [
                {
                  id: 'item-1',
                  isDraft: true,
                  isArchived: true,
                  createdOn: '2024-01-01T00:00:00Z',
                  lastUpdated: '2024-01-02T00:00:00Z',
                  fieldData: {},
                },
              ],
            })
          ),
      });

      await client.archiveItems(['item-1']);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/items'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"isArchived":true'),
        })
      );
    });
  });

  describe('logging', () => {
    it('should log API calls', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () =>
          Promise.resolve(
            JSON.stringify({ id: 'test', displayName: 'Test', singularName: 'Test', slug: 'test', createdOn: '', lastUpdated: '', fields: [] })
          ),
      });

      await client.getCollection();

      const logs = client.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        method: 'GET',
        endpoint: '/collections/test-collection-id',
        statusCode: 200,
        requestId: 'req-123',
      });
      expect(logs[0].timestamp).toBeDefined();
      expect(logs[0].responseTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should clear logs', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () => Promise.resolve(JSON.stringify({ id: 'test', displayName: 'Test', singularName: 'Test', slug: 'test', createdOn: '', lastUpdated: '', fields: [] })),
      });

      await client.getCollection();
      expect(client.getLogs()).toHaveLength(1);

      client.clearLogs();
      expect(client.getLogs()).toHaveLength(0);
    });
  });
});

describe('validateWebhookSignature', () => {
  it('should validate correct signature', async () => {
    const payload = '{"test": "data"}';
    const secret = 'webhook-secret';

    // Generate expected signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = await validateWebhookSignature(payload, signature, secret);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect signature', async () => {
    const payload = '{"test": "data"}';
    const secret = 'webhook-secret';
    const wrongSignature = 'abcdef123456';

    const isValid = await validateWebhookSignature(payload, wrongSignature, secret);
    expect(isValid).toBe(false);
  });
});
