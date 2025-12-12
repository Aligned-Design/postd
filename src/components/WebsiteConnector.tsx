'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Button } from './ui/button'

interface WebsiteConnectorProps {
  workspaceId: string
}

export function WebsiteConnector({ workspaceId }: WebsiteConnectorProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/sources/website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect website')
      }

      setMessage({
        type: 'success',
        text: `Success! Crawled ${data.result.pagesCrawled} pages from your website.`,
      })
      setUrl('')
      setShowForm(false)

      // Refresh the page to show new data
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to connect website',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-4 text-5xl">🌐</div>
        <CardTitle>Connect Website</CardTitle>
        <CardDescription>
          Let us crawl your website to understand your brand voice, messaging, and content style
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full">
            Add Website
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="website-url" className="block text-sm font-medium text-gray-700">
                Website URL
              </label>
              <input
                id="website-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 disabled:bg-gray-100"
              />
            </div>

            {message && (
              <div
                className={`rounded-md p-4 ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-green-50 text-green-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Crawling...' : 'Connect & Crawl'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setMessage(null)
                  setUrl('')
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <p className="mt-2 text-xs text-gray-500">
          We&apos;ll crawl up to 10 pages from your site to learn your brand
        </p>
      </CardContent>
    </Card>
  )
}

