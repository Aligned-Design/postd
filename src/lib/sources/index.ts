import { createClient } from '@/lib/supabase/serverClient'
import type { Source, WebsiteSourceConfig } from '@/lib/types'

/**
 * Normalize a URL (add https:// if missing, remove trailing slash)
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim()
  
  // Add https:// if no protocol
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized
  }
  
  // Remove trailing slash
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  
  return normalized
}

/**
 * Create a website source for a workspace, or return existing if URL already registered
 */
export async function createWebsiteSource(
  workspaceId: string,
  url: string
): Promise<Source> {
  const supabase = await createClient()
  const normalizedUrl = normalizeUrl(url)
  
  // Check if source already exists for this workspace + URL
  const { data: existing } = await supabase
    .from('sources')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('type', 'website')
    .eq('config->>url', normalizedUrl)
    .single()
  
  if (existing) {
    return existing as Source
  }
  
  // Create new source
  const config: WebsiteSourceConfig = { url: normalizedUrl }
  
  const { data, error } = await supabase
    .from('sources')
    .insert({
      workspace_id: workspaceId,
      type: 'website',
      config,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating website source:', error)
    throw error
  }
  
  return data as Source
}

/**
 * Get all website sources for a workspace
 */
export async function getWorkspaceWebsiteSources(
  workspaceId: string
): Promise<Source[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('type', 'website')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching website sources:', error)
    throw error
  }
  
  return (data as Source[]) || []
}

/**
 * Get a specific source by ID (checks workspace membership via RLS)
 */
export async function getSource(sourceId: string): Promise<Source | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('id', sourceId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data as Source
}

