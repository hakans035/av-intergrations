import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Browser client for client components.
 * Uses publishable key (anon) - safe for client-side use.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
