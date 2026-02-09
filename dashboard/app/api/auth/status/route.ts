import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'dashboard_session'

export async function GET() {
  // If auth is disabled, always return authenticated
  if (process.env.DISABLE_AUTH === 'true') {
    return NextResponse.json({ authenticated: true })
  }

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  return NextResponse.json({
    authenticated: !!sessionCookie?.value,
  })
}
