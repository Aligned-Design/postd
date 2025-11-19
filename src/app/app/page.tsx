import { getActiveWorkspaceFromRequest } from '@/lib/workspaces/getActiveWorkspace'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AppDashboard() {
  const context = await getActiveWorkspaceFromRequest()

  if (!context) {
    redirect('/')
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Welcome to POSTD</h1>
        <p className="text-gray-600">
          You're in the <span className="font-semibold">{context.workspace.name}</span> workspace
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-4 text-5xl">🌐</div>
            <CardTitle>Connect Website</CardTitle>
            <CardDescription>
              Let us crawl your website to understand your brand voice, messaging, and visual style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Coming Soon: Connect Website
            </Button>
            <p className="mt-2 text-xs text-gray-500">Phase 2: Website ingestion crawler</p>
          </CardContent>
        </Card>

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

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">🚀 Getting Started</h3>
        <p className="text-sm text-blue-800">
          This is your POSTD dashboard. Once you connect your website and social accounts, we'll
          analyze your content to create a comprehensive brand guide. You can then use this to
          generate perfectly on-brand marketing content.
        </p>
      </div>
    </div>
  )
}

