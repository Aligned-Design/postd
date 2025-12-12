import * as cheerio from 'cheerio'
import { createClient } from '@/lib/supabase/serverClient'
import type { Source, WebsiteSourceConfig } from '@/lib/types'

interface CrawlOptions {
  maxPages?: number
}

interface CrawlResult {
  pagesCrawled: number
}

/**
 * Extract clean text content from HTML
 */
function extractContent(html: string, url: string): {
  title: string | null
  contentText: string
  metadata: Record<string, any>
} {
  const $ = cheerio.load(html)
  
  // Remove script, style, and other non-content elements
  $('script, style, nav, footer, header, aside, iframe, noscript').remove()
  
  // Get title
  const title = $('title').text().trim() || $('h1').first().text().trim() || null
  
  // Try to find main content
  let contentText = ''
  
  // Priority order for content extraction
  const contentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '#main-content',
    '.content',
    '#content',
    'body',
  ]
  
  for (const selector of contentSelectors) {
    const element = $(selector)
    if (element.length > 0) {
      contentText = element.text()
      break
    }
  }
  
  // Clean up whitespace
  contentText = contentText
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
  
  // Extract metadata
  const h1 = $('h1').first().text().trim() || null
  const metaDescription = $('meta[name="description"]').attr('content') || null
  const wordCount = contentText.split(/\s+/).length
  
  return {
    title,
    contentText,
    metadata: {
      word_count: wordCount,
      h1,
      meta_description: metaDescription,
      url,
    },
  }
}

/**
 * Extract internal links from HTML
 */
function extractInternalLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html)
  const links: Set<string> = new Set()
  const baseDomain = new URL(baseUrl).hostname
  
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href')
    if (!href) return
    
    try {
      // Resolve relative URLs
      const absoluteUrl = new URL(href, baseUrl)
      
      // Only include same-domain links
      if (absoluteUrl.hostname === baseDomain) {
        // Remove hash and query params for deduplication
        const cleanUrl = `${absoluteUrl.origin}${absoluteUrl.pathname}`
        if (cleanUrl !== baseUrl) {
          links.add(cleanUrl)
        }
      }
    } catch (e) {
      // Invalid URL, skip
    }
  })
  
  return Array.from(links)
}

/**
 * Fetch and parse a single page
 */
async function crawlPage(
  url: string,
  workspaceId: string,
  sourceId: string
): Promise<string[]> {
  try {
    // TODO: Respect robots.txt
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'POSTD-Bot/1.0',
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    })
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`)
      return []
    }
    
    const html = await response.text()
    const { title, contentText, metadata } = extractContent(html, url)
    
    // Store in database (upsert based on workspace_id, source_id, url)
    const supabase = await createClient()
    
    // Check if page already exists
    const { data: existing } = await supabase
      .from('crawled_pages')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('source_id', sourceId)
      .eq('url', url)
      .single()
    
    if (existing) {
      // Update existing page
      await supabase
        .from('crawled_pages')
        .update({
          title,
          content_text: contentText,
          raw_html: html,
          metadata,
          crawled_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      // Insert new page
      await supabase.from('crawled_pages').insert({
        workspace_id: workspaceId,
        source_id: sourceId,
        url,
        title,
        content_text: contentText,
        raw_html: html,
        metadata,
      })
    }
    
    // Extract internal links for further crawling
    return extractInternalLinks(html, url)
  } catch (error) {
    console.error(`Error crawling ${url}:`, error)
    return []
  }
}

/**
 * Crawl a website starting from the main URL
 */
export async function crawlWebsite(
  workspaceId: string,
  source: Source,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const { maxPages = 10 } = options
  const config = source.config as WebsiteSourceConfig
  const startUrl = config.url
  
  const visited = new Set<string>()
  const toVisit = [startUrl]
  let pagesCrawled = 0
  
  while (toVisit.length > 0 && pagesCrawled < maxPages) {
    const url = toVisit.shift()!
    
    if (visited.has(url)) {
      continue
    }
    
    visited.add(url)
    console.log(`Crawling page ${pagesCrawled + 1}/${maxPages}: ${url}`)
    
    const links = await crawlPage(url, workspaceId, source.id)
    pagesCrawled++
    
    // Add new links to queue
    for (const link of links) {
      if (!visited.has(link) && !toVisit.includes(link)) {
        toVisit.push(link)
      }
    }
  }
  
  console.log(`Crawl complete. Crawled ${pagesCrawled} pages.`)
  
  return { pagesCrawled }
}

