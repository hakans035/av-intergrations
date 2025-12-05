/**
 * CSRF Protection for form submissions
 * Uses double-submit cookie pattern for stateless CSRF protection
 */

import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create CSRF token from cookies (server-side)
 */
export async function getServerCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!token) {
    token = generateToken();
  }

  return token;
}

/**
 * Validate CSRF token from request headers against cookie
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieHeader = request.headers.get('cookie');

  if (!headerToken || !cookieHeader) {
    return false;
  }

  // Parse cookie to get CSRF token
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  const cookieToken = cookies[CSRF_COOKIE_NAME];

  if (!cookieToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(headerToken, cookieToken);
}

/**
 * Constant-time string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Client-side: Get CSRF token from cookie
 */
export function getClientCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === CSRF_COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

/**
 * Client-side: Set CSRF token cookie
 */
export function setClientCsrfToken(): string {
  if (typeof document === 'undefined') {
    return '';
  }

  // Check if token already exists
  const existingToken = getClientCsrfToken();
  if (existingToken) {
    return existingToken;
  }

  // Generate new token
  const token = generateToken();

  // Set cookie with secure flags
  const secure = window.location.protocol === 'https:';
  document.cookie = `${CSRF_COOKIE_NAME}=${token}; path=/; SameSite=Strict${secure ? '; Secure' : ''}`;

  return token;
}

/**
 * Create headers object with CSRF token for fetch requests
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getClientCsrfToken();
  if (!token) {
    return {};
  }
  return {
    [CSRF_HEADER_NAME]: token,
  };
}

// Export constants for use in other files
export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
