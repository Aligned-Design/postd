'use client'

import { useEffect, useState } from 'react'
import type { WorkspaceWithRole } from '@/lib/types'

interface ActiveWorkspaceData {
  workspace: WorkspaceWithRole
  user: {
    id: string
    email: string
  }
}

/**
 * Hook to fetch and manage the active workspace on the client side
 * Note: For server components, use getActiveWorkspaceFromRequest instead
 */
export function useActiveWorkspace() {
  const [data, setData] = useState<ActiveWorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const response = await fetch('/api/app/active-workspace')
        if (!response.ok) {
          throw new Error('Failed to fetch workspace')
        }
        const data = await response.json()
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspace()
  }, [])

  return { data, loading, error }
}

