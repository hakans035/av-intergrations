/**
 * In-memory rate limiting for form submissions
 * For production, consider using Redis or a similar distributed cache
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const MAX_REQUESTS = 10; // Max 10 submissions per hour per IP

/**
 * Clean up expired entries periodically
 */
function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpired, 5 * 60 * 1000);
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if there are multiple
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Check if the request is rate limited
 * Returns { limited: true, retryAfter: seconds } if limited
 * Returns { limited: false } if allowed
 */
export function checkRateLimit(
  identifier: string,
  options?: { windowMs?: number; maxRequests?: number }
): { limited: boolean; retryAfter?: number; remaining?: number } {
  const windowMs = options?.windowMs ?? WINDOW_MS;
  const maxRequests = options?.maxRequests ?? MAX_REQUESTS;

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No existing entry or expired entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { limited: false, remaining: maxRequests - 1 };
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { limited: true, retryAfter, remaining: 0 };
  }

  // Increment count
  entry.count += 1;
  return { limited: false, remaining: maxRequests - entry.count };
}

/**
 * Rate limit middleware for API routes
 * Usage in API route:
 *   const rateLimitResult = await rateLimit(request);
 *   if (rateLimitResult.limited) {
 *     return Response.json({ error: 'Too many requests' }, { status: 429 });
 *   }
 */
export async function rateLimit(
  request: Request,
  options?: { windowMs?: number; maxRequests?: number }
): Promise<{ limited: boolean; retryAfter?: number; remaining?: number }> {
  const ip = getClientIp(request);
  return checkRateLimit(ip, options);
}

/**
 * Create rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
  };
}

/**
 * Reset rate limit for an identifier (useful for testing)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(identifier: string): {
  count: number;
  remaining: number;
  resetTime: number | null;
} {
  const entry = rateLimitStore.get(identifier);

  if (!entry || Date.now() > entry.resetTime) {
    return { count: 0, remaining: MAX_REQUESTS, resetTime: null };
  }

  return {
    count: entry.count,
    remaining: Math.max(0, MAX_REQUESTS - entry.count),
    resetTime: entry.resetTime,
  };
}
