import { NextRequest, NextResponse } from 'next/server'
import { getServerClient, getTinybirdConfig } from '@/lib/server'

const VALID_ENDPOINTS = [
  'currentVisitors',
  'domain',
  'domains',
  'actions',
  'kpis',
  'trend',
  'topBrowsers',
  'topDevices',
  'topLocations',
  'topPages',
  'topSources',
  'webVitalsCurrent',
  'webVitalsDistribution',
  'webVitalsRoutes',
  'webVitalsTimeseries',
] as const

type EndpointName = (typeof VALID_ENDPOINTS)[number]

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function isValidEndpoint(name: string): name is EndpointName {
  return VALID_ENDPOINTS.includes(name as EndpointName)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const endpointName = toCamelCase(name)

    if (!isValidEndpoint(endpointName)) {
      return NextResponse.json(
        { error: `Unknown endpoint: ${name}` },
        { status: 404 }
      )
    }

    const { token, host } = getTinybirdConfig()

    if (!token || !host) {
      const missing = []
      if (!token) missing.push('TINYBIRD_TOKEN')
      if (!host) missing.push('TINYBIRD_HOST')
      return NextResponse.json(
        {
          error: `Tinybird configuration not found. Missing: ${missing.join(
            ', '
          )}`,
        },
        { status: 503 }
      )
    }

    const client = getServerClient()
    const searchParams = request.nextUrl.searchParams
    const queryParams: Record<string, string> = {}

    searchParams.forEach((value, key) => {
      queryParams[key] = value
    })

    const queryFn = client.query[endpointName as keyof typeof client.query]
    if (!queryFn) {
      return NextResponse.json(
        { error: `Endpoint not available: ${endpointName}` },
        { status: 404 }
      )
    }

    const result = await (
      queryFn as (params: Record<string, string>) => Promise<unknown>
    )(queryParams)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Tinybird API error:', error)

    if (error instanceof Error) {
      const statusCode =
        'statusCode' in error
          ? (error as { statusCode: number }).statusCode
          : 500
      const { token, host } = getTinybirdConfig()
      return NextResponse.json(
        { error: error.message, token, host },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
