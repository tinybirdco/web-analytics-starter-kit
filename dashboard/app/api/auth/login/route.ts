import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

const SESSION_COOKIE_NAME = 'dashboard_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function hashCredentials(username: string, password: string): string {
  return createHash('sha256').update(`${username}:${password}`).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Default to admin/admin if not configured
    const expectedUsername = process.env.DASHBOARD_USERNAME || 'admin'
    const expectedPassword = process.env.DASHBOARD_PASSWORD || 'admin'

    if (username === expectedUsername && password === expectedPassword) {
      // Create session token with credentials hash for validation
      const credentialsHash = hashCredentials(username, password)
      const sessionToken = Buffer.from(
        JSON.stringify({ username, hash: credentialsHash, timestamp: Date.now() })
      ).toString('base64')

      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
