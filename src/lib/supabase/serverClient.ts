import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client
 * 
 * Usage:
 * - Use this in Server Components, Server Actions, and Route Handlers
 * - Automatically handles auth cookies from the request
 * - Works with middleware to maintain sessions
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL (safe for server-side)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY (safe for server-side, respects RLS)
 * 
 * Optional:
 * - SUPABASE_SERVICE_ROLE_KEY (for admin operations, bypasses RLS)
 *   Only use service role key when you need to bypass RLS!
 * 
 * This client uses the anon key and respects Row Level Security (RLS) policies.
 */

// Placeholder URL and key for when environment variables are not set
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

