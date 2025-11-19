'use client'

import { createClient } from '@/lib/supabase/browserClient'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'

interface HeaderProps {
  user?: {
    email: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-primary-600">POSTD</h1>
        </div>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => router.push('/login')}>
              Log in / Sign up
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

