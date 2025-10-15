// src/components/ui/ModalController.tsx

"use client";

import { useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';
import Modals from '@/components/ui/Modals'; // The visual component

/**
 * A client component that handles (LISTEN) the logic for opening modals.
 * It listens for clicks on links pointing to the 'modal' CPT (e.g., /modal/my-modal-slug).
 * This component should be placed once in the main layout file.
 */
export default function ModalController() {
  const { openModal } = useModalStore();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Find the closest link element, if the user clicked on an element inside a link
      const target = (event.target as HTMLElement).closest('a');

      // Check if the link's pathname includes the slug for the modal CPT.
      // In WordPress, we registered it as 'modales'.
      if (target && target.pathname.startsWith('/modals/')) {
        // Prevent the browser from navigating to the modal's page
        event.preventDefault();

        // Extract the slug from the pathname
        // We use pop() to get the last part of the URL, which is the slug
        const slug = target.pathname.split('/').filter(Boolean).pop();

        if (slug) {
          openModal(slug);
        }
      }
    };

    // Add the event listener to the whole document
    document.addEventListener('click', handleClick);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [openModal]);

  // This component renders the actual modal UI
  return <Modals />;
}