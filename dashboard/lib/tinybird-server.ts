import { createAnalyticsClient } from '@tinybirdco/analytics-client'

const uiToApiHost: Record<string, string> = {
  'https://ui.tinybird.co': 'https://api.tinybird.co',
  'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
}

function getApiBaseUrl(host: string) {
  return uiToApiHost[host] ?? host
}

export interface TinybirdWorkspace {
  id: string
  name: string
}

export function getTinybirdConfig() {
  return {
    token: process.env.TINYBIRD_TOKEN,
    host: process.env.TINYBIRD_HOST,
  }
}

export function isTinybirdConfigured(): boolean {
  const { token, host } = getTinybirdConfig()
  return !!token && !!host
}

export function getServerClient() {
  const { token, host } = getTinybirdConfig()

  if (!token || !host) {
    const missing = []
    if (!token) missing.push('TINYBIRD_TOKEN')
    if (!host) missing.push('TINYBIRD_HOST')
    throw new Error(
      `Tinybird configuration not found. Missing environment variables: ${missing.join(', ')}`
    )
  }

  return createAnalyticsClient({
    token,
    baseUrl: getApiBaseUrl(host),
  })
}

export async function getWorkspace(): Promise<TinybirdWorkspace | null> {
  const { token, host } = getTinybirdConfig()

  if (!token || !host) {
    return null
  }

  const baseUrl = getApiBaseUrl(host)
  const url = new URL('/v0/workspace', baseUrl)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as TinybirdWorkspace
  return data
}
