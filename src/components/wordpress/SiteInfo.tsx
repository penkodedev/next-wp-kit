// src/components/wordpress/SiteInfo.tsx
import { getSiteInfo } from "@/api/wordpressApi";
import type { SiteInfo } from "@/types/wordpressTypes";

/**
 * Componente de Servidor para obtener y mostrar información del sitio.
 * Este componente está diseñado para ser usado dentro de otros componentes
 * para pasar la información del sitio como props.
 *
 * @param children Una función que recibe `siteInfo` y devuelve ReactNode.
 */
export default async function SiteInfo({
  children
}: {
  children: (siteInfo: SiteInfo) => React.ReactNode
}) {
  const defaultSiteInfo: SiteInfo = {
    title: "Logo del sitio",
    description: "",
    back_url: "",
    front_url: "",
    light_logo: "/images/framework-logo-white.png",
    dark_logo: "/framework-logo.png",
    site_icon_url: "",
    date_format: "",
    language: "",
    social: [],
    contact: [],
    analytics: {},
    i18n: {
      default_locale: "",
      locales: []
    }
  };

  const siteInfo = await getSiteInfo() || defaultSiteInfo;

  // Pasamos la información obtenida a la función `children` para que sea renderizada.
  // Esto hace que el componente sea un proveedor de datos reutilizable.
  return <>{children(siteInfo)}</>;
}
