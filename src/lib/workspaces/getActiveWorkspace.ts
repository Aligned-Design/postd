import { createClient } from '@/lib/supabase/serverClient'
import { ensureUserHasWorkspace } from './index'
import type { WorkspaceWithRole } from '@/lib/types'

export interface ActiveWorkspaceContext {
  workspace: WorkspaceWithRole
  user: {
    id: string
    email: string
  }
}

/**
 * Get the active workspace from the server request context
 * This should be called from Server Components or API routes
 */
export async function getActiveWorkspaceFromRequest(): Promise<ActiveWorkspaceContext | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Ensure user has a workspace and get it
  const workspace = await ensureUserHasWorkspace(user.id)

  return {
    workspace,
    user: {
      id: user.id,
      email: user.email || '',
    },
  }
}

