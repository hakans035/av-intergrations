/**
 * SEO Content Engine - Webflow API v2 Client
 *
 * A robust client for Webflow CMS API v2 with rate limiting,
 * bulk operations, error handling, and idempotency.
 */

import { webflowConfig, getEnvVar, ENV_VARS } from '../config';
import type { BlogPostFieldData, Language } from '../types';

// =============================================================================
// Types
// =============================================================================

export interface WebflowClientConfig {
  apiToken: string;
  siteId: string;
  collectionId: string;
}

export interface WebflowCollection {
  id: string;
  displayName: string;
  singularName: string;
  slug: string;
  createdOn: string;
  lastUpdated: string;
  fields: WebflowField[];
}

export interface WebflowField {
  id: string;
  isEditable: boolean;
  isRequired: boolean;
  type: string;
  slug: string;
  displayName: string;
  helpText?: string;
  validations?: Record<string, unknown>;
}

export interface WebflowItem<T = Record<string, unknown>> {
  id: string;
  cmsLocaleId?: string;
  lastPublished?: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: T;
}

export interface WebflowItemCreate<T = Record<string, unknown>> {
  fieldData: T;
  isDraft?: boolean;
  isArchived?: boolean;
}

export interface WebflowItemUpdate<T = Record<string, unknown>> {
  id: string;
  fieldData: Partial<T>;
  isDraft?: boolean;
  isArchived?: boolean;
}

export interface WebflowPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface WebflowPaginatedResponse<T> {
  items: T[];
  pagination: WebflowPagination;
}

export interface WebflowListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'lastUpdated' | 'createdOn';
  sortOrder?: 'asc' | 'desc';
}

export interface WebflowAsset {
  id: string;
  url: string;
  altText?: string;
  mimeType: string;
  size: number;
  createdOn: string;
}

export interface WebflowAssetUpload {
  fileName: string;
  fileData: Buffer | Blob;
  parentFolder?: string;
}

export interface WebflowError {
  message: string;
  code: string;
  externalReference?: string;
  details?: unknown[];
}

export interface WebflowApiLog {
  timestamp: string;
  method: string;
  endpoint: string;
  requestId?: string;
  statusCode: number;
  responseTimeMs: number;
  itemCount?: number;
  error?: WebflowError;
}

// =============================================================================
// Rate Limiter
// =============================================================================

class RateLimiter {
  private requestTimestamps: number[] = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();

    // Remove timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.windowMs
    );

    if (this.requestTimestamps.length >= this.maxRequests) {
      // Calculate wait time
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = this.windowMs - (now - oldestTimestamp) + 100; // +100ms buffer

      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }

    this.requestTimestamps.push(Date.now());
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Webflow Client
// =============================================================================

export class WebflowClient {
  private readonly config: WebflowClientConfig;
  private readonly baseUrl: string;
  private readonly rateLimiter: RateLimiter;
  private readonly logs: WebflowApiLog[] = [];

  constructor(config?: Partial<WebflowClientConfig>) {
    this.config = {
      apiToken: config?.apiToken ?? getEnvVar(ENV_VARS.WEBFLOW_API_TOKEN),
      siteId: config?.siteId ?? getEnvVar(ENV_VARS.WEBFLOW_SITE_ID),
      collectionId: config?.collectionId ?? getEnvVar(ENV_VARS.WEBFLOW_COLLECTION_ID),
    };
    this.baseUrl = webflowConfig.baseUrl;
    this.rateLimiter = new RateLimiter(
      webflowConfig.rateLimit.requestsPerMinute,
      60 * 1000
    );
  }

  // ===========================================================================
  // Collections
  // ===========================================================================

  async getCollection(collectionId?: string): Promise<WebflowCollection> {
    const id = collectionId ?? this.config.collectionId;
    return this.request<WebflowCollection>('GET', `/collections/${id}`);
  }

  // ===========================================================================
  // Collection Items
  // ===========================================================================

