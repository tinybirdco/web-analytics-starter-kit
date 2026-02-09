import { NextResponse } from 'next/server'
import { getTinybirdConfig } from '@/lib/tinybird-server'

export async function GET() {
  const { token, host } = getTinybirdConfig()

  const missing: string[] = []
  if (!token) missing.push('TINYBIRD_TOKEN')
  if (!host) missing.push('TINYBIRD_HOST')

  return NextResponse.json({
    configured: missing.length === 0,
    missing,
  })
}
