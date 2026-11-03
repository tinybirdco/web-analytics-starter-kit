import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session'

// GET - Check auth status
export async function GET(request: NextRequest) {
  // If auth is disabled, always return authenticated
  if (process.env.DISABLE_AUTH === 'true') {
    return NextResponse.json({ authenticated: true })
  }

  // Check for token auth from headers (passed from URL params by client)
  const headerToken = request.headers.get('X-Tinybird-Token')
  const headerHost = request.headers.get('X-Tinybird-Host')
  if (headerToken && headerHost) {
    return NextResponse.json({ authenticated: true })
  }

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  return NextResponse.json({
    authenticated: await verifySessionToken(sessionCookie?.value),
  })
}
