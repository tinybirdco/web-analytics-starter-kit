import { NextRequest, NextResponse } from 'next/server'
import { getTinybirdConfig, getWorkspace, getWorkspaceWithCredentials } from '@/lib/server'

interface TinybirdRegionInfo {
  provider: string
  region: string
}

interface TinybirdRegionResponse {
  key: string
  name: string
  provider: string
  api_host: string
}

// Cache for regions to avoid repeated API calls

async function fetchTinybirdRegions(): Promise<TinybirdRegionResponse[]> {
  try {
    const response = await fetch('https://api.tinybird.co/v0/regions')
    if (response.ok) {
      const data = await response.json()
      return data?.regions ?? ([] as TinybirdRegionResponse[])
    }
  } catch {
    // Fall through to return empty array
  }

  return []
}

async function getRegionInfoFromHost(
  host: string
): Promise<TinybirdRegionInfo> {
  // Local development
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return { provider: 'Local', region: 'localhost' }
  }

  // Extract hostname from URL if needed
  let hostname = host
  try {
    hostname = new URL(host).hostname
  } catch {
    // Already a hostname, not a URL
  }

  const regions = await fetchTinybirdRegions()
  const region = regions.find(r => {
    try {
      return new URL(r.api_host).hostname === hostname
    } catch {
      return false
    }
  })

  if (region) {
    return {
      provider: region.provider.toUpperCase(),
      region: region.name,
    }
  }

  return { provider: 'Unknown', region: 'unknown' }
}

export async function GET(request: NextRequest) {
  // Check for token from headers first (public mode), then fall back to env vars
  const headerToken = request.headers.get('X-Tinybird-Token')
  const headerHost = request.headers.get('X-Tinybird-Host')
  const { token: envToken, host: envHost } = getTinybirdConfig()

  const token = headerToken || envToken
  const host = headerHost || envHost

  const missing: string[] = []
  if (!token) missing.push('TINYBIRD_TOKEN')
  if (!host) missing.push('TINYBIRD_HOST')

  const configured = missing.length === 0

  // Include workspace info if configured
  const regionInfo = host ? await getRegionInfoFromHost(host) : null

  // Fetch workspace using header credentials if provided, otherwise use env vars
  const tinybirdWorkspace = configured
    ? headerToken && headerHost
      ? await getWorkspaceWithCredentials(headerToken, headerHost)
      : await getWorkspace()
    : null

  const workspace =
    configured && host && regionInfo
      ? {
          name: tinybirdWorkspace?.name || 'Unknown',
          provider: regionInfo.provider,
          region: regionInfo.region,
        }
      : null

  return NextResponse.json({
    configured,
    missing,
    workspace,
  })
}
