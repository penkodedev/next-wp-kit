// src/middleware.ts
// Middleware for locale detection in WP headless setup with WPML

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Extract pathname from the request
  const pathname = request.nextUrl.pathname

  // Detect locale from URL path (WPML format: /es/, /en/, etc.)
  // Default locale is 'es' (Spanish)
  const locale = pathname.split('/')[1] || 'es'

  // Create response and add locale to headers
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)

  return response
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}