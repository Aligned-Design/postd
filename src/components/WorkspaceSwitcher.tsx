'use client'

import { useState, useEffect } from 'react'
import type { WorkspaceWithRole } from '@/lib/types'

interface WorkspaceSwitcherProps {
  currentWorkspace: WorkspaceWithRole
}

export function WorkspaceSwitcher({ currentWorkspace }: WorkspaceSwitcherProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([currentWorkspace])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // TODO: Fetch all user workspaces from API
    // For now, just show the current workspace
    setWorkspaces([currentWorkspace])
  }, [currentWorkspace])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span className="max-w-[200px] truncate">{currentWorkspace.name}</span>
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  workspace.id === currentWorkspace.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{workspace.name}</div>
                <div className="text-xs text-gray-500 capitalize">{workspace.role}</div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 p-2">
            <button className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
              + Create workspace
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

