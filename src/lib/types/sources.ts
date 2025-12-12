// Source types for Phase 2+

export type SourceType = 'website' | 'instagram' | 'tiktok' | 'linkedin'

export interface WebsiteSourceConfig {
  url: string
}

export interface Source {
  id: string
  workspace_id: string
  type: SourceType
  config: WebsiteSourceConfig | Record<string, any>
  created_at: string
  updated_at: string
}

export interface CrawledPage {
  id: string
  workspace_id: string
  source_id: string
  url: string
  title: string | null
  content_text: string | null
  raw_html: string | null
  metadata: {
    word_count?: number
    h1?: string
    meta_description?: string
    [key: string]: any
  }
  crawled_at: string
}

