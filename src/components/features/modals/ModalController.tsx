// src/components/ui/ModalController.tsx

"use client";

import { useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';
import Modals from '@/components/features/modals/Modals'; // The visual component

// Constantes fuera del componente para evitar recrearlas en cada render
const MODAL_CPT_PATH = '/modales/';
const wpApiHostname = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).hostname
  : '';

/**
 * A client component that handles (LISTEN) the logic for opening modals.
 * It listens for clicks on links pointing to the 'modal' CPT (e.g., /modal/my-modal-slug).
 * This component should be placed once in the main layout file.
 */
export default function ModalController() {
  const { openModal } = useModalStore();

  useEffect(() => {
    // Añadimos una clase al body para indicar que el controlador de modales está listo.
    // Esto nos permite usar CSS para prevenir clics prematuros antes de la hidratación.
    document.body.classList.add('modal-controller-ready');

    // Limpiamos la clase cuando el componente se desmonte.
    return () => {
      document.body.classList.remove('modal-controller-ready');
    };
  }, []); // Se ejecuta solo una vez, cuando el componente se monta en el cliente.

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Find the closest link element, if the user clicked on an element inside a link
      const target = (event.target as HTMLElement).closest('a');

      if (!target) return;

      // Detectar si es un enlace a un modal (/modales/slug)
      // Funciona tanto con rutas relativas como con URLs absolutas al backend de WP
      const isRelativeModalLink = target.pathname.startsWith(MODAL_CPT_PATH);
      const isAbsoluteWpModalLink =
        wpApiHostname &&
        target.hostname === wpApiHostname &&
        target.pathname.startsWith(MODAL_CPT_PATH);

      if (isRelativeModalLink || isAbsoluteWpModalLink) {
        // Prevent the browser from navigating to the modal's page
        event.preventDefault();

        // Extract the slug from the pathname
        // We use pop() to get the last part of the URL, which is the slug
        const slug = target.pathname.split('/').filter(Boolean).pop();

        if (slug && slug !== 'modales') {
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