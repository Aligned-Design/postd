// Core domain types for POSTD

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  created_by: string
  created_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: 'owner' | 'member'
  created_at: string
}

export interface WorkspaceWithRole extends Workspace {
  role: 'owner' | 'member'
}

// Re-export source types
export type { Source, SourceType, CrawledPage, WebsiteSourceConfig } from './sources'

