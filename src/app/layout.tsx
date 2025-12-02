// src/app/layout.tsx

import type { Metadata } from 'next';
import type { ReactNode } from "react";

import 'swiper/css/bundle';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SWRConfig } from 'swr';

import "@/styles/sass/main.scss";

import HeaderServer from '@/components/layout/header/HeaderServer';
import Footer from "@/components/layout/footer/Footer";

import CookieConsent from "@/components/cookies/CookieConsent";
import CookieManager from "@/components/cookies/CookieManager";
import ScrollToTop from "@/components/navigation/ScrollToTop";
import ModalController from '@/components/features/modals/ModalController';
import AdvertisingPopup from '@/components/features/modals/AdvertisingPopup';
import LightboxController from '@/components/features/lightbox/LightboxController';
import WpStyles from "@/components/wordpress/WpStyles";

import BodyClass from "@/utils/wordpress/BodyClass";
import { WpPageIdProvider } from '@/utils/wordpress/WpPageIdContext';
import localesConfig from '@/i18n/locales.generated.json';


// Base metadata for SEO
export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Next-WP Kit',
    template: '%s | Next-WP Kit',
  },
  description: 'An advanced starter kit for building websites with Next.js and WordPress as headless CMS.',
  openGraph: {
    title: 'Next-WP Kit',
    description: 'A starter kit for building websites with Next.js and WordPress as headless CMS.',
    siteName: 'Next-WP Kit',
    // images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'es_ES',
    type: 'website',
  },
  // Add more metadata here: openGraph, icons, etc.
};

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
    </>
  );
}


export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = headers();
  
  // Get the locale from the middleware header (set in middleware.ts)
  // The middleware extracts the locale from the URL and sets it as 'x-locale' header
  const currentLocale = (headersList.get('x-locale') || 'es') as string;

  // Providing all messages to the client with the correct locale
  const messages = await getMessages({ locale: currentLocale });
  
  return (
    <html lang={currentLocale} suppressHydrationWarning>
      <head>
        <WpStyles />
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
              <BodyClass> {/* BodyClass needs to be a client component to read pageId from context */}
                <HeaderServer />
                {/* <Breadcrumbs /> */}
                <main>{children}</main>
                <Footer />
                <GlobalUI />
              </BodyClass>
            </WpPageIdProvider>
          </SWRConfig>
        </NextIntlClientProvider>
        {/* Global locale sync for pages that don't use [...slug] layout */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var supportedLocales = ${JSON.stringify(localesConfig.supportedLocales)};
                var defaultLocale = ${JSON.stringify(localesConfig.defaultLocale)};
                
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
      </body>
    </html>
  );
}
