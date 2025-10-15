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
  // Definimos la ruta base para los modales para mayor claridad y mantenibilidad.
  const MODAL_CPT_PATH = '/modales/';
  // Extraemos el hostname de la URL de la API de WP para comparaciones.
  const wpApiHostname = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
    ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).hostname
    : '';

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

      // Comprobamos si es un enlace a un modal, ya sea una ruta relativa o una URL absoluta al backend de WP.
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
  }, [openModal, wpApiHostname]);

  // This component renders the actual modal UI
  return <Modals />;
}