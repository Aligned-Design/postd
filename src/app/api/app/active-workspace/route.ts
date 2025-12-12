import { isDevMode } from '@/lib/devMode'
import { getDevWorkspace } from '@/lib/workspaces/devWorkspace'
import { getActiveWorkspaceFromRequest } from '@/lib/workspaces/getActiveWorkspace'
import { NextResponse } from 'next/server'

/**
 * GET /api/app/active-workspace
 * 
 * SAFETY:
 * - Automatically handles dev mode and production auth
 * - Dev mode: Returns dev workspace
 * - Production: Returns authenticated user's workspace
 */

export async function GET() {
  try {
    // CONDITIONAL LOGIC: Dev mode vs Production
    const context = isDevMode() 
      ? getDevWorkspace()
      : await getActiveWorkspaceFromRequest()

    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      workspace: context.workspace,
      user: context.user,
    })
  } catch (error) {
    console.error('Error fetching active workspace:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

