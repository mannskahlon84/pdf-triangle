import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// MOCK: This middleware simulates a real authentication flow
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Owner specific routes
  if (pathname.startsWith('/owner-dashboard')) {
    const role = request.cookies.get('mock_role')?.value;
    if (role !== 'owner') {
      return NextResponse.redirect(new URL('/owner-login', request.url))
    }
  }
  
  // 2. Customer specific routes
  if (pathname.startsWith('/dashboard')) {
    const role = request.cookies.get('mock_role')?.value;
    if (role !== 'customer') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/owner-dashboard/:path*', '/dashboard/:path*'],
}
