// src/components/layout/footer/FooterMenu.tsx
import { getMenuItems } from '@/api/wordpressApi';
import Link from 'next/link';
import type { MenuItem } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/url';

/**
 * Componente recursivo para renderizar un elemento individual del menú del footer y sus hijos.
 * Contiene la lógica para limpiar las URLs.
 */
function FooterNavItem({ item }: { item: MenuItem }) {
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
            <FooterNavItem key={child.id} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default async function FooterMenu() {
  // Fetch the footer menu items
  const menuItems = await getMenuItems('menu-footer');

  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  return (
    <nav className="footer-menu">
      <ul>
        {menuItems.map((item) => (
          <FooterNavItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}
