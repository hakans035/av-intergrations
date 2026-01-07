/**
 * SEO Engine API - Shared Utilities
 */

import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';

// =============================================================================
// Types
// =============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// =============================================================================
// Error Responses
// =============================================================================

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse('UNAUTHORIZED', message, 401);
}

export function forbiddenResponse(message = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse('FORBIDDEN', message, 403);
}

export function notFoundResponse(resource = 'Resource'): NextResponse<ApiResponse> {
  return errorResponse('NOT_FOUND', `${resource} not found`, 404);
}

export function validationErrorResponse(errors: { field: string; message: string }[]): NextResponse<ApiResponse> {
  return errorResponse('VALIDATION_ERROR', 'Invalid input', 400, { errors });
}

export function serverErrorResponse(message = 'Internal server error'): NextResponse<ApiResponse> {
  return errorResponse('INTERNAL_ERROR', message, 500);
}

export function rateLimitResponse(retryAfter: number): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        details: { retryAfter },
      },
    },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    }
  );
}

// =============================================================================
// Success Responses
// =============================================================================

export function successResponse<T>(
  data: T,
  status: number = 200,
  pagination?: ApiResponse['pagination']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
    },
    { status }
  );
}

export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201);
}

// =============================================================================
// Validation
// =============================================================================

export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse<ApiResponse> }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return { error: validationErrorResponse(errors) };
    }
    if (error instanceof SyntaxError) {
      return { error: errorResponse('INVALID_JSON', 'Invalid JSON body', 400) };
    }
    throw error;
  }
}

export function parseQueryParams(
  url: string,
  defaults: { page?: number; limit?: number } = {}
): {
  page: number;
  limit: number;
  offset: number;
  params: URLSearchParams;
} {
  const { searchParams } = new URL(url);
  const page = Math.max(1, parseInt(searchParams.get('page') || String(defaults.page || 1)));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || String(defaults.limit || 20))));
  const offset = (page - 1) * limit;

  return { page, limit, offset, params: searchParams };
}

// =============================================================================
// Authentication
// =============================================================================

export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

export function validateAdminToken(request: Request): boolean {
  const token = getAuthToken(request);
  if (!token) return false;
  return token === process.env.ADMIN_API_TOKEN;
}

// =============================================================================
// Logging
// =============================================================================

export function createRequestLogger(prefix: string) {
  const requestId = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const startTime = Date.now();

  return {
    id: requestId,
    log: (message: string, data?: unknown) => {
      console.log(`[${requestId}] ${message}`, data !== undefined ? data : '');
    },
    warn: (message: string, data?: unknown) => {
      console.warn(`[${requestId}] ${message}`, data !== undefined ? data : '');
    },
    error: (message: string, error?: unknown) => {
      console.error(`[${requestId}] ${message}`, error);
    },
    done: (result: 'SUCCESS' | 'ERROR') => {
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] Completed in ${duration}ms - ${result}`);
    },
  };
}
