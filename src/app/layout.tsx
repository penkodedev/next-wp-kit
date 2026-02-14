// src/app/layout.tsx

import type { Metadata } from 'next';
import type { ReactNode } from "react";
import dynamic from 'next/dynamic';

import 'swiper/css/bundle';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SWRConfig } from 'swr';

import "@/styles/sass/main.scss";

import HeaderServer from '@/components/layout/header/HeaderServer';
import Footer from "@/components/layout/footer/Footer";

import CodeBlockCopier from "@/components/ui/CodeBlockCopier";

import CookieConsent from "@/components/cookies/CookieConsent";
import CookieManager from "@/components/cookies/CookieManager";
import ScrollToTop from "@/components/navigation/ScrollToTop";
import AdvertisingPopup from '@/components/features/modals/AdvertisingPopup';
import WpStyles from "@/components/wordpress/WpStyles";

import BodyClass from "@/utils/wordpress/BodyClass";
import { WpPageIdProvider } from '@/utils/wordpress/WpPageIdContext';
import localesConfig from '@/i18n/locales.generated.json';
import Analytics from '@/components/tracking/Analytics';
import { safeGetSiteInfo } from '@/api/wordpressApi';


// Lazy load heavy components that aren't needed on every page
const ModalController = dynamic(() => import('@/components/features/modals/ModalController'), {
  ssr: false
});

const SmoothScroll = dynamic(() => import('@/components/animations/lenis/SmoothScroll'), {
  ssr: false
});

const ScrollProgress = dynamic(() => import('@/components/animations/ScrollProgress'), {
  ssr: false
});

const LightboxController = dynamic(() => import('@/components/features/lightbox/LightboxController'), {
  ssr: false
});

const ChatBot = dynamic(() => import('@/components/ui/ChatBot'), {
  ssr: false
});

const ChatWhatsApp = dynamic(() => import('@/components/ui/ChatWhatsApp'), {
  ssr: false
});


// Generate dynamic metadata from WordPress
export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await safeGetSiteInfo();
  
  if (!siteInfo) {
    // Fallback metadata if WordPress is unreachable
    return {
      metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
      title: {
        default: 'Next-WP Kit',
        template: '%s | Next-WP Kit',
      },
      description: 'An advanced starter kit for building websites with Next.js and WordPress as headless CMS.',
    };
  }

  return {
    metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
    title: {
      default: siteInfo.title,
      template: `%s | ${siteInfo.title}`,
    },
    description: siteInfo.description,
    // Dynamic favicons from WordPress Site Icon
    icons: siteInfo.favicons ? {
      icon: [
        { url: siteInfo.favicons.icon_32, sizes: '32x32', type: 'image/png' },
        { url: siteInfo.favicons.icon_192, sizes: '192x192', type: 'image/png' },
      ],
      apple: [
        { url: siteInfo.favicons.icon_180, sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'icon', url: siteInfo.favicons.icon_512, sizes: '512x512', type: 'image/png' },
      ],
    } : undefined,
    openGraph: {
      title: siteInfo.title,
      description: siteInfo.description,
      siteName: siteInfo.title,
      locale: siteInfo.i18n?.default_locale 
        ? `${siteInfo.i18n.default_locale}_${siteInfo.i18n.default_locale.toUpperCase()}` 
        : 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteInfo.title,
      description: siteInfo.description,
    },
  };
}

type RootLayoutProps = {
  children: ReactNode;
};

// Group global UI components for better organization
function GlobalUI() {
  return (
    <>
      <ScrollToTop />
      <CookieConsent />
      <CookieManager />
      <ModalController />
      <LightboxController />
      <AdvertisingPopup />
      <ChatBot />
      <ChatWhatsApp />
   
    </>
  );
}


export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = headers();
  
  // Fetch site info for dynamic configuration (safe version)
  const siteInfo = await safeGetSiteInfo();
  
  // Get default locale from WordPress or fallback to config
  const defaultLocale = siteInfo?.i18n?.default_locale || localesConfig.defaultLocale;
  
  // Get the locale from the middleware header (set in middleware.ts)
  // The middleware extracts the locale from the URL and sets it as 'x-locale' header
  const currentLocale = (headersList.get('x-locale') || defaultLocale) as string;

  // Providing all messages to the client with the correct locale
  const messages = await getMessages({ locale: currentLocale });
  
  // Get supported locales from WordPress or fallback to config
  const supportedLocales = siteInfo?.i18n?.locales || localesConfig.supportedLocales;
  
  return (
    <html lang={currentLocale} suppressHydrationWarning>
      <head>
        <WpStyles />
        {/* Analytics tracking from WordPress settings */}
        {siteInfo && (
          <Analytics
            gtmId={siteInfo.analytics.gtm_id}
            ga4Id={siteInfo.analytics.google_analytics_id}
            fbPixelId={siteInfo.analytics.facebook_pixel_id}
            twitterPixelId={siteInfo.analytics.twitter_pixel_id}
          />
        )}
      </head>
      <body>
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <SWRConfig
            value={{
              refreshInterval: 0, // Disable auto-refresh (manual revalidation only)
              revalidateOnFocus: false, // Don't refetch when window gets focus
              revalidateOnReconnect: true, // Refetch when coming back online
              dedupingInterval: 60000, // Dedupe identical requests within 1 minute
            }}
          >
            <WpPageIdProvider>
              <ScrollProgress />
              <SmoothScroll>
                <BodyClass> {/* BodyClass needs to be a client component to read pageId from context */}
                  <HeaderServer />
                  {/* <Breadcrumbs /> */}

                    <main>{children}</main>

                  <Footer />
                  <GlobalUI />
                </BodyClass>
              </SmoothScroll>
            </WpPageIdProvider>
          </SWRConfig>
        </NextIntlClientProvider>
        {/* Global locale sync for pages that don't use [...slug] layout */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var supportedLocales = ${JSON.stringify(supportedLocales)};
                var defaultLocale = ${JSON.stringify(defaultLocale)};
                
                function updateLang() {
                  var path = window.location.pathname;
                  var firstSegment = path.split('/').filter(Boolean)[0];
                  var locale = supportedLocales.includes(firstSegment) ? firstSegment : defaultLocale;
                  document.documentElement.lang = locale;
                }
                updateLang();
                window.addEventListener('popstate', updateLang);
              })();
            `
          }}
        />

        <CodeBlockCopier />
      </body>
    </html>
  );
}
