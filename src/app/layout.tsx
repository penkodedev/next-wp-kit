// src/app/layout.tsx

import type { Metadata } from 'next';
import 'swiper/css/bundle';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import "@/styles/sass/main.scss";
import type { ReactNode } from "react";
import HeaderConditional from "@/components/layout/header/HeaderConditional";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import CookieConsent from "@/components/cookies/CookieConsent";
import CookieManager from "@/components/cookies/CookieManager";
import ScrollToTop from "@/components/navigation/ScrollToTop";
import ModalController from '@/components/ui/ModalController';
import AdvertisingPopup from '@/components/features/AdvertisingPopup';
import LightboxController from '@/components/ui/LightboxController';
import Footer from "@/components/layout/footer/Footer";

import BodyClass from "@/utils/BodyClass";
import WpStyles from "@/components/wordpress/WpStyles";
import { WpPageIdProvider } from '@/utils/WpPageIdContext';


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
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang="es">
      <head>
        <WpStyles />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <WpPageIdProvider>
            <BodyClass>
              <HeaderConditional />
              {/* <Breadcrumbs /> */}
              <main>{children}</main>
              <Footer />
              <GlobalUI />
            </BodyClass>
          </WpPageIdProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
