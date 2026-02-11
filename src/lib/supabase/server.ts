import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Server client for Server Components and Route Handlers.
 * Uses publishable key with cookie-based auth.
 * Supports both new (PUBLISHABLE_KEY) and legacy (ANON_KEY) env vars.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Service client with elevated privileges for admin operations.
 * Uses secret key - bypasses Row Level Security.
 * Supports both new (SECRET_KEY) and legacy (SERVICE_ROLE_KEY) env vars.
 *
 * IMPORTANT: Only use server-side. Never expose to client.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SECRET_KEY
    || (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '')

  return createSupabaseClient<Database>(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
