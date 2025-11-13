// src/components/wordpress/WpNavMenu.tsx
"use client";

import Link from 'next/link';
import { fetchAPI } from '@/api/wordpressApi';
import type { MenuItem, AllMenus } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/url';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Props para el componente WpNavMenu.
 * Debes proporcionar 'slug' o 'location'.
 */
type WpNavMenuProps = {
  className?: string;
  locale: string; // Hacemos que el locale sea obligatorio
} & ({ slug: string; location?: never } | { slug?: never; location: string });

/**
 * Componente recursivo para renderizar un elemento individual del menú y sus hijos.
 */
function NavItem({ item }: { item: MenuItem }) {
  const wpDomain = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin : '';
  const frontendDomain = process.env.NEXT_PUBLIC_BASE_URL || '';

  const isInternal = item.url.startsWith(wpDomain) || item.url.startsWith(frontendDomain) || item.url.startsWith('/');
  const linkUrl = isInternal ? cleanInternalUrl(item.url) : item.url;

  return (
    <li className={item.classes?.join(' ')}>
      <Link href={linkUrl || '/'} target={item.target || (isInternal ? '_self' : '_blank')}>
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
 * Componente de navegación universal que renderiza un menú de WordPress
 * identificado por su 'slug' o su 'location'.
 */
export default function WpNavMenu({ slug, location, className, locale }: WpNavMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);

  useEffect(() => {
    // No hacer nada hasta que el locale esté definido.
    if (!locale) return;

    async function getMenu() {
      // Construimos la URL de la API con el parámetro 'lang'
      const apiUrl = `/custom/v1/menus?lang=${locale}&${location ? `location=${location}` : `slug=${slug}`}`;
      try {
        // La API devuelve directamente el array de items, no un objeto { items: [...] }
        const menuItemsData = await fetchAPI<MenuItem[]>(apiUrl);
        if (Array.isArray(menuItemsData)) {
          setMenuItems(menuItemsData);
        } else {
          // Si la API no devuelve el formato esperado, no mostramos nada.
          setMenuItems([]);
        }
      } catch (error) {
        console.error(`WpNavMenu: Error fetching menu from ${apiUrl}`, error);
        setMenuItems([]); // Evita que se quede en estado de carga infinito
      }
    }
    getMenu();
  }, [locale, location, slug]); // Se vuelve a ejecutar si cambia el idioma o las props

  if (!menuItems) {
    // Muestra un placeholder o nada mientras carga.
    return null;
  }


/**********************************************
           START BUILDING MENU HTML
**********************************************/
  return (
    <AnimatePresence mode="wait">
      <motion.nav
        key={`${locale}-${slug || location}`} // Key única por idioma y slug/location
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <ul>
          {menuItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </ul>
      </motion.nav>
    </AnimatePresence>
  );
}