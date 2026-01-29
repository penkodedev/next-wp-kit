import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import localesConfig from './i18n/locales.generated.json'

// Auto-generated from WordPress WPML (see src/utils/build/fetch-locales.ts)
const SUPPORTED_LOCALES = localesConfig.supportedLocales || ['en'];
const DEFAULT_LOCALE = localesConfig.defaultLocale || 'en';

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
  // Add validation to ensure locales are properly configured
  onError: (error: Error) => {
    console.error('⚠️  Middleware error:', error);
    return NextResponse.next();
  }
}
