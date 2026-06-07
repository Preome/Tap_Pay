import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/user-dashboard', '/merchant-dashboard', '/agent-dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/user-dashboard/:path*',
    '/merchant-dashboard/:path*',
    '/agent-dashboard/:path*',
  ],
}
