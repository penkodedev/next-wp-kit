// src/components/ui/Modals.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '@/store/modalStore';
import { getContentBySlug } from '@/api/wordpressApi';
import type { Modal as ModalType } from '@/types/wordpressTypes';
import { processContent } from '@/utils/wordpress/processContent';
import { Icons } from '@/components/ui/Icons';
import { logger } from '@/utils/wordpress/logger';

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

/**
 * Renders the modal UI based on the global modal store state.
 * It fetches the modal content from the API when opened.
 */
export default function Modals() {
  const { isOpen, modalSlug, closeModal } = useModalStore();
  const [modalContent, setModalContent] = useState<ModalType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Define the "crazy" animation variants for the modal content
  const modalVariants = {
    hidden: { // Estado inicial (antes de entrar)
      scale: 0.95,
      opacity: 0,
    },
    visible: { // Estado visible (animación de entrada)
      scale: 1,
      opacity: 1,
    },
    exit: { // Estado de salida
      scale: 0.95,
      opacity: 0,
    },
  };

  useEffect(() => {
    // Function to fetch modal data
    const fetchModalContent = async (slug: string) => {
      setIsLoading(true);
      setModalContent(null); // Clear previous content
      try {
        // We use the generic getContentBySlug function
        const content = await getContentBySlug<ModalType>('modales', slug);
        setModalContent(content);
      } catch (error) {
        logger.error("Failed to fetch modal content:", error as Error);
        // Optionally, set an error state to show a message
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && modalSlug) {
      fetchModalContent(modalSlug);
    }
  }, [isOpen, modalSlug]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={closeModal}
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-label={modalContent?.title?.rendered || 'Modal'}
        >
          {modalContent && (
            <motion.div
              className="modal-content"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              role="document"
            >

              
              <div className="modal-scroll-wrapper">
                <div className="modal-body" dangerouslySetInnerHTML={{ __html: processContent(modalContent.content.rendered) }} />

                <button type="button" className="modal-close" onClick={closeModal} aria-label="Cerrar modal">
                <Icons.X size={28} strokeWidth={1} />
                </button>
                
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
