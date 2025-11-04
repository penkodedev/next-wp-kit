// src/utils/BodyClass.tsx

"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useWpPageId } from "@/utils/WpPageIdContext";
import { getActiveCptSlugs } from "@/utils/cptConfig";

interface BodyClassProps {
  children: React.ReactNode;
}

const BodyClass = ({ children }: BodyClassProps) => {
  const pathname = usePathname();
  const { pageId } = useWpPageId();

  // Generate body classes dynamically from pathname
  const bodyClasses = useMemo(() => {
    const pathSegments = (pathname || '').split('/').filter(Boolean);

    // CPT slugs that should be treated as archive pages
    const archivePostTypes = getActiveCptSlugs();
    let classes: string[] = [];

    if (pathSegments.length === 1 && archivePostTypes.includes(pathSegments[0])) {
      const postType = pathSegments[0];
      classes = ['archive', `archive-${postType}`];
    } else if (pathname === '/') {
      classes = ["page-home"];
    } else if (pathSegments.length === 2) {
      // Single post/page (e.g., /cpt_slug/my-cpt)
      const postType = pathSegments[0];
      const archivePostTypes = getActiveCptSlugs();

      if (archivePostTypes.includes(postType)) {
        // It's a CPT single page
        classes = [`single`, `single-${postType}`];
        if (pageId) {
          classes.push(`postid-${pageId}`);
        }
      } else {
        // It's a regular page (like parent/child pages)
        const className = `page-${pathSegments.join('-')}`;
        classes = ["page", className];
        if (pageId) {
          classes.push(`page-id-${pageId}`);
        }
      }

      if (pageId) {
        classes.push(`postid-${pageId}`);
      }
    } else {
      // Convert "/my-route/sub-route" to "page-my-route-sub-route"
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

    // Add classes
    bodyClasses.forEach((cls) => body.classList.add(cls));

    // Clean up on unmount or route change
    return () => {
      bodyClasses.forEach((cls) => body.classList.remove(cls));
    };
  }, [bodyClasses]);

  return <>{children}</>;
};

export default BodyClass;
