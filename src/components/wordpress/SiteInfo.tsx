// src/components/wordpress/SiteInfo.tsx
import { getSiteInfo } from "@/api/wordpressApi";

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
  children: (siteInfo: Awaited<ReturnType<typeof getSiteInfo>>) => React.ReactNode 
}) {
  const siteInfo = await getSiteInfo();

  // Si no se puede obtener la información, no renderizamos nada.
  // El componente que lo usa puede tener su propio fallback.
  if (!siteInfo) {
    return null;
  }

  // Pasamos la información obtenida a la función `children` para que sea renderizada.
  // Esto hace que el componente sea un proveedor de datos reutilizable.
  return <>{children(siteInfo)}</>;
}
