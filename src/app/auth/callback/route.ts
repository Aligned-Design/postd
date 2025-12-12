import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Auth Callback Route Handler
 * 
 * This route handles authentication callbacks from Supabase for:
 * 1. Magic link (OTP) authentication
 * 2. PKCE flow (OAuth, etc.)
 * 
 * Flow:
 * 1. User clicks magic link in email → browser visits /auth/callback?token_hash=...&type=magiclink
 * 2. This handler verifies the token with Supabase
 * 3. Supabase sets session cookies via the cookie adapter
 * 4. User is redirected to /app (or custom 'next' param)
 * 
 * Important:
 * - Cookies must be set on the NextResponse object to persist session
 * - Middleware will then be able to read the session cookies
 */

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // Extract params
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'magiclink' | 'recovery' | 'email_change' | 'signup' | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  // Log incoming callback (helps with debugging)
  console.log('[Auth Callback] Processing callback:', {
    hasTokenHash: !!token_hash,
    type,
    hasCode: !!code,
    next,
  })

  // Check if env vars are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Auth Callback] Missing Supabase environment variables')
    return NextResponse.redirect(`${origin}/login?error=config_error`)
  }

  // Create response object (will be returned with cookies set)
  const redirectUrl = new URL(next, origin)
  const response = NextResponse.redirect(redirectUrl)

  // Create Supabase client with cookie handling
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        // Set cookie on the response that will be sent to browser
        response.cookies.set({
          name,
          value,
          ...options,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({
          name,
          value: '',
          ...options,
          maxAge: 0,
        })
      },
    },
  })

  try {
    // Handle magic link / OTP flow
    if (token_hash && type) {
      console.log('[Auth Callback] Verifying OTP...')
      
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })

      if (error) {
        console.error('[Auth Callback] OTP verification failed:', error.message)
        return NextResponse.redirect(`${origin}/login?error=invalid_token`)
      }

      if (data.session) {
        console.log('[Auth Callback] OTP verified successfully, user:', data.user?.email)
        return response // Cookies are already set via the adapter
      }
    }

    // Handle PKCE flow (OAuth providers)
    if (code) {
      console.log('[Auth Callback] Exchanging code for session...')
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[Auth Callback] Code exchange failed:', error.message)
        return NextResponse.redirect(`${origin}/login?error=code_exchange_failed`)
      }

      if (data.session) {
        console.log('[Auth Callback] Code exchanged successfully, user:', data.user?.email)
        return response // Cookies are already set via the adapter
      }
    }

    // If we get here, no valid auth params were provided
    console.warn('[Auth Callback] No valid auth parameters found')
    return NextResponse.redirect(`${origin}/login?error=missing_params`)
    
  } catch (err) {
    console.error('[Auth Callback] Unexpected error:', err)
    return NextResponse.redirect(`${origin}/login?error=callback_error`)
  }
}
