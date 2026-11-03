import { createAnalyticsClient } from '@tinybirdco/analytics-client'

export interface TinybirdWorkspace {
  id: string
  name: string
}

// Dashboard requests must supply their own complete credential pair.
// Never read deployment credentials here, even for legacy session cookies.
export function getRequestCredentials(request: Request) {
  const token = request.headers.get('X-Tinybird-Token')
  const host = request.headers.get('X-Tinybird-Host')
  return token && host ? { token, host } : null
}

export function createClientWithCredentials(token: string, host: string) {
  return createAnalyticsClient({ token, baseUrl: host, devMode: false })
}

export async function getWorkspaceWithCredentials(
  token: string,
  host: string
): Promise<TinybirdWorkspace | null> {
  const url = new URL('/v1/workspace', host)

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
