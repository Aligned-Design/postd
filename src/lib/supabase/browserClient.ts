import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client
 * 
 * Usage:
 * - Use this ONLY in Client Components (marked with 'use client')
 * - For auth operations in the browser (login, signup, magic links)
 * - For client-side data fetching
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL (public, safe for browser)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY (public, safe for browser)
 * 
 * DO NOT use SUPABASE_SERVICE_ROLE_KEY in browser code - it's a secret!
 */

// Placeholder URL and key for when environment variables are not set
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

