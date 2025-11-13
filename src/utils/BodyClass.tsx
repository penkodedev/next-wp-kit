// src/utils/BodyClass.tsx

"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useWpPageId } from "@/utils/WpPageIdContext";
import { CPT_SLUG_MAP } from "@/utils/cptConfig";

interface BodyClassProps {
  children: React.ReactNode;
}

const BodyClass = ({ children }: BodyClassProps) => {
  const pathname = usePathname();
  const { pageId } = useWpPageId();

  // Generate body classes dynamically from pathname
  const bodyClasses = useMemo(() => {
    const pathSegments = (pathname || '').split('/').filter(Boolean);

    // Remove locale from path segments for class generation
    const slugWithoutLocale = (pathSegments.length > 0 && ['es', 'en'].includes(pathSegments[0])) ? pathSegments.slice(1) : pathSegments;

    let classes: string[] = [];

    if (slugWithoutLocale.length === 1 && CPT_SLUG_MAP[slugWithoutLocale[0]]) {
      const internalCpt = CPT_SLUG_MAP[slugWithoutLocale[0]];
      classes = ['archive', `archive-${internalCpt}`];
    } else if (slugWithoutLocale.length === 0) {
      // Handle home page for all locales
      classes = ["page-home"];
    } else if (slugWithoutLocale.length === 2 && CPT_SLUG_MAP[slugWithoutLocale[0]]) {
      // It's a CPT single page
      const internalCpt = CPT_SLUG_MAP[slugWithoutLocale[0]];
      classes = [`single`, `single-${internalCpt}`];
      if (pageId) {
        classes.push(`postid-${pageId}`);
      }
    } else {
      // It's a regular page
      const className = `page-${slugWithoutLocale.join('-')}`;
      classes = ["page", className];
      if (pageId) {
        classes.push(`page-id-${pageId}`);
      }
    }

    return classes;
  }, [pathname, pageId]);

  useEffect(() => {
    const body = document.body;

    // Clean up previous classes before adding new ones
    const existingClasses = Array.from(body.classList).filter(cls => 
      cls.startsWith('page-') || cls.startsWith('archive') || cls.startsWith('single') || cls.startsWith('postid-')
    );
    body.classList.remove(...existingClasses);

    // Add new classes
    bodyClasses.forEach((cls) => body.classList.add(cls));

    // The cleanup function in useEffect is not strictly necessary with this approach,
    // but we keep it as a good practice in case the component unmounts.
    return () => {
      body.classList.remove(...bodyClasses);
    };
  }, [bodyClasses]);

  return <>{children}</>;
};

export default BodyClass;
