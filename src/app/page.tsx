import { createClient } from '@/lib/supabase/serverClient'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If authenticated, redirect to app
  if (user) {
    redirect('/app')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="container max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Marketing content that's
            <span className="text-primary-600"> always on-brand</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            POSTD ingests your website and social presence to generate marketing content that
            matches your brand perfectly—every time.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
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
      <footer className="border-t border-gray-200 py-8">
        <div className="container text-center text-sm text-gray-600">
          © 2025 POSTD. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

