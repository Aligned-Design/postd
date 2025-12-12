'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browserClient'

/**
 * Login Page - Email + Password Authentication
 * 
 * Features:
 * - Email/password authentication with signup and login modes
 * - Password show/hide toggle
 * - Fixes "signup but not logged in" issue by immediately logging in after signup
 * - No email verification required (for dev)
 * 
 * Key Fix:
 * After signup, if Supabase doesn't return a session (e.g., email confirmation enabled),
 * we immediately call signInWithPassword to establish a session anyway.
 */

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // If already logged in, redirect to /app
  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      if (data?.user) {
        router.replace('/app')
      }
    })
  }, [router, supabase])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      if (mode === 'signup') {
        // 1) Create the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        // 2) If Supabase did NOT give us a session (e.g. email confirm required),
        //    immediately log in with email + password.
        if (!data.session) {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (loginError) throw loginError
        }
      } else {
        // Login mode
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }

      // If we get here, we definitely have a session. Go to /app.
      router.push('/app')
    } catch (err: any) {
      console.error('Auth error:', err)
      setErrorMsg(err?.message || 'Something went wrong, please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-semibold">
          {mode === 'login' ? 'Log in to Postd' : 'Create your Postd account'}
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Use your email and a password. No email verification flow right now.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-xs text-gray-500"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="underline" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="underline" onClick={() => setMode('login')}>
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

