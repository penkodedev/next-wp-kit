// src/components/wordpress/SiteInfo.tsx
import { safeGetSiteInfo } from "@/api/wordpressApi";
import type { SiteInfo } from "@/types/wordpressTypes";
import { headers } from 'next/headers';
import localesConfig from '@/i18n/locales.generated.json';

/**
 * Componente de Servidor para obtener y mostrar información del sitio.
 * Este componente está diseñado para ser usado dentro de otros componentes
 * para pasar la información del sitio como props.
 *
 * @param children Una función que recibe `siteInfo` y devuelve ReactNode.
 * @param lang - Optional language override (if not provided, uses x-locale header)
 */
export default async function SiteInfo({
  children,
  lang
}: {
  children: (siteInfo: SiteInfo) => React.ReactNode,
  lang?: string
}) {
  const defaultSiteInfo: SiteInfo = {
    title: "Logo del sitio",
    description: "",
    back_url: "",
    front_url: "",
    light_logo: "",
    dark_logo: "",
    favicons: {
      icon_32: "",
      icon_180: "",
      icon_192: "",
      icon_512: ""
    },
    date_format: "",
    language: "",
    social: [],
    contact: [],
    analytics: {
      google_analytics_id: "",
      facebook_pixel_id: "",
      gtm_id: "",
      twitter_pixel_id: ""
    },
    i18n: {
      default_locale: "",
      locales: []
    }
  };

  // Detect current language from headers or use override
  const currentLocale = lang || headers().get('x-locale') || localesConfig.defaultLocale;
  
  // Fetch site info with language parameter (safe version)
  const siteInfo = await safeGetSiteInfo(currentLocale);

  // Pasamos la información obtenida a la función `children` para que sea renderizada.
  // Esto hace que el componente sea un proveedor de datos reutilizable.
  return <>{children(siteInfo)}</>;
}
