import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supported locales (should match your i18n config)
const SUPPORTED_LOCALES = ['es', 'en', 'pt'];
const DEFAULT_LOCALE = 'es';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Only use first segment as locale if it's a valid locale
  const firstSegment = pathSegments[0];
  const locale = SUPPORTED_LOCALES.includes(firstSegment) 
    ? firstSegment 
    : DEFAULT_LOCALE;
  
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
