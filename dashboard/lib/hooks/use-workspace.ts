'use client'

import useSWR from 'swr'

interface WorkspaceInfo {
  name: string
  provider: string
  region: string
}

interface ConfigResponse {
  configured: boolean
  missing: string[]
  workspace: WorkspaceInfo | null
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useWorkspace() {
  const { data, error, isLoading } = useSWR<ConfigResponse>('/api/config', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    workspace: data?.workspace ?? null,
    isLoading,
    error,
  }
}
