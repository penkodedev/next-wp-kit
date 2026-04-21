// src/components/wordpress/WpNavMenu.tsx

"use client";

import Link from 'next/link';
import { menuSwrFetcher } from '@/api/wordpressApi';
import type { MenuItem, AllMenus } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/wordpress/url';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/utils/wordpress/logger';
import { withErrorBoundary } from '@/utils/ErrorBoundary';
import { Icons } from '@/components/ui/Icons';
import SearchForm from '@/components/forms/SearchForm';
import { useState, useEffect } from 'react';

/**
 * Props for the WpNavMenu component.
 * You must provide either 'slug' or 'location'.
 * Optional: Pass pre-fetched menuItems to avoid client-side fetch.
 */
type WpNavMenuProps = {
  className?: string;
  locale: string; // Make locale required
  menuItems?: MenuItem[]; // Optional: Pre-fetched menu data
  variant?: 'desktop' | 'mobile' | 'responsive'; // Display mode
  mobileBreakpoint?: number; // Breakpoint for responsive mode (default: 1024)
} & ({ slug: string; location?: never } | { slug?: never; location: string });

/**
 * Recursive component to render an individual menu item and its children.
 * Exported for use in MegaMenuHamburger (off-canvas panel).
 */
export function NavItem({ item, isMobile = false, isSubmenu = false, onLinkClick }: { item: MenuItem; isMobile?: boolean; isSubmenu?: boolean; onLinkClick?: () => void }) {
  const wpDomain = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin : '';
  const frontendDomain = process.env.NEXT_PUBLIC_BASE_URL || '';

  const isInternal = item.url.startsWith(wpDomain) || item.url.startsWith(frontendDomain) || item.url.startsWith('/');
  const linkUrl = isInternal ? cleanInternalUrl(item.url) : item.url;
  
  const hasChildren = item.children && item.children.length > 0;

  // ELocal state to track hover for submenu arrow animation
  const [isHovered, setIsHovered] = useState(false);

  const liClass = item.classes && item.classes.length > 0 ? item.classes.join(' ') : undefined;
  const linkClass = hasChildren ? 'has-submenu' : undefined;
  
  // Bare "#" → submenu parent (not clickable)
  const isAnchorOnly = item.url === '#' || item.url === `${frontendDomain}#` || item.url === `${wpDomain}#`;

  // Any internal URL with a meaningful hash fragment → same-page anchor
  const hashIdx = linkUrl.indexOf('#');
  const isHashAnchor = !isAnchorOnly && hashIdx !== -1 && linkUrl.length > hashIdx + 1;
  const anchorHash = isHashAnchor ? linkUrl.slice(hashIdx) : null;

  // Shared inner content for all link types
  const linkContent = (
    <>
      {isMobile && item.parent !== '0' && (
        <Icons.ChevronRight size={20} strokeWidth={1} className="submenu-arrow-mobile" />
      )}
      {isSubmenu && !isMobile && (
        <Icons.MoveRight size={14} strokeWidth={1} className="submenu-item-icon" />
      )}
      {item.title}
      {hasChildren && !isMobile && (
        <motion.span
          className="submenu-arrow"
          aria-hidden="true"
          animate={{ rotate: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.22 }}
          >
            <Icons.ChevronDown size={19} strokeWidth={2.2}  />
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.22 }}
          >
            <Icons.ChevronUp size={19} strokeWidth={2.2}  />
          </motion.span>
        </motion.span>
      )}
    </>
  );
  
  return (
    <li
      {...(liClass ? { className: liClass } : {})}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isAnchorOnly ? (
        <span className={linkClass}>{linkContent}</span>
      ) : isHashAnchor ? (
        <a
          href={anchorHash!}
          onClick={onLinkClick}
          {...(linkClass ? { className: linkClass } : {})}
        >
          {linkContent}
        </a>
      ) : (
        <Link
          href={linkUrl || '/'} 
          target={item.target || (isInternal ? '_self' : '_blank')}
          onClick={onLinkClick}
          {...(linkClass ? { className: linkClass } : {})}
        >
          {linkContent}
        </Link>
      )}
      {hasChildren && item.children && (
        <ul className={isMobile ? "submenu-mobile" : "submenu"}>
          {item.children.map((child) => (
            <NavItem key={child.id} item={child} isMobile={isMobile} isSubmenu={true} onLinkClick={onLinkClick} />
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
function WpNavMenu({ 
  slug, 
  location, 
  className, 
  locale, 
  menuItems: prefetchedMenuItems,
  variant = 'responsive',
  mobileBreakpoint = 1224
}: WpNavMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Initialize isMobileView based on variant
  const [isMobileView, setIsMobileView] = useState(() => {
    if (variant === 'mobile') return true;
    if (variant === 'desktop') return false;
    // For 'responsive', check on mount (will be updated by useEffect)
    return typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false;
  });

  // Build the API URL with the 'lang' parameter
  const apiUrl = locale ? `/custom/v1/menus?lang=${locale}&${location ? `location=${location}` : `slug=${slug}`}` : null;
  
  // Use SWR for client-side fetching with pre-fetched data as fallback
  const { data: menuItems, error } = useSWR<MenuItem[]>(
    apiUrl, // Key for cache (null disables fetching if locale is not ready)
    menuSwrFetcher,
    {
      fallbackData: prefetchedMenuItems, // Use server-side data initially
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: true, // Refetch when coming back online
      dedupingInterval: 60000, // Dedupe requests within 1 minute
    }
  );

  // Detect viewport size for responsive mode
  useEffect(() => {
    // Update isMobileView when variant changes
    if (variant === 'mobile') {
      setIsMobileView(true);
      return;
    }
    if (variant === 'desktop') {
      setIsMobileView(false);
      return;
    }
    
    // Only for 'responsive' mode: listen to viewport changes
    const checkViewport = () => {
      setIsMobileView(window.innerWidth < mobileBreakpoint);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [variant, mobileBreakpoint]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [locale]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Log errors (development only)
  if (error) {
    logger.error(`WpNavMenu: Error fetching menu from ${apiUrl}`, error);
  }

  // Show nothing while loading (only on first mount without fallback)
  if (!menuItems) {
    return null;
  }

  // Determine which view to show
  const shouldShowMobile = 
    variant === 'mobile' || 
    (variant === 'responsive' && isMobileView);
  

  // ************ Desktop Menu *******************
  if (!shouldShowMobile) {
    return (
      <AnimatePresence mode="wait">
        <motion.nav
          key={`desktop-${locale}-${slug || location}`}
          className={className}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <ul>
            {menuItems.map((item) => (
              <NavItem key={item.id} item={item} isMobile={false} />
            ))}
          </ul>
        </motion.nav>
      </AnimatePresence>
    );
  }

  
  // *************** Mobile Menu ******************
  return (
    <>
      
      {/* Burger Icon */}
      <a 
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'menu-open' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          setIsMobileMenuOpen(!isMobileMenuOpen);
        }}
        href="#menu"
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
      >
        {/* Change size and strokeWidth of X and burger icons */}
        {/* Available burger icons: Icons.Menu, Icons.AlignJustify, Icons.AlignLeft, Icons.AlignRight, Icons.MoreVertical, Icons.MoreHorizontal */}
        {isMobileMenuOpen 
          ? <Icons.X size={28} strokeWidth={1} className="close-icon" /> 
          : <Icons.AlignRight size={36} strokeWidth={1.2} className="burger-icon" />} 
      </a>
      

      {/* Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Off-canvas Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            className={`${className} mobile-menu-panel`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <ul>
              {menuItems.map((item) => (
                <NavItem 
                  key={item.id} 
                  item={item} 
                  isMobile={true} 
                  onLinkClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </ul>
            {/* <SearchForm /> */}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

// Export with ErrorBoundary protection
export default withErrorBoundary(WpNavMenu, 'WpNavMenu');