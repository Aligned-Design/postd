import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware for handling Supabase auth sessions
 * 
 * SAFETY:
 * - Dev mode is controlled by NEXT_PUBLIC_DEV_MODE_ENABLED
 * - In production, dev mode is ALWAYS disabled
 * - When dev mode is OFF, full auth is enforced
 * 
 * Dev Mode (when enabled):
 * - All routes are public
 * - No auth checks
 * - Requires explicit opt-in
 * 
 * Production Mode (default):
 * - Public routes: /, /login, /auth/*, /api/*
 * - Protected routes: /app and /app/*
 * - Full authentication required
 */

// Placeholder URL and key for when environment variables are not set
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

// Check if dev mode is enabled
// Dev mode requires explicit opt-in AND is disabled in production
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const DEV_MODE_ENABLED = process.env.NEXT_PUBLIC_DEV_MODE_ENABLED === 'true'
const IS_DEV_MODE = !IS_PRODUCTION && DEV_MODE_ENABLED

export async function updateSession(request: NextRequest) {
  // DEV MODE: Bypass all auth checks if explicitly enabled
  if (IS_DEV_MODE) {
    console.log('[Middleware] 🔓 Dev mode active - bypassing auth')
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  // PRODUCTION MODE: Full auth enforcement
  console.log('[Middleware] 🔒 Production mode - enforcing auth')

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY

  if (supabaseUrl === PLACEHOLDER_URL) {
    console.warn('[Middleware] Supabase environment variables not configured - auth will not work')
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    if (path.startsWith('/auth/') || path.startsWith('/api/')) {
      return response
    }

    const isProtectedRoute = path.startsWith('/app')

    if (!user && isProtectedRoute) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (user && path === '/login') {
      const appUrl = new URL('/app', request.url)
      return NextResponse.redirect(appUrl)
    }

    return response
  } catch (error) {
    console.error('[Middleware] Error updating session:', error)
    return response
  }
}

