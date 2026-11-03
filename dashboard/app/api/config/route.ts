import { NextRequest, NextResponse } from 'next/server'
import {
  getWorkspaceWithCredentials,
  resolveTinybirdCredentials,
} from '@/lib/server'

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
    const name =
      data.workspace_name || (data.name !== 'frontend_jwt' ? data.name : null)
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
  const headerWorkspace = request.headers.get('X-Tinybird-Workspace')
  const result = resolveTinybirdCredentials(request.headers)

  if ('error' in result) {
    if (result.missing) {
      return NextResponse.json({
        configured: false,
        missing: result.missing,
        workspace: null,
      })
    }
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { token, host, fromHeaders } = result.credentials
  const regionInfo = await getRegionInfoFromHost(host)

  // Use workspace name from header if provided (avoids permission issues with scoped JWT)
  // Otherwise fetch using credentials
  let workspaceName = headerWorkspace
  if (!workspaceName) {
    const tinybirdWorkspace = await getWorkspaceWithCredentials(token, host)
    workspaceName = tinybirdWorkspace?.name || null
  }

  // If still no workspace name and we have a token, try to decode it
  if (!workspaceName && fromHeaders) {
    workspaceName = extractWorkspaceNameFromToken(token)
  }

  return NextResponse.json({
    configured: true,
    missing: [],
    workspace: {
      name: workspaceName || 'Unknown',
      provider: regionInfo.provider,
      region: regionInfo.region,
    },
  })
}
