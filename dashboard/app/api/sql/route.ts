import { NextRequest, NextResponse } from 'next/server'
import { resolveTinybirdCredentials } from '@/lib/server'

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'SQL query required' }, { status: 400 })
    }

    const result = resolveTinybirdCredentials(request.headers)
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    const { token, host } = result.credentials
    const response = await fetch(
      `${host}/v0/sql?q=${encodeURIComponent(sql)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

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
