import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'dashboard_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Default to admin/admin if not configured
    const expectedUsername = process.env.DASHBOARD_USERNAME || 'admin'
    const expectedPassword = process.env.DASHBOARD_PASSWORD || 'admin'

    if (username === expectedUsername && password === expectedPassword) {
      // Create a simple session token
      const sessionToken = Buffer.from(
        `${username}:${Date.now()}`
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
