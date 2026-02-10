import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

const SESSION_COOKIE_NAME = 'dashboard_session'

function hashCredentials(username: string, password: string): string {
  return createHash('sha256').update(`${username}:${password}`).digest('hex')
}

function validateSession(sessionToken: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
    const { username, hash } = decoded

    // Get current credentials
    const expectedUsername = process.env.DASHBOARD_USERNAME || 'admin'
    const expectedPassword = process.env.DASHBOARD_PASSWORD || 'admin'

    // Verify username matches and hash is valid
    if (username !== expectedUsername) {
      return false
    }

    const expectedHash = hashCredentials(expectedUsername, expectedPassword)
    return hash === expectedHash
  } catch {
    // Invalid session format (could be old format), treat as invalid
    return false
  }
}

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

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false })
  }

  const isValid = validateSession(sessionCookie.value)

  return NextResponse.json({
    authenticated: isValid,
  })
}
