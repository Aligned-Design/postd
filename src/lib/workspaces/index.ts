import { createClient } from '@/lib/supabase/serverClient'
import type { Workspace, WorkspaceWithRole } from '@/lib/types'

/**
 * Get all workspaces for a given user
 */
export async function getUserWorkspaces(userId: string): Promise<WorkspaceWithRole[]> {
  console.log('[Workspaces] getUserWorkspaces called for userId:', userId)
  const supabase = await createClient()

  // Check if we have a session
  const { data: { user: sessionUser } } = await supabase.auth.getUser()
  console.log('[Workspaces] Current session user:', sessionUser?.id, sessionUser?.email)

  const { data, error } = await supabase
    .from('workspace_members')
    .select(
      `
      role,
      workspace:workspaces (
        id,
        name,
        created_by,
        created_at
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[Workspaces] Error fetching user workspaces:', error)
    throw new Error(`Failed to fetch workspaces: ${error.message || JSON.stringify(error)}`)
  }

  console.log('[Workspaces] Found', data?.length || 0, 'workspace memberships')
  return (
    data?.map((item: any) => ({
      ...item.workspace,
      role: item.role,
    })) || []
  )
}

/**
 * Get the user's default workspace (first workspace they're a member of)
 */
export async function getUserDefaultWorkspace(userId: string): Promise<WorkspaceWithRole | null> {
  console.log('[Workspaces] getUserDefaultWorkspace called for userId:', userId)
  const workspaces = await getUserWorkspaces(userId)
  const defaultWorkspace = workspaces[0] || null
  
  if (defaultWorkspace) {
    console.log('[Workspaces] Found existing workspace:', defaultWorkspace.id, defaultWorkspace.name)
  } else {
    console.log('[Workspaces] No existing workspace found for user')
  }
  
  return defaultWorkspace
}

/**
 * Create a default workspace for a new user
 */
export async function createDefaultWorkspaceForUser(userId: string): Promise<Workspace> {
  console.log('[Workspaces] ========================================')
  console.log('[Workspaces] createDefaultWorkspaceForUser called for userId:', userId)
  const supabase = await createClient()

  // Get user email to create a personalized workspace name
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  console.log('[Workspaces] User from session:', user?.id, user?.email)
  
  const workspaceName = user?.email
    ? `${user.email.split('@')[0]}'s Workspace`
    : 'My Workspace'

  console.log('[Workspaces] Creating workspace with name:', workspaceName)

  // Create the workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      name: workspaceName,
      created_by: userId,
    })
    .select()
    .single()

  if (workspaceError) {
    console.error('[Workspaces] ❌ Error creating workspace:', workspaceError)
    console.error('[Workspaces] Error details:', {
      message: workspaceError.message,
      code: workspaceError.code,
      details: workspaceError.details,
      hint: workspaceError.hint,
    })
    throw new Error(
      `Failed to create workspace: ${workspaceError.message || JSON.stringify(workspaceError)}`
    )
  }

  console.log('[Workspaces] ✅ Workspace created successfully:', workspace.id, workspace.name)

  // Add the user as an owner
  console.log('[Workspaces] Adding user to workspace_members...')
  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: 'owner',
    })
    .select()
    .single()

  if (memberError) {
    console.error('[Workspaces] ❌ Error adding user to workspace:', memberError)
    console.error('[Workspaces] Error details:', {
      message: memberError.message,
      code: memberError.code,
      details: memberError.details,
      hint: memberError.hint,
    })
    throw new Error(
      `Failed to add user to workspace: ${memberError.message || JSON.stringify(memberError)}`
    )
  }

  console.log('[Workspaces] ✅ User added to workspace_members successfully')
  console.log('[Workspaces] ========================================')

  return workspace
}

/**
 * Ensure the user has at least one workspace
 * If not, create a default workspace
 */
export async function ensureUserHasWorkspace(userId: string): Promise<WorkspaceWithRole> {
  console.log('[Workspaces] ensureUserHasWorkspace called for userId:', userId)
  
  let workspace = await getUserDefaultWorkspace(userId)

  if (!workspace) {
    console.log('[Workspaces] No existing workspace found, creating new one...')
    const newWorkspace = await createDefaultWorkspaceForUser(userId)
    workspace = {
      ...newWorkspace,
      role: 'owner',
    }
    console.log('[Workspaces] New workspace created and assigned:', workspace.id)
  } else {
    console.log('[Workspaces] Using existing workspace:', workspace.id, workspace.name)
  }

  return workspace
}

/**
 * Get a specific workspace by ID (checks user membership)
 */
export async function getWorkspace(
  workspaceId: string,
  userId: string
): Promise<WorkspaceWithRole | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workspace_members')
    .select(
      `
      role,
      workspace:workspaces (
        id,
        name,
        created_by,
        created_at
      )
    `
    )
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    ...data.workspace,
    role: data.role,
  } as WorkspaceWithRole
}

