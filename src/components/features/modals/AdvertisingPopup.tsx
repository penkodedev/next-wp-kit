"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useIsPresent } from 'framer-motion';
import { useGlobalAppReady } from '@/hooks/useGlobalAppReady';
import { getActivePopups } from '@/api/wordpressApi';
import type { Modal } from '@/types/wordpressTypes';
import { Icons } from '@/components/ui/Icons';

const backdrop = {
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  hidden: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
} as const;

const modalVariants = {
  hidden: { scale: 0.9, opacity: 0, y: 50 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: 50,
    transition: { duration: 0.3, ease: "easeIn" },
  },
} as const;

const STORAGE_KEY_PREFIX = 'popup_shown_';

export default function AdvertisingPopup() {
  const [activePopup, setActivePopup] = useState<Modal | null>(null);
  const { loading: isAppLoading } = useGlobalAppReady();
  const pathname = usePathname();
  const isPresent = useIsPresent(); // Hook from Framer Motion to handle component unmounts
  const hasShownPopup = useRef(false); // Flag to prevent re-showing after close

  useEffect(() => {
    // Don't do anything if the app is still loading, popup is already active, component is unmounting, or already shown
    if (isAppLoading || activePopup || !isPresent || hasShownPopup.current) return;

    const fetchAndCheckPopups = async () => {
      const popups = await getActivePopups();
      if (!popups || popups.length === 0) return;

      // Find a popup that is configured to be displayed on the current page
      const popupForThisPage = popups.find(p =>
        p.popup_settings?.display_pages?.includes(pathname)
      );

      if (!popupForThisPage) return;

      // =================================================================满了
      // POPUP DISPLAY FREQUENCY LOGIC
      // ========================================================================
      // 'always': The popup will always be shown on every page load.
      // 'once':   The popup will be shown only once per page per session.
      // number (e.g., '2', '3'): The popup will be shown that many times per page per session.
      // ========================================================================
      const frequency = popupForThisPage.popup_settings?.frequency || 'once';

      if (frequency !== 'always') {
        const storageKey = `${STORAGE_KEY_PREFIX}${popupForThisPage.id}_${pathname}`;
        try {
          const sessionData = sessionStorage.getItem(storageKey);

          if (frequency === 'once') {
            // If 'once' and it has been shown, exit.
            if (sessionData) return;
          } else {
            // Handle numeric frequency (e.g., show '2' times)
            const showCount = parseInt(frequency, 10);
            const shownCount = sessionData ? parseInt(sessionData, 10) : 0;
            if (shownCount >= showCount) {
              return;
            }
          }
        } catch (error) {
          return; // Exit if sessionStorage is not available
        }
      }

      // If all checks pass, set a timer to show the popup
      const timer = setTimeout(() => {
        // Double-check frequency before showing (in case sessionStorage changed)
        if (frequency !== 'always') {
          const storageKey = `${STORAGE_KEY_PREFIX}${popupForThisPage.id}_${pathname}`;
          const sessionData = sessionStorage.getItem(storageKey);
          const shownCount = sessionData ? parseInt(sessionData, 10) : 0;
          
          if (frequency === 'once' && sessionData) {
            return; // Already shown once
          }
          
          const showCount = parseInt(frequency, 10);
          if (!isNaN(showCount) && shownCount >= showCount) {
            return; // Already shown the maximum times
          }
        }
        
        setActivePopup(popupForThisPage);
        hasShownPopup.current = true; // Mark as shown to prevent re-showing

        // Update session storage if needed
        if (frequency !== 'always') {
          const storageKey = `${STORAGE_KEY_PREFIX}${popupForThisPage.id}_${pathname}`;
          try {
            const shownCount = sessionStorage.getItem(storageKey) ? parseInt(sessionStorage.getItem(storageKey)!, 10) : 0;
            sessionStorage.setItem(storageKey, (shownCount + 1).toString());
          } catch (error) {
            // Could not write to sessionStorage
          }
        }
      }, Math.max(popupForThisPage.popup_settings?.delay ?? 5000, 5000)); // Min 5s to avoid becoming LCP element

      // Cleanup timer on component unmount or dependency change
      return () => clearTimeout(timer);
    };

    fetchAndCheckPopups();
  }, [isAppLoading, pathname, isPresent, activePopup]);

  const handleClose = () => {
    setActivePopup(null);
  };


  return (
    <AnimatePresence mode="wait">
      {activePopup && (
        <motion.div
          className="modal-overlay"
          onClick={handleClose}
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-label={activePopup.title?.rendered || 'Popup'}
        >
          <motion.div
            className="modal-content advertising-popup"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <button type="button" className="modal-close" onClick={handleClose} aria-label="Cerrar popup">
              <Icons.X size={28} strokeWidth={1} />
            </button>
            <div className="modal-body" dangerouslySetInnerHTML={{ __html: activePopup.content.rendered.replace(/loading="lazy"/g, 'loading="eager"') }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}