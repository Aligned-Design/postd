/**
 * API Route Authentication Helper
 * 
 * SAFETY:
 * - Automatically handles both dev mode and production auth
 * - In dev mode: Uses dev workspace without auth checks
 * - In production: Enforces real authentication
 * 
 * Usage in API routes:
 * 
 * import { authenticateRequest } from '@/lib/auth/apiAuth'
 * 
 * export async function GET(request: Request) {
 *   const auth = await authenticateRequest()
 *   
 *   if (!auth.authenticated) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *   }
 *   
 *   // Use auth.user and auth.workspace
 * }
 */

import { isDevMode } from '@/lib/devMode'
import { getDevWorkspace } from '@/lib/workspaces/devWorkspace'
import { createClient } from '@/lib/supabase/serverClient'

export interface ApiAuthContext {
  authenticated: boolean
  user: {
    id: string
    email: string
  } | null
  workspace?: {
    id: string
    name: string
    role: string
  }
}

/**
 * Authenticate an API request
 * 
 * Dev Mode: Returns dev workspace without auth checks
 * Production: Enforces Supabase authentication
 */
export async function authenticateRequest(): Promise<ApiAuthContext> {
  // DEV MODE PATH
  if (isDevMode()) {
    console.log('[ApiAuth] 🔓 Dev mode - bypassing auth')
    const devContext = getDevWorkspace()
    return {
      authenticated: true,
      user: devContext.user,
      workspace: devContext.workspace,
    }
  }

  // PRODUCTION MODE PATH
  console.log('[ApiAuth] 🔒 Production mode - checking auth')
  
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.log('[ApiAuth] No authenticated user')
      return {
        authenticated: false,
        user: null,
      }
    }

    console.log('[ApiAuth] ✅ User authenticated:', user.email)
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email || '',
      },
    }
  } catch (error) {
    console.error('[ApiAuth] Error during authentication:', error)
    return {
      authenticated: false,
      user: null,
    }
  }
}

/**
 * Verify workspace membership for a user
 * 
 * Dev Mode: Always returns true (dev workspace is assumed)
 * Production: Checks workspace_members table
 */
export async function verifyWorkspaceMembership(
  userId: string,
  workspaceId: string
): Promise<{ isMember: boolean; role?: string }> {
  // DEV MODE PATH
  if (isDevMode()) {
    console.log('[ApiAuth] 🔓 Dev mode - skipping membership check')
    return {
      isMember: true,
      role: 'owner',
    }
  }

  // PRODUCTION MODE PATH
  console.log('[ApiAuth] 🔒 Checking workspace membership')
  
  try {
    const supabase = await createClient()
    const { data: membership, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single()

    if (error || !membership) {
      console.log('[ApiAuth] User not a member of workspace')
      return { isMember: false }
    }

    console.log('[ApiAuth] ✅ User is workspace member with role:', membership.role)
    return {
      isMember: true,
      role: membership.role,
    }
  } catch (error) {
    console.error('[ApiAuth] Error checking membership:', error)
    return { isMember: false }
  }
}

