> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# Phase 2: Website Ingestion

## Overview

Phase 2 adds website crawling capabilities to POSTD, allowing workspaces to connect their website and automatically extract content for brand analysis.

## Goals

1. **Data Collection**: Crawl and store website content (text, metadata)
2. **Multi-Source Foundation**: Build a generic `sources` table that can later support social media, analytics, etc.
3. **Workspace Scoping**: Ensure all data is properly isolated per workspace
4. **Simple UX**: Easy one-click website connection with automatic crawling

## Database Schema

### `sources` Table

Tracks all inbound data sources for a workspace.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `workspace_id` | UUID | FK to workspaces table |
| `type` | TEXT | Source type: 'website' \| 'instagram' \| 'tiktok' \| 'linkedin' |
| `config` | JSONB | Source-specific configuration |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `workspace_id`
- `(workspace_id, type)`

**Example `config` for website:**
```json
{
  "url": "https://example.com"
}
```

### `crawled_pages` Table

Stores content extracted from website pages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `workspace_id` | UUID | FK to workspaces table |
| `source_id` | UUID | FK to sources table |
| `url` | TEXT | Page URL |
| `title` | TEXT | Page title |
| `content_text` | TEXT | Cleaned text content |
| `raw_html` | TEXT | Original HTML (optional) |
| `metadata` | JSONB | Additional page metadata |
| `crawled_at` | TIMESTAMPTZ | When page was crawled |

**Indexes:**
- `workspace_id`
- `source_id`
- `url` (for deduplication)

**Example `metadata`:**
```json
{
  "word_count": 1234,
  "h1": "Main Heading",
  "meta_description": "Page description..."
}
```

### Row-Level Security (RLS)

Both tables have RLS enabled with policies ensuring:
- Users can only access sources/pages for workspaces they're members of
- All CRUD operations respect workspace boundaries
- Server-side operations (crawler) use authenticated context

## System Flow

```
User → WebsiteConnector UI
  ↓
POST /api/workspaces/[id]/sources/website
  ↓
createWebsiteSource() → Creates/finds source
  ↓
crawlWebsite() → Starts crawl
  ↓
  For each page (up to maxPages):
    - Fetch HTML
    - Extract content with cheerio
    - Store in crawled_pages
    - Find internal links
  ↓
Return result → UI shows success
  ↓
CrawledPagesList → Displays pages
```

## Implementation Details

### Crawler Logic (`src/lib/crawler/websiteCrawler.ts`)

**Features:**
- Fetches HTML via `fetch` API
- Parses with `cheerio` for content extraction
- Prioritizes main content areas (`<main>`, `<article>`)
- Removes non-content elements (`<script>`, `<style>`, `<nav>`)
- Follows internal links (same hostname only)
- Configurable page limit (default: 10 pages)
- Upserts pages (prevents duplicates)

**Content Extraction Priority:**
1. `<main>` tag
2. `<article>` tag
3. `[role="main"]`
4. `.main-content` or `#main-content`
5. `.content` or `#content`
6. `<body>` (fallback)

**Metadata Extracted:**
- Page title
- H1 heading
- Meta description
- Word count
- URL

### API Routes

#### `POST /api/workspaces/[workspaceId]/sources/website`

