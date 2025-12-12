import { isDevMode } from '@/lib/devMode'
import { getDevWorkspace } from '@/lib/workspaces/devWorkspace'
import { getActiveWorkspaceFromRequest } from '@/lib/workspaces/getActiveWorkspace'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/AppHeader'

/**
 * App Layout
 * 
 * SAFETY:
 * - Automatically switches between dev mode and production auth
 * - Dev mode requires explicit opt-in (NEXT_PUBLIC_DEV_MODE_ENABLED=true)
 * - Production always uses real authentication
 * 
 * Dev Mode:
 * - Uses fixed workspace from NEXT_PUBLIC_DEV_WORKSPACE_ID
 * - No auth checks
 * 
 * Production Mode:
 * - Requires authentication
 * - Loads user's actual workspace
 * - Redirects to / if not authenticated
 */

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('[AppLayout] ==========================================')
  
  // CONDITIONAL LOGIC: Dev mode vs Production auth
  if (isDevMode()) {
    // DEV MODE PATH
    console.log('[AppLayout] 🔓 Dev mode active - using dev workspace')
    const context = getDevWorkspace()
    console.log('[AppLayout] ✅ Dev workspace:', context.workspace.id)
    console.log('[AppLayout] ==========================================')

    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader workspace={context.workspace} userEmail={context.user.email} />
        <main className="flex-1">{children}</main>
        
        {/* Build indicator */}
        <div style={{ 
          position: 'fixed', 
          bottom: 10, 
          right: 10, 
          background: 'rgba(255, 105, 180, 0.9)', 
          padding: '4px 8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          borderRadius: '4px',
          zIndex: 9999,
          color: 'white',
          fontWeight: 'bold'
        }}>
          BUILD: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local'}
        </div>
      </div>
    )
  }

  // PRODUCTION MODE PATH
  console.log('[AppLayout] 🔒 Production mode - enforcing auth')
  
  try {
    const context = await getActiveWorkspaceFromRequest()

    if (!context) {
      console.log('[AppLayout] No auth context, redirecting to /')
      redirect('/')
    }

    console.log('[AppLayout] ✅ Auth context loaded')
    console.log('[AppLayout] User:', context.user.email)
    console.log('[AppLayout] Workspace:', context.workspace.name)
    console.log('[AppLayout] ==========================================')

    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader workspace={context.workspace} userEmail={context.user.email} />
        <main className="flex-1">{children}</main>
        
        {/* Build indicator */}
        <div style={{ 
          position: 'fixed', 
          bottom: 10, 
          right: 10, 
          background: 'rgba(255, 105, 180, 0.9)', 
          padding: '4px 8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          borderRadius: '4px',
          zIndex: 9999,
          color: 'white',
          fontWeight: 'bold'
        }}>
          BUILD: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local'}
        </div>
      </div>
    )
  } catch (error) {
    console.error('[AppLayout] ❌ ERROR loading workspace:', error)
    console.log('[AppLayout] ==========================================')
    redirect('/?error=workspace_load_failed')
  }
}

