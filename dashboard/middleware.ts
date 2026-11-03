import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session'

export async function middleware(request: NextRequest) {
  // Skip auth if disabled (for development)
  if (process.env.DISABLE_AUTH === 'true') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow auth API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for token auth from headers (public mode)
  const headerToken = request.headers.get('X-Tinybird-Token')
  const headerHost = request.headers.get('X-Tinybird-Host')
  if (headerToken && headerHost) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  if (!(await verifySessionToken(sessionCookie?.value))) {
    // For API routes, return 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // For pages, allow request but let client-side handle login dialog
    // We use a custom header to signal auth status
    const response = NextResponse.next()
    response.headers.set('x-auth-status', 'unauthenticated')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
