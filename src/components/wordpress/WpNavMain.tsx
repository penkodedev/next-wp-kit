// src/components/navigation/WpNavigation.tsx
import Link from 'next/link';
import type { MenuItem } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/url';


/**
 * Componente recursivo para renderizar un elemento individual del menú y sus hijos.
 * Contiene la lógica para limpiar las URLs.
 */
function NavItem({ item }: { item: MenuItem }) {
  const wpDomain = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin : '';
  const frontendDomain = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Determina si la URL es interna (apunta al mismo sitio) o externa.
  const isInternal = item.url.startsWith(wpDomain) || item.url.startsWith(frontendDomain) || item.url.startsWith('/');
  const linkUrl = isInternal ? cleanInternalUrl(item.url) : item.url;

  return (
    <li>
      <Link href={linkUrl || '/'} target={isInternal ? '_self' : '_blank'}>
        {item.title}
      </Link>
      {item.children && item.children.length > 0 && (
        <ul className="submenu">
          {item.children.map((child) => (
            <NavItem key={child.id} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}


/**
 * Componente principal de navegación. Renderiza una lista de elementos de menú.
 */
export default function WpNavigation({ menuItems }: { menuItems: MenuItem[] | null }) {
  if (!menuItems || menuItems.length === 0) {
    // Si no hay menú, es mejor no renderizar nada.
    return null;
  }

  return (
    <nav className="main-menu">
      <ul>
        {menuItems.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}
