// src/components/wordpress/WpNavMenu.tsx
"use client";

import Link from 'next/link';
import { fetchAPI } from '@/api/wordpressApi';
import type { MenuItem, AllMenus } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/url';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/utils/logger';

/**
 * Props for the WpNavMenu component.
 * You must provide either 'slug' or 'location'.
 * Optional: Pass pre-fetched menuItems to avoid client-side fetch.
 */
type WpNavMenuProps = {
  className?: string;
  locale: string; // Make locale required
  menuItems?: MenuItem[]; // Optional: Pre-fetched menu data
} & ({ slug: string; location?: never } | { slug?: never; location: string });

/**
 * Recursive component to render an individual menu item and its children.
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
 * Universal navigation component that renders a WordPress menu
 * identified by its 'slug' or 'location'.
 * If menuItems are passed as props, it skips the fetch (server-rendered).
 */
export default function WpNavMenu({ slug, location, className, locale, menuItems: prefetchedMenuItems }: WpNavMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(prefetchedMenuItems || null);

  useEffect(() => {
    // Skip fetch if data was pre-fetched (server-side)
    if (prefetchedMenuItems) return;

    // Do nothing until locale is defined
    if (!locale) return;

    async function getMenu() {
      // Build the API URL with the 'lang' parameter
      const apiUrl = `/custom/v1/menus?lang=${locale}&${location ? `location=${location}` : `slug=${slug}`}`;
      try {
        // The API returns the array of items directly, not an object { items: [...] }
        const menuItemsData = await fetchAPI<MenuItem[]>(apiUrl);
        if (Array.isArray(menuItemsData)) {
          setMenuItems(menuItemsData);
        } else {
          // If the API doesn't return the expected format, show nothing
          setMenuItems([]);
        }
      } catch (error) {
        logger.error(`WpNavMenu: Error fetching menu from ${apiUrl}`, error);
        setMenuItems([]); // Prevent infinite loading state
      }
    }
    getMenu();
  }, [locale, location, slug, prefetchedMenuItems]); // Re-run if language or props change

  if (!menuItems) {
    // Show placeholder or nothing while loading
    return null;
  }


/**********************************************
           START BUILDING MENU HTML
**********************************************/
  return (
    <AnimatePresence mode="wait">
      <motion.nav
        key={`${locale}-${slug || location}`} // Unique key per language and slug/location
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