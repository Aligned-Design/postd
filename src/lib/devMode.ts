/**
 * Dev Mode Configuration & Safety Rails
 * 
 * CRITICAL SAFETY:
 * - Dev mode MUST be disabled in production
 * - Dev mode should only work when explicitly enabled
 * - This prevents accidental auth bypass in production
 * 
 * Dev Mode Rules:
 * 1. ONLY enabled when ALL of the following are true:
 *    - NODE_ENV !== 'production'
 *    - NEXT_PUBLIC_DEV_WORKSPACE_ID is set
 *    - NEXT_PUBLIC_DEV_MODE_ENABLED === 'true' (explicit opt-in)
 * 
 * 2. In production (NODE_ENV === 'production'):
 *    - Dev mode is ALWAYS disabled, regardless of env vars
 *    - This is a hard safety rail
 * 
 * Usage:
 * import { isDevMode, DEV_MODE_CONFIG } from '@/lib/devMode'
 * 
 * if (isDevMode()) {
 *   // Use dev workspace
 * } else {
 *   // Use real auth
 * }
 */

// Check if we're in production
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Check if dev mode is explicitly enabled
const DEV_MODE_ENABLED = process.env.NEXT_PUBLIC_DEV_MODE_ENABLED === 'true'

// Check if dev workspace ID is configured
const HAS_DEV_WORKSPACE = Boolean(process.env.NEXT_PUBLIC_DEV_WORKSPACE_ID)

/**
 * Returns true if dev mode is active
 * 
 * Dev mode is ONLY active when:
 * - NOT in production
 * - NEXT_PUBLIC_DEV_MODE_ENABLED=true
 * - NEXT_PUBLIC_DEV_WORKSPACE_ID is set
 * 
 * In production, this ALWAYS returns false.
 */
export function isDevMode(): boolean {
  // SAFETY RAIL: Never enable dev mode in production
  if (IS_PRODUCTION) {
    return false
  }

  // Dev mode requires explicit opt-in AND workspace ID
  return DEV_MODE_ENABLED && HAS_DEV_WORKSPACE
}

/**
 * Configuration object for dev mode
 * Useful for debugging and displaying in UI
 */
export const DEV_MODE_CONFIG = {
  isProduction: IS_PRODUCTION,
  devModeEnabled: DEV_MODE_ENABLED,
  hasDevWorkspace: HAS_DEV_WORKSPACE,
  devWorkspaceId: process.env.NEXT_PUBLIC_DEV_WORKSPACE_ID || null,
  isActive: isDevMode(),
}

/**
 * Get dev mode status as a human-readable string
 * Useful for logging and debugging
 */
export function getDevModeStatus(): string {
  if (IS_PRODUCTION) {
    return '🔒 Production mode - Dev mode disabled'
  }

  if (!DEV_MODE_ENABLED) {
    return '⚠️ Dev mode not enabled - Set NEXT_PUBLIC_DEV_MODE_ENABLED=true'
  }

  if (!HAS_DEV_WORKSPACE) {
    return '⚠️ Dev workspace not configured - Set NEXT_PUBLIC_DEV_WORKSPACE_ID'
  }

  return '🔓 Dev mode active'
}

/**
 * Assert that dev mode is enabled
 * Throws an error if dev mode is not active
 * Use this in dev-only helpers to fail fast
 */
export function assertDevMode(): void {
  if (!isDevMode()) {
    throw new Error(
      `Dev mode is not enabled. Status: ${getDevModeStatus()}\n` +
        `To enable dev mode:\n` +
        `1. Set NEXT_PUBLIC_DEV_MODE_ENABLED=true in .env.local\n` +
        `2. Set NEXT_PUBLIC_DEV_WORKSPACE_ID=<your-workspace-uuid> in .env.local\n` +
        `3. Ensure NODE_ENV !== 'production'`
    )
  }
}

// Log dev mode status on import (server-side only)
if (typeof window === 'undefined') {
  console.log('[DevMode] ==========================================')
  console.log('[DevMode] Status:', getDevModeStatus())
  console.log('[DevMode] Config:', JSON.stringify(DEV_MODE_CONFIG, null, 2))
  console.log('[DevMode] ==========================================')
}

