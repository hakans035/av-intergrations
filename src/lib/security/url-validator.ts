/**
 * URL Validation for secure redirects
 * Prevents open redirect vulnerabilities by whitelisting allowed domains
 */

const ALLOWED_REDIRECT_HOSTS = [
  'ambitionvalley.nl',
  'www.ambitionvalley.nl',
  'check.ambitionvalley.nl',
];

const FALLBACK_URL = 'https://ambitionvalley.nl';

/**
 * Validates if a URL is safe for redirect
 * Only allows HTTPS URLs to whitelisted domains
 */
export function isValidRedirectUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);

    // Only allow HTTPS in production, HTTP for local development
    const isSecureProtocol =
      parsed.protocol === 'https:' ||
      (process.env.NODE_ENV === 'development' && parsed.protocol === 'http:');

    if (!isSecureProtocol) {
      return false;
    }

    // Check if hostname is in whitelist
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_REDIRECT_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * Returns a safe redirect URL
 * Falls back to default URL if the provided URL is not trusted
 */
export function getSafeRedirectUrl(url: string | undefined, fallback?: string): string {
  if (!url) {
    return fallback || FALLBACK_URL;
  }

  if (isValidRedirectUrl(url)) {
    return url;
  }

  console.warn('[Security] Blocked redirect to untrusted URL:', url);
  return fallback || FALLBACK_URL;
}

/**
 * Sanitizes a string for safe URL parameter usage
 * Encodes special characters to prevent injection
 */
export function sanitizeUrlParam(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return encodeURIComponent(value.trim());
}
