import { createClient } from '@/lib/supabase/serverClient'
import type { Workspace, WorkspaceWithRole } from '@/lib/types'

/**
 * Get all workspaces for a given user
 */
export async function getUserWorkspaces(userId: string): Promise<WorkspaceWithRole[]> {
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
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching user workspaces:', error)
    throw error
  }

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
  const workspaces = await getUserWorkspaces(userId)
  return workspaces[0] || null
}

/**
 * Create a default workspace for a new user
 */
export async function createDefaultWorkspaceForUser(userId: string): Promise<Workspace> {
  const supabase = await createClient()

  // Get user email to create a personalized workspace name
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const workspaceName = user?.email
    ? `${user.email.split('@')[0]}'s Workspace`
    : 'My Workspace'

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
    console.error('Error creating workspace:', workspaceError)
    throw workspaceError
  }

  // Add the user as an owner
  const { error: memberError } = await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: 'owner',
  })

  if (memberError) {
    console.error('Error adding user to workspace:', memberError)
    throw memberError
  }

  return workspace
}

/**
 * Ensure the user has at least one workspace
 * If not, create a default workspace
 */
export async function ensureUserHasWorkspace(userId: string): Promise<WorkspaceWithRole> {
  let workspace = await getUserDefaultWorkspace(userId)

  if (!workspace) {
    const newWorkspace = await createDefaultWorkspaceForUser(userId)
    workspace = {
      ...newWorkspace,
      role: 'owner',
    }
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

