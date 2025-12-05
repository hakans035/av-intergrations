import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Browser client for client components.
 * Uses publishable key - safe for client-side use.
 * Supports both new (PUBLISHABLE_KEY) and legacy (ANON_KEY) env vars.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
