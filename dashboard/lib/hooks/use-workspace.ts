'use client'

import useSWR from 'swr'
import { useEffect, useCallback } from 'react'

interface WorkspaceInfo {
  name: string
  provider: string
  region: string
}

interface ConfigResponse {
  configured: boolean
  valid: boolean
  missing: string[]
  workspace: WorkspaceInfo | null
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useWorkspace(onInvalidCredentials?: () => void) {
  const { data, error, isLoading } = useSWR<ConfigResponse>('/api/config', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const handleInvalidCredentials = useCallback(() => {
    if (onInvalidCredentials) {
      onInvalidCredentials()
    }
  }, [onInvalidCredentials])

  // Trigger logout if credentials are configured but invalid
  useEffect(() => {
    if (data && data.configured && !data.valid) {
      handleInvalidCredentials()
    }
  }, [data, handleInvalidCredentials])

  return {
    workspace: data?.workspace ?? null,
    isValid: data?.valid ?? false,
    isConfigured: data?.configured ?? false,
    isLoading,
    error,
  }
}
