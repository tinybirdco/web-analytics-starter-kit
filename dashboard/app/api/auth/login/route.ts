import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash, timingSafeEqual } from 'crypto'
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  getDashboardCredentials,
} from '@/lib/session'

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash('sha256').update(a).digest(),
    createHash('sha256').update(b).digest()
  )
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const credentials = getDashboardCredentials()
    if (!credentials) {
      return NextResponse.json(
        {
          error:
            'Dashboard login is not configured. Set DASHBOARD_PASSWORD to enable it.',
        },
        { status: 503 }
      )
    }

    if (
      typeof username === 'string' &&
      typeof password === 'string' &&
      safeEqual(username, credentials.username) &&
      safeEqual(password, credentials.password)
    ) {
      const cookieStore = await cookies()
      cookieStore.set(
        SESSION_COOKIE_NAME,
        await createSessionToken(credentials),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: SESSION_MAX_AGE,
          path: '/',
        }
      )

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
