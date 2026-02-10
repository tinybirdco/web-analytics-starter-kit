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

// Try to extract workspace name from JWT token payload
function extractWorkspaceNameFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 =
      payload.replace(/-/g, '+').replace(/_/g, '/') +
      '==='.slice((payload.length + 3) % 4)
    const json = Buffer.from(base64, 'base64').toString()
    const data = JSON.parse(json)
    // Skip 'frontend_jwt' as it's just a token label, not workspace name
    const name = data.workspace_name || (data.name !== 'frontend_jwt' ? data.name : null)
    return name || null
  } catch {
    return null
  }
}

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
  const headerWorkspace = request.headers.get('X-Tinybird-Workspace')
  const { token: envToken, host: envHost } = getTinybirdConfig()

  const token = headerToken || envToken
  const host = headerHost || envHost

  const missing: string[] = []
  if (!token) missing.push('TINYBIRD_TOKEN')
  if (!host) missing.push('TINYBIRD_HOST')

  const configured = missing.length === 0

  // Include workspace info if configured
  const regionInfo = host ? await getRegionInfoFromHost(host) : null

  // Use workspace name from header if provided (avoids permission issues with scoped JWT)
  // Otherwise fetch using credentials
  let workspaceName = headerWorkspace
  if (!workspaceName && configured) {
    const tinybirdWorkspace = headerToken && headerHost
      ? await getWorkspaceWithCredentials(headerToken, headerHost)
      : await getWorkspace()
    workspaceName = tinybirdWorkspace?.name || null
  }

  // If still no workspace name and we have a token, try to decode it
  if (!workspaceName && headerToken) {
    workspaceName = extractWorkspaceNameFromToken(headerToken)
  }

  const workspace =
    configured && host && regionInfo
      ? {
          name: workspaceName || 'Unknown',
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
