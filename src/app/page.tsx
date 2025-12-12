'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DEV_MODE_CONFIG } from '@/lib/devMode'

/**
 * Public Landing Page (/)
 * 
 * SAFETY:
 * - Automatically switches between dev mode and production UI
 * - Dev mode: Shows "Enter Postd" → /app
 * - Production: Shows "Get Started" → /login
 */

export default function Home() {
  // Check if dev mode is active (client-side check)
  const isDevMode = DEV_MODE_CONFIG.isActive
  const ctaHref = isDevMode ? '/app' : '/login'
  const ctaText = isDevMode ? 'Enter Postd' : 'Get Started'

  return (
    <div className="flex min-h-screen flex-col">
      {/* Simple Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary-600">POSTD</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href={ctaHref}>
              <Button variant="primary" size="sm">
                {isDevMode ? 'Enter Postd' : 'Log in'}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="container max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Marketing content that&apos;s
            <span className="text-primary-600"> always on-brand</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            POSTD ingests your website and social presence to generate marketing content that
            matches your brand perfectly—every time.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href={ctaHref}>
              <Button size="lg">{ctaText}</Button>
            </Link>
          </div>

          {/* Dev Mode Badge - Only shown when dev mode is active */}
          {isDevMode && (
            <div className="mt-4">
              <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                🔓 Dev Mode - No Login Required
              </span>
            </div>
          )}

          {/* Feature Cards */}
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">🌐</div>
              <h3 className="mb-2 text-lg font-semibold">Connect Your Website</h3>
              <p className="text-sm text-gray-600">
                We crawl your site to understand your brand voice and messaging
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">📱</div>
              <h3 className="mb-2 text-lg font-semibold">Link Social Accounts</h3>
              <p className="text-sm text-gray-600">
                Connect your social profiles to analyze your content style
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">✨</div>
              <h3 className="mb-2 text-lg font-semibold">Generate On-Brand Content</h3>
              <p className="text-sm text-gray-600">
                Get AI-generated content that matches your unique brand
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container text-center text-sm text-gray-600">
          © 2025 POSTD. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

