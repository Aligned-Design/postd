import { authenticateRequest, verifyWorkspaceMembership } from '@/lib/auth/apiAuth'
import { createClient } from '@/lib/supabase/serverClient'
import { NextResponse } from 'next/server'

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
    
    // Fetch sources for this workspace with page counts
    const supabase = await createClient()
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, type, config, created_at, updated_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    
    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError)
      return NextResponse.json(
        { error: 'Failed to fetch sources' },
        { status: 500 }
      )
    }
    
    // For each source, count crawled pages and get latest crawl time
    const sourcesWithStats = await Promise.all(
      (sources || []).map(async (source: any) => {
        const { count } = await supabase
          .from('crawled_pages')
          .select('*', { count: 'exact', head: true })
          .eq('source_id', source.id)
        
        const { data: latestPage } = await supabase
          .from('crawled_pages')
          .select('crawled_at')
          .eq('source_id', source.id)
          .order('crawled_at', { ascending: false })
          .limit(1)
          .single()
        
        return {
          ...source,
          pages_count: count || 0,
          latest_crawl: latestPage?.crawled_at || null,
        }
      })
    )
    
    return NextResponse.json({ sources: sourcesWithStats })
  } catch (error) {
    console.error('Error in sources route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

