import { authenticateRequest, verifyWorkspaceMembership } from '@/lib/auth/apiAuth'
import { createWebsiteSource } from '@/lib/sources'
import { crawlWebsite } from '@/lib/crawler/websiteCrawler'
import { NextResponse } from 'next/server'

/**
 * POST /api/workspaces/[workspaceId]/sources/website
 * 
 * SAFETY:
 * - Automatically handles dev mode and production auth
 * - Dev mode: Uses dev workspace
 * - Production: Enforces authentication and workspace membership
 */

export async function POST(
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
    
    // Parse request body
    const body = await request.json()
    const { url } = body
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
    
    // Create or get existing source
    const source = await createWebsiteSource(workspaceId, url)
    
    // Trigger crawl (limit to 10 pages for now)
    const result = await crawlWebsite(workspaceId, source, { maxPages: 10 })
    
    return NextResponse.json({
      source,
      result,
    })
  } catch (error) {
    console.error('Error creating website source:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

