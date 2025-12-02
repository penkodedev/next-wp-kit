// src/components/wordpress/WpNavMenu.tsx

"use client";

import Link from 'next/link';
import { swrFetcher } from '@/api/wordpressApi';
import type { MenuItem, AllMenus } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/wordpress/url';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/utils/wordpress/logger';

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
 * Uses SWR for client-side caching with server-side pre-fetched data as fallback.
 */
export default function WpNavMenu({ slug, location, className, locale, menuItems: prefetchedMenuItems }: WpNavMenuProps) {
  // Build the API URL with the 'lang' parameter
  const apiUrl = locale ? `/custom/v1/menus?lang=${locale}&${location ? `location=${location}` : `slug=${slug}`}` : null;
  
  // Use SWR for client-side fetching with pre-fetched data as fallback
  const { data: menuItems, error } = useSWR<MenuItem[]>(
    apiUrl, // Key for cache (null disables fetching if locale is not ready)
    swrFetcher<MenuItem[]>,
    {
      fallbackData: prefetchedMenuItems, // Use server-side data initially
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: true, // Refetch when coming back online
      dedupingInterval: 60000, // Dedupe requests within 1 minute
    }
  );

  // Log errors (development only)
  if (error) {
    logger.error(`WpNavMenu: Error fetching menu from ${apiUrl}`, error);
  }

  // Show nothing while loading (only on first mount without fallback)
  if (!menuItems) {
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