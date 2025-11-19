import { getActiveWorkspaceFromRequest } from '@/lib/workspaces/getActiveWorkspace'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const context = await getActiveWorkspaceFromRequest()

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