  async getItem<T = BlogPostFieldData>(
    itemId: string,
    collectionId?: string
  ): Promise<WebflowItem<T> | null> {
    const id = collectionId ?? this.config.collectionId;
    try {
      return await this.request<WebflowItem<T>>(
        'GET',
        `/collections/${id}/items/${itemId}`
      );
    } catch (error) {
      if (error instanceof WebflowApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async listItems<T = BlogPostFieldData>(
    options?: WebflowListOptions,
    collectionId?: string
  ): Promise<WebflowPaginatedResponse<WebflowItem<T>>> {
    const id = collectionId ?? this.config.collectionId;
    const params = new URLSearchParams();

    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    if (options?.sortBy) params.set('sortBy', options.sortBy);
    if (options?.sortOrder) params.set('sortOrder', options.sortOrder);

    const query = params.toString();
    const endpoint = `/collections/${id}/items${query ? `?${query}` : ''}`;

    return this.request<WebflowPaginatedResponse<WebflowItem<T>>>('GET', endpoint);
  }

  async createItems<T = BlogPostFieldData>(
    items: WebflowItemCreate<T>[],
    collectionId?: string
  ): Promise<WebflowItem<T>[]> {
    const id = collectionId ?? this.config.collectionId;
    const results: WebflowItem<T>[] = [];

    // Process in batches of max 100
    const batches = this.chunk(items, webflowConfig.bulk.maxItemsPerRequest);

    for (const batch of batches) {
      const response = await this.request<{ items: WebflowItem<T>[] }>(
        'POST',
        `/collections/${id}/items`,
        { items: batch },
        batch.length
      );
      results.push(...response.items);
    }

    return results;
  }

  async updateItems<T = BlogPostFieldData>(
    items: WebflowItemUpdate<T>[],
    collectionId?: string
  ): Promise<WebflowItem<T>[]> {
    const id = collectionId ?? this.config.collectionId;
    const results: WebflowItem<T>[] = [];

    // Process in batches of max 100
    const batches = this.chunk(items, webflowConfig.bulk.maxItemsPerRequest);

    for (const batch of batches) {
      const response = await this.request<{ items: WebflowItem<T>[] }>(
        'PATCH',
        `/collections/${id}/items`,
        { items: batch },
        batch.length
      );
      results.push(...response.items);
    }

    return results;
  }

  async deleteItems(
    itemIds: string[],
    collectionId?: string
  ): Promise<void> {
    const id = collectionId ?? this.config.collectionId;

    // Process in batches of max 100
    const batches = this.chunk(itemIds, webflowConfig.bulk.maxItemsPerRequest);

    for (const batch of batches) {
      await this.request<void>(
        'DELETE',
        `/collections/${id}/items`,
        { itemIds: batch },
        batch.length
      );
    }
  }

  // ===========================================================================
  // Idempotent Create/Update
  // ===========================================================================

  /**
   * Create or update an item based on slug and language (composite key).
   * This ensures idempotency by checking for existing items first.
   */
  async upsertItem<T extends { slug: string; language: Language }>(
    fieldData: T,
    options?: { isDraft?: boolean; isArchived?: boolean },
    collectionId?: string
  ): Promise<WebflowItem<T>> {
    const id = collectionId ?? this.config.collectionId;

    // Check if item already exists
    const existing = await this.findItemBySlugAndLanguage<T>(
      fieldData.slug,
      fieldData.language,
      id
    );

    if (existing) {
      // Update existing item
      const [updated] = await this.updateItems<T>(
        [
          {
            id: existing.id,
            fieldData,
            isDraft: options?.isDraft,
            isArchived: options?.isArchived,
          },
        ],
        id
      );
      return updated;
    }

    // Create new item
    const [created] = await this.createItems<T>(
      [
        {
          fieldData,
          isDraft: options?.isDraft ?? true,
          isArchived: options?.isArchived ?? false,
        },
      ],
      id
    );
    return created;
  }

  /**
   * Find an item by slug and language combination.
   */
  async findItemBySlugAndLanguage<T = BlogPostFieldData>(
    slug: string,
    language: Language,
    collectionId?: string
  ): Promise<WebflowItem<T> | null> {
    const id = collectionId ?? this.config.collectionId;

    // Webflow doesn't support field filtering in list, so we need to paginate
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await this.listItems<T>({ limit, offset }, id);

      for (const item of response.items) {
        const data = item.fieldData as unknown as { slug?: string; language?: string };
        if (data.slug === slug && data.language === language) {
          return item;
        }
      }

      if (response.items.length < limit) {
        // No more items
        break;
      }

      offset += limit;
    }

    return null;
  }

  // ===========================================================================
  // Assets
  // ===========================================================================

  /**
   * Upload an asset to Webflow using the two-step process:
   * 1. Create asset metadata (POST /sites/:site_id/assets with fileName + fileHash)
   * 2. Upload file to S3 using the returned uploadUrl and uploadDetails
   *
   * Docs: https://developers.webflow.com/data/reference/assets/assets/create
   */
  async uploadAsset(
    file: WebflowAssetUpload,
    siteId?: string
  ): Promise<WebflowAsset> {
    const id = siteId ?? this.config.siteId;

    // Get file data as Buffer
    let fileBuffer: Buffer;
    if (file.fileData instanceof Blob) {
      const arrayBuffer = await file.fileData.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      fileBuffer = Buffer.from(file.fileData);
    }

    // Calculate MD5 hash of the file
    const crypto = await import('crypto');
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');

    // Step 1: Create asset metadata
    const createResponse = await this.request<{
      uploadUrl: string;
      uploadDetails: Record<string, string | null>;
      id: string;
      hostedUrl: string;
      contentType: string;
      originalFileName: string;
    }>('POST', `/sites/${id}/assets`, {
      fileName: file.fileName,
      fileHash: fileHash,
      ...(file.parentFolder && { parentFolder: file.parentFolder }),
    });

    // Step 2: Upload to S3 using uploadDetails
    const formData = new FormData();

    // Add all uploadDetails fields to the form
    for (const [key, value] of Object.entries(createResponse.uploadDetails)) {
      if (value !== null) {
        formData.append(key, value);
      }
    }

    // Add the actual file last (required by S3)
    const uint8Array = new Uint8Array(fileBuffer);
    const blob = new Blob([uint8Array], { type: createResponse.contentType || 'application/octet-stream' });
    formData.append('file', blob, file.fileName);

    // Upload to S3
    const s3Response = await fetch(createResponse.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!s3Response.ok) {
      const errorText = await s3Response.text();
      throw new WebflowApiError(
        `S3 upload failed: ${errorText}`,
        s3Response.status
      );
    }

    // Return the asset info
    return {
      id: createResponse.id,
      url: createResponse.hostedUrl,
      mimeType: createResponse.contentType,
      size: fileBuffer.length,
      createdOn: new Date().toISOString(),
    };
  }

  async getAsset(assetId: string): Promise<WebflowAsset | null> {
    try {
      return await this.request<WebflowAsset>('GET', `/assets/${assetId}`);
    } catch (error) {
      if (error instanceof WebflowApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  // ===========================================================================
  // Publishing
  // ===========================================================================

  async publishSite(siteId?: string): Promise<void> {
    const id = siteId ?? this.config.siteId;
    await this.request<void>('POST', `/sites/${id}/publish`, {
      publishToWebflowSubdomain: true,
      publishToCustomDomains: true,
    });
  }

  /**
   * Publish specific items (make them live).
   */
  async publishItems(itemIds: string[], collectionId?: string): Promise<void> {
    const updates = itemIds.map((id) => ({
      id,
      fieldData: {},
      isDraft: false,
    }));
    await this.updateItems(updates, collectionId);
  }

  /**
   * Unpublish items (set to draft).
   */
  async unpublishItems(itemIds: string[], collectionId?: string): Promise<void> {
    const updates = itemIds.map((id) => ({
      id,
      fieldData: {},
      isDraft: true,
    }));
    await this.updateItems(updates, collectionId);
  }

  /**
   * Archive items.
   */
  async archiveItems(itemIds: string[], collectionId?: string): Promise<void> {
    const updates = itemIds.map((id) => ({
      id,
      fieldData: {},
      isDraft: true,
      isArchived: true,
    }));
    await this.updateItems(updates, collectionId);
  }

  // ===========================================================================
  // Logging
  // ===========================================================================

  getLogs(): WebflowApiLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs.length = 0;
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    itemCount?: number
  ): Promise<T> {
    await this.rateLimiter.waitIfNeeded();

    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;

    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount <= webflowConfig.retry.maxRetries) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const responseTime = Date.now() - startTime;
        const requestId = response.headers.get('x-request-id') ?? undefined;

        // Log the request
        this.log({
          timestamp: new Date().toISOString(),
          method,
          endpoint,
          requestId,
          statusCode: response.status,
          responseTimeMs: responseTime,
          itemCount,
        });

        if (response.ok) {
          // Handle empty responses (e.g., DELETE)
          const text = await response.text();
          if (!text) {
            return undefined as T;
          }
          return JSON.parse(text) as T;
        }

        // Handle errors
        const errorBody = await response.text();
        let errorData: WebflowError;
        try {
          errorData = JSON.parse(errorBody);
        } catch {
          errorData = { message: errorBody, code: 'UNKNOWN' };
        }

        // Log error details
        this.log({
          timestamp: new Date().toISOString(),
          method,
          endpoint,
          requestId,
          statusCode: response.status,
          responseTimeMs: responseTime,
          itemCount,
          error: errorData,
        });

        const error = new WebflowApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );

        // Determine if we should retry
        if (this.shouldRetry(response.status) && retryCount < webflowConfig.retry.maxRetries) {
          lastError = error;
          retryCount++;
          await this.delay(retryCount);
          continue;
        }

        throw error;
      } catch (error) {
        if (error instanceof WebflowApiError) {
          throw error;
        }

        // Network or other errors
        lastError = error as Error;
        if (retryCount < webflowConfig.retry.maxRetries) {
          retryCount++;
          await this.delay(retryCount);
          continue;
        }

        throw new WebflowApiError(
          `Network error: ${(error as Error).message}`,
          0,
          undefined
        );
      }
    }

    throw lastError ?? new Error('Max retries exceeded');
  }

