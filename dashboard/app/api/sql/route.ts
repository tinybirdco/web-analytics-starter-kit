import { NextRequest, NextResponse } from 'next/server'
import { getTinybirdConfig } from '@/lib/tinybird-server'

const uiToApiHost: Record<string, string> = {
  'https://ui.tinybird.co': 'https://api.tinybird.co',
  'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
}

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'SQL query required' }, { status: 400 })
    }

    const { token, host } = getTinybirdConfig()

    if (!token || !host) {
      const missing = []
      if (!token) missing.push('TINYBIRD_TOKEN')
      if (!host) missing.push('TINYBIRD_HOST')
      return NextResponse.json(
        { error: `Tinybird configuration not found. Missing: ${missing.join(', ')}` },
        { status: 503 }
      )
    }

    const apiUrl = uiToApiHost[host] ?? host
    const response = await fetch(`${apiUrl}/v0/sql?q=${encodeURIComponent(sql)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error ?? 'Query failed' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('SQL query error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 }
    )
  }
}
