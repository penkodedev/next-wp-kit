// src/app/layout.tsx

import type { Metadata } from 'next';
import 'swiper/css/bundle';

import "@/styles/sass/main.scss";
import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import CookieConsent from "@/components/cookies/CookieConsent";
import CookieManager from "@/components/cookies/CookieManager";
import ScrollToTop from "@/components/navigation/ScrollToTop";
import ModalController from '@/components/ui/ModalController';
import AdvertisingPopup from '@/components/ui/AdvertisingPopup';
import LightboxController from '@/components/ui/LightboxController';

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <head>
        <WpStyles />
      </head>
      <body>
        <WpPageIdProvider>
          <BodyClass>
            <Header />
            {/* <Breadcrumbs /> */}
            <main>{children}</main>
            <Footer />
            <GlobalUI /> 
          </BodyClass>
        </WpPageIdProvider>
      </body>
    </html>
  );
}
