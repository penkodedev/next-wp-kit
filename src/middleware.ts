import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import localesConfig from './i18n/locales.generated.json'

// Auto-generated from WordPress WPML (see src/utils/build/fetch-locales.ts)
const SUPPORTED_LOCALES = localesConfig.supportedLocales || ['en'];
const DEFAULT_LOCALE = localesConfig.defaultLocale || 'en';

// Known aggressive crawlers and scrapers to block
const BLOCKED_BOT_PATTERNS = [
  /AhrefsBot/i,
  /SemrushBot/i,
  /MJ12bot/i,
  /DotBot/i,
  /BLEXBot/i,
  /PetalBot/i,
  /YandexBot/i,
  /Bytespider/i,
  /GPTBot/i,
  /CCBot/i,
  /DataForSeoBot/i,
  /serpstatbot/i,
  /linkdexbot/i,
  /SEOkicks/i,
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBlockedBot = BLOCKED_BOT_PATTERNS.some(pattern => pattern.test(userAgent));
  if (isBlockedBot) {
    return new NextResponse('Forbidden', { status: 403 });
  }

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

export function config() {
  return {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
  }
}
