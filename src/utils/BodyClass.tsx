// src/components/utils/BodyClass.tsx
"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useWpPageId } from "@/utils/WpPageIdContext";

const BodyClass = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { pageId } = useWpPageId();

  // Genera clases dinámicamente a partir del pathname
  const bodyClasses = useMemo(() => {
    const pathSegments = (pathname || '').split('/').filter(Boolean);

    // Lista de slugs de CPT que deben ser tratados como páginas de archivo.
    const archivePostTypes = ['recursos', 'proyectos']; // Añade aquí futuros CPTs
    let classes: string[] = [];

    if (pathSegments.length === 1 && archivePostTypes.includes(pathSegments[0])) {
      const postType = pathSegments[0];
      classes = ['archive', `archive-${postType}`];
    }
    else if (pathname === '/') {
      classes = ["page-home"];
    }
    // Si la ruta tiene 2 segmentos (ej: /recursos/mi-recurso), es una página de detalle.
    else if (pathSegments.length === 2) {
      const postType = pathSegments[0];
      classes = [`single`, `single-${postType}`];
      if (pageId) {
        classes.push(`postid-${pageId}`);
      }
    }
    else {
      // Convierte "/mi-ruta/sub-ruta" en "page-mi-ruta-sub-ruta"
      const className = `page-${pathSegments.join('-')}`;
      classes = ["page", className];
      if (pageId) {
        classes.push(`page-id-${pageId}`);
      }
    }

    return classes;

  }, [pathname, pageId]);

  useEffect(() => {
    const body = document.body;

    // Añadir clases
    bodyClasses.forEach((cls) => body.classList.add(cls));

    // Limpiar al desmontar o cambiar ruta
    return () => {
      bodyClasses.forEach((cls) => body.classList.remove(cls));
    };
  }, [bodyClasses]);

  return <>{children}</>;
};

export default BodyClass;
