"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useIsPresent } from 'framer-motion';
import { useGlobalAppReady } from '@/hooks/useGlobalAppReady';
import { getActivePopups } from '@/api/wordpressApi';
import type { Modal } from '@/types/wordpressTypes';

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

  useEffect(() => {
    // Don't do anything if the app is still loading, a popup is already active, or the component is unmounting.
    if (isAppLoading || activePopup || !isPresent) return;

    const fetchAndCheckPopups = async () => {
      const popups = await getActivePopups();
      if (!popups || popups.length === 0) return;

      // Find a popup that is configured to be displayed on the current page
      const popupForThisPage = popups.find(p =>
        p.popup_settings?.display_pages?.includes(pathname)
      );

      if (!popupForThisPage) return;

      // ========================================================================
      // POPUP DISPLAY FREQUENCY LOGIC
      // This is where we decide whether to show the popup based on the
      // 'frequency' setting from WordPress.
      //
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
          console.warn('sessionStorage is not available:', error);
          return; // Exit if sessionStorage is not available
        }
      }

      // If all checks pass, set a timer to show the popup
      const timer = setTimeout(() => {
        setActivePopup(popupForThisPage);

        // Update session storage if needed
        if (frequency !== 'always') {
          const storageKey = `${STORAGE_KEY_PREFIX}${popupForThisPage.id}_${pathname}`;
          try {
            const shownCount = sessionStorage.getItem(storageKey) ? parseInt(sessionStorage.getItem(storageKey)!, 10) : 0;
            sessionStorage.setItem(storageKey, (shownCount + 1).toString());
          } catch (error) {
            console.warn('Could not write to sessionStorage:', error);
          }
        }
      }, popupForThisPage.popup_settings?.delay ?? 2000); // Use delay from API, or default to 2s

      // Cleanup timer on component unmount or dependency change
      return () => clearTimeout(timer);
    };

    fetchAndCheckPopups();
  }, [isAppLoading, pathname, isPresent]);

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
          aria-labelledby="popup-title"
        >
          <motion.div
            className="modal-content advertising-popup" // Added a specific class for styling
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <button className="modal-close" onClick={handleClose} aria-label="Cerrar popup">
              &times;
            </button>

            {/* --- DYNAMIC CONTENT FROM WORDPRESS --- */}
            <div className="modal-body"
                 dangerouslySetInnerHTML={{ __html: activePopup.content.rendered }}
            />
            {/* --- END DYNAMIC CONTENT --- */}
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}