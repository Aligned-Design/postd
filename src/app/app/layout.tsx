import { getActiveWorkspaceFromRequest } from '@/lib/workspaces/getActiveWorkspace'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/AppHeader'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await getActiveWorkspaceFromRequest()

  if (!context) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader workspace={context.workspace} userEmail={context.user.email} />
      <main className="flex-1">{children}</main>
    </div>
  )
}