Creates a website source and triggers crawl.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "source": {
    "id": "uuid",
    "workspace_id": "uuid",
    "type": "website",
    "config": { "url": "https://example.com" },
    "created_at": "2025-01-01T00:00:00Z"
  },
  "result": {
    "pagesCrawled": 8
  }
}
```

**Auth Requirements:**
- User must be authenticated
- User must be member of workspace

#### `GET /api/workspaces/[workspaceId]/sources`

Lists all sources for a workspace with statistics.

**Response:**
```json
{
  "sources": [
    {
      "id": "uuid",
      "type": "website",
      "config": { "url": "https://example.com" },
      "pages_count": 8,
      "latest_crawl": "2025-01-01T12:00:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### `GET /api/workspaces/[workspaceId]/crawled-pages`

Lists all crawled pages for a workspace.

**Response:**
```json
{
  "pages": [
    {
      "id": "uuid",
      "url": "https://example.com/about",
      "title": "About Us",
      "metadata": {
        "word_count": 543
      },
      "crawled_at": "2025-01-01T12:00:00Z"
    }
  ]
}
```

### Frontend Components

#### `WebsiteConnector` (`src/components/WebsiteConnector.tsx`)

- Displays "Connect Website" card
- Shows form to enter website URL
- Handles form submission
- Shows loading state during crawl
- Displays success/error messages
- Refreshes page on success

#### `CrawledPagesList` (`src/components/CrawledPagesList.tsx`)

- Fetches and displays connected sources
- Shows statistics (page count, last crawl date)
- Lists all crawled pages in a table
- Columns: URL, Title, Word Count, Crawled Date
- URLs are clickable (open in new tab)

## Limitations & TODOs

### Current Limitations

1. **Page Limit**: Only crawls first 10 pages (configurable but hardcoded)
2. **No robots.txt**: Doesn't check or respect robots.txt
3. **No Sitemap**: Doesn't parse sitemaps for better coverage
4. **Basic Content Extraction**: Simple text extraction, may miss dynamic content
5. **No JavaScript Rendering**: Can't crawl SPAs or JS-heavy sites
6. **Synchronous Crawling**: Crawl happens in API request (could timeout for large sites)
7. **No Re-crawling**: No mechanism to update existing pages

### Future Enhancements

**Short-term:**
- [ ] Respect robots.txt
- [ ] Add User-Agent header
- [ ] Better error handling and reporting
- [ ] Crawl progress indicator

**Medium-term:**
- [ ] Sitemap parsing for better discovery
- [ ] Background job queue for large crawls
- [ ] Re-crawl mechanism (detect changes)
- [ ] Configurable page limits per source
- [ ] Better content extraction (readability algorithms)

**Long-term:**
- [ ] JavaScript rendering (Puppeteer/Playwright)
- [ ] Image analysis and extraction
- [ ] PDF parsing
- [ ] Incremental crawling (only new/changed pages)
- [ ] Crawl scheduling (daily/weekly updates)

## Testing the Feature

### Manual Test Plan

1. **Setup**
   - Apply migration: `002_create_sources_and_crawled_pages.sql`
   - Restart dev server
   - Log in to POSTD

2. **Connect Website**
   - Go to `/app` dashboard
   - Click "Add Website" button
   - Enter a real website URL (e.g., `https://example.com`)
   - Click "Connect & Crawl"
   - Wait for "Crawling..." to complete

3. **Verify Results**
   - Success message shows pages crawled count
   - "Connected Websites" section appears
   - Website URL is listed with page count
   - "Crawled Pages" table shows individual pages
   - Each page shows: URL, Title, Word Count, Crawled Date

4. **Verify Data Scoping**
   - Create second workspace
   - Connect different website
   - Verify first workspace can't see second workspace's pages
   - Check database: all rows have correct `workspace_id`

5. **Test Edge Cases**
   - Try invalid URL (should show error)
   - Try same URL twice (should reuse existing source)
   - Try URL with trailing slash (should normalize)
   - Try URL without https:// (should add automatically)

### Database Verification

```sql
-- Check sources table
SELECT * FROM sources WHERE workspace_id = 'your-workspace-id';

-- Check crawled pages
SELECT 
  url, 
  title, 
  metadata->'word_count' as word_count,
  crawled_at 
FROM crawled_pages 
WHERE workspace_id = 'your-workspace-id'
ORDER BY crawled_at DESC;

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('sources', 'crawled_pages');
```

## Security Considerations

1. **Workspace Isolation**: RLS ensures users only see their workspace's data
2. **Auth Required**: All API routes verify authentication and membership
3. **URL Validation**: URLs are normalized and validated before crawling
4. **Rate Limiting**: Consider adding rate limits to prevent abuse (future)
5. **Robots.txt**: Should be respected to avoid crawling restricted content (TODO)

## Performance Considerations

1. **Crawl Speed**: Currently synchronous, may timeout on large sites
2. **Database Size**: Raw HTML storage can grow large (consider cleanup policy)
3. **Indexing**: Proper indexes on workspace_id and source_id for fast queries
4. **Concurrent Crawls**: No protection against multiple simultaneous crawls (future)

## Related Documentation

- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Overall system architecture
- [MULTI_TENANCY.md](../architecture/MULTI_TENANCY.md) - Workspace scoping patterns
- [RULES.md](../development/RULES.md) - Development standards

## Migration Path to Phase 3

Phase 3 will add social media connectors (Instagram, TikTok, LinkedIn).

**Preparation done in Phase 2:**
- Generic `sources` table supports multiple types
- Source-specific config in JSONB field
- Same workspace scoping patterns
- Reusable API route structure

**Phase 3 changes needed:**
- Add new source types to check constraint
- Create connectors for each platform (OAuth flows)
- Store social posts/content in similar structure
- Extend UI to show social sources

The generic design of `sources` and workspace scoping patterns ensure Phase 3 will integrate cleanly.

