"use client"; // Convertimos a Client Component para usar hooks

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

// ------------------------ CONFIGURACIÓN ------------------------
// Cambia a 'true' si no quieres mostrar el último elemento (la página actual).
const HIDE_LAST_ITEM = false;

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean); // Ej: ['recursos', 'mi-recurso']

  if (segments.length === 0) {
    return null; // No mostrar breadcrumbs en la página de inicio
  }

  let breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    ...segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      // Como fallback, capitalizamos el slug. Un sistema más avanzado podría obtener el título real.
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      return { label, href };
    }),
  ];

  // Si la opción está activada y hay más de un elemento (Inicio), elimina el último.
  if (HIDE_LAST_ITEM && breadcrumbItems.length > 1) {
    breadcrumbItems.pop();
  }

  // Determinar la URL base de forma segura en el cliente para el JSON-LD.
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Generar los datos estructurados para SEO (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  };

  // Renderizamos en HTML de los breadcrumbs y el script JSON-LD
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ul className="breadcrumb">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <li key={item.href}>
                {!isLast ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Script con los datos estructurados para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}