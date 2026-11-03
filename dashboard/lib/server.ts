import {
  AnalyticsClient,
  createAnalyticsClient,
} from '@tinybirdco/analytics-client'

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

let client: AnalyticsClient | null = null

export function isTinybirdConfigured(): boolean {
  const { token, host } = getTinybirdConfig()
  return !!token && !!host
}

export function getServerClient() {
  if (client) {
    return client
  }

  const { token, host } = getTinybirdConfig()

  if (!token || !host) {
    const missing = []
    if (!token) missing.push('TINYBIRD_TOKEN')
    if (!host) missing.push('TINYBIRD_HOST')
    throw new Error(
      `Tinybird configuration not found. Missing environment variables: ${missing.join(
        ', '
      )}`
    )
  }

  return createAnalyticsClient()
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

const UI_TO_API_HOST: Record<string, string> = {
  'https://ui.tinybird.co': 'https://api.tinybird.co',
  'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
}

const TINYBIRD_API_HOSTNAME = /^api(\.[a-z0-9-]+)*\.tinybird\.co$/
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1'])

function toApiOrigin(host: string): string | null {
  try {
    const { origin } = new URL(host)
    return UI_TO_API_HOST[origin] ?? origin
  } catch {
    return null
  }
}

function getExtraAllowedOrigins(): string[] {
  return [
    process.env.TINYBIRD_HOST,
    ...(process.env.TINYBIRD_ALLOWED_HOSTS ?? '').split(','),
  ]
    .map(host => host?.trim())
    .filter((host): host is string => !!host)
    .map(toApiOrigin)
    .filter((origin): origin is string => !!origin)
}

function isAllowedTinybirdOrigin(origin: string): boolean {
  if (getExtraAllowedOrigins().includes(origin)) {
    return true
  }
  const url = new URL(origin)
  if (
    url.protocol === 'https:' &&
    !url.port &&
    TINYBIRD_API_HOSTNAME.test(url.hostname)
  ) {
    return true
  }
  return (
    process.env.NODE_ENV !== 'production' && LOCAL_HOSTNAMES.has(url.hostname)
  )
}

export interface TinybirdCredentials {
  token: string
  host: string
  fromHeaders: boolean
}

export type TinybirdCredentialsResult =
  | { credentials: TinybirdCredentials }
  | { error: string; status: number; missing?: string[] }

export function resolveTinybirdCredentials(
  headers: Headers
): TinybirdCredentialsResult {
  const headerToken = headers.get('X-Tinybird-Token')
  if (headerToken) {
    const headerHost = headers.get('X-Tinybird-Host')
    const origin = headerHost ? toApiOrigin(headerHost) : null
    if (!origin || !isAllowedTinybirdOrigin(origin)) {
      return { error: 'Invalid or unsupported Tinybird host', status: 400 }
    }
    return {
      credentials: { token: headerToken, host: origin, fromHeaders: true },
    }
  }

  // The server token is only ever sent to the configured TINYBIRD_HOST,
  // never to a host taken from the request.
  const { token, host } = getTinybirdConfig()
  if (!token || !host) {
    const missing = []
    if (!token) missing.push('TINYBIRD_TOKEN')
    if (!host) missing.push('TINYBIRD_HOST')
    return {
      error: `Tinybird configuration not found. Missing: ${missing.join(', ')}`,
      status: 503,
      missing,
    }
  }
  return {
    credentials: {
      token,
      host: UI_TO_API_HOST[host] ?? host,
      fromHeaders: false,
    },
  }
}
