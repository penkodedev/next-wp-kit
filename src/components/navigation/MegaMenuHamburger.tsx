'use client';

/**
 * Mega Menu con hamburger como único disparador.
 * Desktop: click → panel mega (columnas con imagen, descripción, hijos).
 * Mobile: click → off-canvas (menú árbol).
 * No muestra items en texto en desktop.
 * Backdrop y paneles se renderizan en body via Portal para que el click fuera cierre en toda la pantalla.
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/ui/Icons';
import { NavItem } from '@/components/navigation/WpNavMenu';
import MegaMenu from '@/components/navigation/MegaMenu';
import type { MenuItem } from '@/types/wordpressTypes';

interface MegaMenuHamburgerProps {
  menuItems: MenuItem[];
  className?: string;
}

export default function MegaMenuHamburger({ menuItems, className = '' }: MegaMenuHamburgerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1223px)');
    setIsMobileView(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobileView(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!menuItems?.length) return null;

  const overlayContent = mounted && typeof document !== 'undefined' && (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="mega-backdrop"
            className="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          {!isMobileView && (
            <motion.div
              key="mega-desktop"
              className="mega-menu-panel-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            >
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setIsOpen(false); }}
                className="mega-menu-close"
                aria-label="Cerrar menú"
              >
                <Icons.X size={28} strokeWidth={1} />
              </a>
              <div className="mega-menu-panel-dropdown-inner" onClick={(e) => e.stopPropagation()}>
                <MegaMenu menuItems={menuItems} onItemClick={() => setIsOpen(false)} />
              </div>
            </motion.div>
          )}
          {isMobileView && (
            <motion.nav
              key="mega-mobile"
              className={`${className} mobile-menu-panel`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setIsOpen(false); }}
                className="mega-menu-close"
                aria-label="Cerrar menú"
              >
                <Icons.X size={28} strokeWidth={1} />
              </a>
              <ul>
                {menuItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isMobile={true}
                    onLinkClick={() => setIsOpen(false)}
                  />
                ))}
              </ul>
            </motion.nav>
          )}
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <a
        className={`mobile-menu-toggle ${isOpen ? 'menu-open' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        href="#menu"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <Icons.X size={28} strokeWidth={1} className="close-icon" />
        ) : (
          <Icons.AlignRight size={36} strokeWidth={1.2} className="burger-icon" />
        )}
      </a>

      {overlayContent && createPortal(overlayContent, document.body)}
    </>
  );
}
