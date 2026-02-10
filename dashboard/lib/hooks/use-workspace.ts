'use client'

import useSWR from 'swr'
import { getStoredCredentials } from './use-login'

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

// Extract region info from host URL
function getRegionFromHost(host: string): { provider: string; region: string } {
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return { provider: 'Local', region: 'localhost' }
  }

  // Map common hosts to provider/region
  if (host.includes('europe-west2')) {
    return { provider: 'GCP', region: 'europe-west2' }
  }
  if (host.includes('api.tinybird.co') && !host.includes('us-east')) {
    return { provider: 'GCP', region: 'eu_shared' }
  }
  if (host.includes('us-east.tinybird.co')) {
    return { provider: 'GCP', region: 'us-east' }
  }
  if (host.includes('northamerica-northeast2')) {
    return { provider: 'GCP', region: 'northamerica-northeast2' }
  }
  if (host.includes('us-east.aws')) {
    return { provider: 'AWS', region: 'us-east' }
  }
  if (host.includes('us-west-2.aws')) {
    return { provider: 'AWS', region: 'us-west-2' }
  }
  if (host.includes('eu-central-1.aws')) {
    return { provider: 'AWS', region: 'eu-central-1' }
  }
  if (host.includes('eu-west-1.aws')) {
    return { provider: 'AWS', region: 'eu-west-1' }
  }

  return { provider: 'Unknown', region: 'unknown' }
}

const fetcher = (url: string) => {
  const credentials = getStoredCredentials()

  // If we have stored credentials with workspace info, return that directly
  if (credentials?.token && credentials?.host && credentials?.workspace) {
    const regionInfo = getRegionFromHost(credentials.host)
    return Promise.resolve({
      configured: true,
      missing: [],
      workspace: {
        name: credentials.workspace.name,
        provider: regionInfo.provider,
        region: regionInfo.region,
      },
    } as ConfigResponse)
  }

  const headers: HeadersInit = {}
  if (credentials?.token && credentials?.host) {
    headers['X-Tinybird-Token'] = credentials.token
    headers['X-Tinybird-Host'] = credentials.host
  }

  return fetch(url, { headers }).then(res => res.json())
}

export function useWorkspace() {
  const { data, error, isLoading } = useSWR<ConfigResponse>('/api/config', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    workspace: data?.workspace ?? null,
    isConfigured: data?.configured ?? false,
    isLoading,
    error,
  }
}
