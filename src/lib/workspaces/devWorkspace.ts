import { assertDevMode } from '@/lib/devMode'

/**
 * Dev Mode Workspace Helper
 * 
 * ⚠️ DEV MODE ONLY - Authentication is bypassed
 * 
 * SAFETY:
 * - This function will THROW if dev mode is not enabled
 * - Dev mode is disabled by default in production
 * - Requires explicit opt-in via NEXT_PUBLIC_DEV_MODE_ENABLED=true
 * 
 * This provides a fixed workspace for development without requiring authentication.
 * The workspace ID comes from the NEXT_PUBLIC_DEV_WORKSPACE_ID environment variable.
 * 
 * Usage:
 * import { isDevMode } from '@/lib/devMode'
 * import { getDevWorkspace } from '@/lib/workspaces/devWorkspace'
 * 
 * if (isDevMode()) {
 *   const context = getDevWorkspace()
 * } else {
 *   const context = await getActiveWorkspaceFromRequest()
 * }
 */

export interface DevWorkspaceContext {
  workspace: {
    id: string
    name: string
    role: string
    created_by: string
    created_at: string
  }
  user: {
    id: string
    email: string
  }
}

/**
 * Get the dev workspace without any authentication
 * 
 * SAFETY: This will throw if dev mode is not enabled
 * Use isDevMode() to check before calling this function
 */
export function getDevWorkspace(): DevWorkspaceContext {
  // SAFETY RAIL: Ensure dev mode is actually enabled
  assertDevMode()

  const devWorkspaceId = process.env.NEXT_PUBLIC_DEV_WORKSPACE_ID!

  console.log('[DevWorkspace] ✅ Using dev workspace:', devWorkspaceId)

  return {
    workspace: {
      id: devWorkspaceId,
      name: 'Dev Workspace',
      role: 'owner',
      created_by: 'dev-user',
      created_at: new Date().toISOString(),
    },
    user: {
      id: 'dev-user',
      email: 'dev@postd.local',
    },
  }
}

