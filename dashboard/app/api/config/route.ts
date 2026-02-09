import { NextResponse } from 'next/server'
import { getTinybirdConfig } from '@/lib/tinybird-server'

export const dynamic = 'force-dynamic'

const uiToApiHost: Record<string, string> = {
  'https://ui.tinybird.co': 'https://api.tinybird.co',
  'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
}

function getApiBaseUrl(host: string) {
  return uiToApiHost[host] ?? host
}

function getRegionFromHost(host: string): string {
  if (host.includes('us-east')) return 'us-east'
  if (host.includes('us-west')) return 'us-west'
  if (host.includes('eu-') || host.includes('europe')) return 'europe'
  if (host.includes('api.tinybird.co')) return 'eu'
  return 'unknown'
}

async function validateCredentials(token: string, host: string): Promise<boolean> {
  try {
    const apiUrl = getApiBaseUrl(host)
    const response = await fetch(`${apiUrl}/v0/datasources`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}

export async function GET() {
  const { token, host } = getTinybirdConfig()

  const missing: string[] = []
  if (!token) missing.push('TINYBIRD_TOKEN')
  if (!host) missing.push('TINYBIRD_HOST')

  const configured = missing.length === 0

  // Validate credentials if configured
  let valid = false
  if (configured && token && host) {
    valid = await validateCredentials(token, host)
  }

  // Include workspace info if configured and valid
  const workspace = configured && valid && host
    ? {
        name: process.env.TINYBIRD_WORKSPACE_NAME || 'Analytics',
        provider: 'tinybird',
        region: getRegionFromHost(host),
      }
    : null

  return NextResponse.json({
    configured,
    valid,
    missing,
    workspace,
  })
}
