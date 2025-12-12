import { isDevMode } from '@/lib/devMode'
import { getDevWorkspace } from '@/lib/workspaces/devWorkspace'
import { getActiveWorkspaceFromRequest } from '@/lib/workspaces/getActiveWorkspace'
import { redirect } from 'next/navigation'
import { WebsiteConnector } from '@/components/WebsiteConnector'
import { CrawledPagesList } from '@/components/CrawledPagesList'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * App Dashboard Page
 * 
 * SAFETY:
 * - Automatically switches between dev mode and production auth
 * - Dev mode requires explicit opt-in
 * - Shows dev mode badge only when active
 */

export default async function AppDashboard() {
  // CONDITIONAL LOGIC: Dev mode vs Production auth
  const context = isDevMode() 
    ? getDevWorkspace() 
    : await getActiveWorkspaceFromRequest().then(ctx => {
        if (!ctx) redirect('/')
        return ctx
      })

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Welcome to POSTD</h1>
        <p className="text-gray-600">
          You&apos;re in the <span className="font-semibold">{context.workspace.name}</span> workspace
        </p>
        {/* Dev Mode Badge - Only shown when dev mode is active */}
        {isDevMode() && (
          <div className="mt-2">
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              🔓 Dev Mode - Using workspace: {context.workspace.id}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <WebsiteConnector workspaceId={context.workspace.id} />

        <Card>
          <CardHeader>
            <div className="mb-4 text-5xl">📱</div>
            <CardTitle>Connect Social Accounts</CardTitle>
            <CardDescription>
              Link your social media profiles so we can analyze your existing content and style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Coming Soon: Connect Social
            </Button>
            <p className="mt-2 text-xs text-gray-500">Phase 3: Social media connectors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-4 text-5xl">🎨</div>
            <CardTitle>Brand Guide</CardTitle>
            <CardDescription>
              View and refine your AI-generated brand guide based on your connected content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Coming Soon: View Brand Guide
            </Button>
            <p className="mt-2 text-xs text-gray-500">Phase 4: Brand guide generation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-4 text-5xl">✨</div>
            <CardTitle>Generate Content</CardTitle>
            <CardDescription>
              Create on-brand marketing content powered by AI and your brand guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Coming Soon: Generate Content
            </Button>
            <p className="mt-2 text-xs text-gray-500">Phase 5: Content generator</p>
          </CardContent>
        </Card>
      </div>

      {/* Crawled Pages Section */}
      <div className="mt-8">
        <CrawledPagesList workspaceId={context.workspace.id} />
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">🚀 Getting Started</h3>
        <p className="text-sm text-blue-800">
          Start by connecting your website above. We&apos;ll crawl up to 10 pages to understand your
          brand voice and content style. This data will later be used to generate a comprehensive
          brand guide.
        </p>
      </div>
    </div>
  )
}

