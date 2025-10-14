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

import BodyClass from "@/utils/BodyClass";
import WpStyles from "@/components/wordpress/WpStyles";
import { WpPageIdProvider } from '@/utils/WpPageIdContext';


// Metadatos base para el SEO
export const metadata: Metadata = {
  title: {
    default: 'Next-WP Kit', // Título por defecto
    template: '%s | Next-WP Kit', // Plantilla para títulos de páginas internas
  },
  description: 'Un kit de inicio avanzado para crear sitios web con Next.js y WordPress como headless CMS.',
  openGraph: {
    title: 'Next-WP Kit',
    description: 'Un kit de inicio para crear sitios web con Next.js y WordPress como headless CMS.',
    url: process.env.BASE_URL || 'http://localhost:3000',
    siteName: 'Next-WP Kit',
    // images: [ // Puedes añadir una imagen por defecto para compartir en redes sociales
    //   { url: '/og-image.png' /* Debe estar en la carpeta /public */, width: 1200, height: 630 }
    // ],
    locale: 'es_ES',
    type: 'website',
  },
  // Puedes añadir más metadatos aquí: openGraph, icons, etc.
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      {/* Carga los estilos de WordPress aquí para que tengan prioridad */}
      <head>
        <WpStyles />
      </head>

      <body>
        <WpPageIdProvider>
          <BodyClass>
            <Header />
            {/* <Breadcrumbs /> */}
            <main>{children}</main>
            <ScrollToTop />
            <Footer />
            <CookieConsent />
            <CookieManager />
            <ModalController />
            <AdvertisingPopup />
          </BodyClass>
        </WpPageIdProvider>
      </body>

    </html>
  );
}
