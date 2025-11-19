'use client'

import { createClient } from '@/lib/supabase/browserClient'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import type { WorkspaceWithRole } from '@/lib/types'

interface AppHeaderProps {
  workspace: WorkspaceWithRole
  userEmail: string
}

export function AppHeader({ workspace, userEmail }: AppHeaderProps) {
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
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-primary-600">POSTD</h1>
          <WorkspaceSwitcher currentWorkspace={workspace} />
        </div>
        <nav className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{userEmail}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </nav>
      </div>
    </header>
  )
}

