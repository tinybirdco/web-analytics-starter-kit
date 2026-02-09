import { NextResponse } from 'next/server'
import { getTinybirdConfig } from '@/lib/tinybird-server'

function getRegionFromHost(host: string): string {
  if (host.includes('us-east')) return 'us-east'
  if (host.includes('us-west')) return 'us-west'
  if (host.includes('eu-') || host.includes('europe')) return 'europe'
  if (host.includes('api.tinybird.co')) return 'eu'
  return 'unknown'
}

export async function GET() {
  const { token, host } = getTinybirdConfig()

  const missing: string[] = []
  if (!token) missing.push('TINYBIRD_TOKEN')
  if (!host) missing.push('TINYBIRD_HOST')

  const configured = missing.length === 0

  // Include workspace info if configured
  const workspace = configured && host
    ? {
        name: process.env.TINYBIRD_WORKSPACE_NAME || 'Analytics',
        provider: 'tinybird',
        region: getRegionFromHost(host),
      }
    : null

  return NextResponse.json({
    configured,
    missing,
    workspace,
  })
}
