'use client';

/**
 * Mega menu - Panel with all sections in columns.
 * Used with MegaMenuHamburger (trigger: hamburger icon).
 */

import Link from 'next/link';
import type { MenuItem } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/wordpress/url';

interface MegaMenuProps {
  menuItems: MenuItem[];
  className?: string;
  /** Callback when clicking on an item (to close the menu) */
  onItemClick?: () => void;
}

function MegaMenuChild({ item, onItemClick }: { item: MenuItem; onItemClick?: () => void }) {
  const wpDomain = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin : '';
  const frontendDomain = process.env.NEXT_PUBLIC_BASE_URL || '';
  const isInternal = item.url.startsWith(wpDomain) || item.url.startsWith(frontendDomain) || item.url.startsWith('/');
  const linkUrl = isInternal ? cleanInternalUrl(item.url) : item.url;
  const isAnchorOnly = item.url === '#' || item.url === `${frontendDomain}#` || item.url === `${wpDomain}#`;

  if (isAnchorOnly) {
    return <li className="mega-menu-child-title">{item.title}</li>;
  }

  return (
    <li>
      <Link href={linkUrl || '/'} target={item.target || (isInternal ? '_self' : '_blank')} onClick={onItemClick}>
        {item.title}
      </Link>
    </li>
  );
}

function MegaMenuColumn({ item, onItemClick }: { item: MenuItem; onItemClick?: () => void }) {
  const wpDomain = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin : '';
  const frontendDomain = process.env.NEXT_PUBLIC_BASE_URL || '';
  const isInternal = item.url.startsWith(wpDomain) || item.url.startsWith(frontendDomain) || item.url.startsWith('/');
  const linkUrl = isInternal ? cleanInternalUrl(item.url) : item.url;
  const isAnchorOnly = item.url === '#' || item.url === `${frontendDomain}#` || item.url === `${wpDomain}#`;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="mega-menu-column">
      <div className="mega-menu-column-header">
        {isAnchorOnly ? (
          <span className="mega-menu-column-title">{item.title}</span>
        ) : (
          <Link href={linkUrl || '/'} target={item.target || (isInternal ? '_self' : '_blank')} className="mega-menu-column-title" onClick={onItemClick}>
            {item.title}
          </Link>
        )}
      </div>
      {item.image && (
        <div className="mega-menu-image">
          {isAnchorOnly ? (
            <span><img src={item.image} alt="" /></span>
          ) : (
            <Link href={linkUrl || '/'} onClick={onItemClick}><img src={item.image} alt="" /></Link>
          )}
        </div>
      )}
      {item.description && <p className="mega-menu-description">{item.description}</p>}
      {hasChildren && item.children && (
        <ul className="mega-menu-links">
          {item.children.map((child) => (
            <MegaMenuChild key={child.id} item={child} onItemClick={onItemClick} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MegaMenu({ menuItems, className = '', onItemClick }: MegaMenuProps) {
  if (!menuItems?.length) return null;

  return (
    <div className={`mega-menu-panel-only ${className}`}>
      <div className="mega-menu-panel">
        <div className="mega-menu-panel-inner">
          {menuItems.map((item) => (
            <MegaMenuColumn key={item.id} item={item} onItemClick={onItemClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
