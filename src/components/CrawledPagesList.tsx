'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

interface CrawledPage {
  id: string
  url: string
  title: string | null
  metadata: {
    word_count?: number
  }
  crawled_at: string
}

interface Source {
  id: string
  type: string
  config: {
    url?: string
  }
  pages_count: number
  latest_crawl: string | null
  created_at: string
}

interface CrawledPagesListProps {
  workspaceId: string
}

export function CrawledPagesList({ workspaceId }: CrawledPagesListProps) {
  const [pages, setPages] = useState<CrawledPage[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch sources
        const sourcesRes = await fetch(`/api/workspaces/${workspaceId}/sources`)
        if (sourcesRes.ok) {
          const sourcesData = await sourcesRes.json()
          setSources(sourcesData.sources || [])
        }

        // Fetch pages
        const pagesRes = await fetch(`/api/workspaces/${workspaceId}/crawled-pages`)
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json()
          setPages(pagesData.pages || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [workspaceId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Website Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (sources.length === 0) {
    return null // Don't show if no sources connected yet
  }

  return (
    <div className="space-y-6">
      {/* Connected Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Websites</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.filter((s) => s.type === 'website').length === 0 ? (
            <p className="text-sm text-gray-500">No websites connected yet</p>
          ) : (
            <div className="space-y-4">
              {sources
                .filter((s) => s.type === 'website')
                .map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div>
                      <p className="font-medium">{source.config.url}</p>
                      <p className="text-sm text-gray-500">
                        {source.pages_count} {source.pages_count === 1 ? 'page' : 'pages'} crawled
                        {source.latest_crawl &&
                          ` • Last: ${new Date(source.latest_crawl).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crawled Pages */}
      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Crawled Pages ({pages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm">
                    <th className="pb-2 font-medium text-gray-600">Page</th>
                    <th className="pb-2 font-medium text-gray-600">Title</th>
                    <th className="pb-2 font-medium text-gray-600">Words</th>
                    <th className="pb-2 font-medium text-gray-600">Crawled</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {new URL(page.url).pathname || '/'}
                        </a>
                      </td>
                      <td className="py-3 text-sm text-gray-700">
                        {page.title || '-'}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {page.metadata.word_count?.toLocaleString() || '-'}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(page.crawled_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

