import { createAnalyticsClient } from '@tinybirdco/analytics-client'

const uiToApiHost: Record<string, string> = {
  'https://ui.tinybird.co': 'https://api.tinybird.co',
  'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
}

function getApiBaseUrl(host: string) {
  return uiToApiHost[host] ?? host
}

export function getServerClient() {
  const token = process.env.NEXT_PUBLIC_TINYBIRD_AUTH_TOKEN
  const host = process.env.NEXT_PUBLIC_TINYBIRD_HOST

  if (!token || !host) {
    const missing = []
    if (!token) missing.push('NEXT_PUBLIC_TINYBIRD_AUTH_TOKEN')
    if (!host) missing.push('NEXT_PUBLIC_TINYBIRD_HOST')
    throw new Error(
      `Tinybird configuration not found. Missing environment variables: ${missing.join(', ')}`
    )
  }

  return createAnalyticsClient({
    token,
    baseUrl: getApiBaseUrl(host),
  })
}
