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
  console.log('[getActiveWorkspace] ======================================')
  console.log('[getActiveWorkspace] Starting getActiveWorkspaceFromRequest...')
  
  try {
    const supabase = await createClient()

    console.log('[getActiveWorkspace] Getting user from auth...')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('[getActiveWorkspace] ❌ Auth error:', authError)
      return null
    }

    if (!user) {
      console.log('[getActiveWorkspace] No user found in session')
      return null
    }

    console.log('[getActiveWorkspace] ✅ User authenticated:', user.id, user.email)

    // Ensure user has a workspace and get it
    console.log('[getActiveWorkspace] Calling ensureUserHasWorkspace...')
    const workspace = await ensureUserHasWorkspace(user.id)
    
    console.log('[getActiveWorkspace] ✅ Workspace ready:', workspace.id, workspace.name)

    const context = {
      workspace,
      user: {
        id: user.id,
        email: user.email || '',
      },
    }
    
    console.log('[getActiveWorkspace] ✅ Returning context successfully')
    console.log('[getActiveWorkspace] ======================================')
    
    return context
  } catch (error) {
    console.error('[getActiveWorkspace] ❌ ERROR in getActiveWorkspaceFromRequest:', error)
    console.error('[getActiveWorkspace] Error type:', error?.constructor?.name)
    console.error('[getActiveWorkspace] Error message:', error instanceof Error ? error.message : String(error))
    console.error('[getActiveWorkspace] Full error:', error)
    console.log('[getActiveWorkspace] ======================================')
    // Re-throw so calling code can handle it
    throw error
  }
}