  private async requestFormData<T>(
    method: string,
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    await this.rateLimiter.waitIfNeeded();

    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        Accept: 'application/json',
      },
      body: formData,
    });

    const responseTime = Date.now() - startTime;
    const requestId = response.headers.get('x-request-id') ?? undefined;

    this.log({
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      requestId,
      statusCode: response.status,
      responseTimeMs: responseTime,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorData: WebflowError;
      try {
        errorData = JSON.parse(errorBody);
      } catch {
        errorData = { message: errorBody, code: 'UNKNOWN' };
      }

      throw new WebflowApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json() as Promise<T>;
  }

  private shouldRetry(statusCode: number): boolean {
    // Retry on 409 (conflict), 429 (rate limit), and 5xx errors
    return statusCode === 409 || statusCode === 429 || statusCode >= 500;
  }

  private async delay(retryCount: number): Promise<void> {
    const { initialDelayMs, maxDelayMs, jitterMs } = webflowConfig.retry;

    // Exponential backoff with jitter
    const exponentialDelay = initialDelayMs * Math.pow(2, retryCount - 1);
    const jitter = Math.random() * jitterMs;
    const delay = Math.min(exponentialDelay + jitter, maxDelayMs);

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private log(entry: WebflowApiLog): void {
    this.logs.push(entry);

    // Also log to console for debugging (can be replaced with proper logger)
    const level = entry.error ? 'error' : 'info';
    const message = `[Webflow API] ${entry.method} ${entry.endpoint} - ${entry.statusCode} (${entry.responseTimeMs}ms)`;

    if (level === 'error') {
      console.error(message, entry.error);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(message);
    }
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// =============================================================================
// Error Class
// =============================================================================

export class WebflowApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: WebflowError
  ) {
    super(message);
    this.name = 'WebflowApiError';
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isValidationError(): boolean {
    return this.statusCode === 422;
  }

  get isConflict(): boolean {
    return this.statusCode === 409;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new Webflow client with default configuration from environment variables.
 */
export function createWebflowClient(config?: Partial<WebflowClientConfig>): WebflowClient {
  return new WebflowClient(config);
}

// =============================================================================
// Webhook Utilities
// =============================================================================

export interface WebflowWebhookPayload {
  triggerType: string;
  site: { id: string };
  collection?: { id: string };
  item?: WebflowItem;
  createdOn: string;
}

/**
 * Validate Webflow webhook signature.
 * Webflow uses HMAC-SHA256 for webhook signatures.
 */
export async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computedSignature === signature;
}

/**
 * Parse Webflow webhook payload.
 */
export function parseWebhookPayload(body: string): WebflowWebhookPayload {
  return JSON.parse(body) as WebflowWebhookPayload;
}
