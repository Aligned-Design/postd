import { authenticateRequest, verifyWorkspaceMembership } from '@/lib/auth/apiAuth'
import { createClient } from '@/lib/supabase/serverClient'
import { NextResponse } from 'next/server'

/**
 * GET /api/workspaces/[workspaceId]/crawled-pages
 * 
 * SAFETY:
 * - Automatically handles dev mode and production auth
 * - Dev mode: Uses dev workspace
 * - Production: Enforces authentication and workspace membership
 */

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const workspaceId = params.workspaceId
    
    // Authenticate request (dev mode aware)
    const auth = await authenticateRequest()
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify workspace membership (dev mode aware)
    const membership = await verifyWorkspaceMembership(auth.user.id, workspaceId)
    
    if (!membership.isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Fetch crawled pages for this workspace
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('crawled_pages')
      .select('id, url, title, metadata, crawled_at')
      .eq('workspace_id', workspaceId)
      .order('crawled_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching crawled pages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pages' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ pages: data || [] })
  } catch (error) {
    console.error('Error in crawled-pages route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

