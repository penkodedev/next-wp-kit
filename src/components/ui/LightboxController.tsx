// src/components/ui/LightboxController.tsx

"use client";

import type { Slide } from "yet-another-react-lightbox";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";

// Import base library styles
import "yet-another-react-lightbox/styles.css";

// Import the plugins we want to use and their styles
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

/**
 * A global controller that automatically detects linked images
 * in Gutenberg content and opens them in a lightbox with gallery features.
 * It should be placed only once in the main layout.
 */
export default function LightboxController() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(-1);
  const pathname = usePathname(); // Hook to detect route changes

  // We unify all the logic in a single useEffect that updates with each route change.
  useEffect(() => {
    // 1. Scan the DOM to find linked images on the current page.
    const imageAnchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        "a[href$='.jpg'], a[href$='.jpeg'], a[href$='.png'], a[href$='.gif'], a[href$='.webp']"
      )
    ).filter((anchor) => anchor.querySelector("img"));

    const newSlides = imageAnchors.map((anchor) => {
      const img = anchor.querySelector("img");
      return {
        src: anchor.href,
        alt: img?.alt || "Expanded image",
      };
    });

    setSlides(newSlides);

    // 2. Define the click handler.
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      // `newSlides` is the most up-to-date list for this render cycle.
      const imageIndex = newSlides.findIndex(
        (slide) => slide.src === anchor?.href
      );
      if (imageIndex !== -1) {
        e.preventDefault();
        setIndex(imageIndex);
      }
    };

    // 3. Add the click listener.
    document.addEventListener("click", handleClick);

    // 4. Cleanup function: runs when the route changes or the component unmounts.
    return () => {
      document.removeEventListener("click", handleClick);
      setSlides([]); // Clear slides for the next page.
      setIndex(-1); // Close the lightbox if it's open during navigation.
    };
  }, [pathname]); // The only dependency is the route change.

  return (
    <Lightbox
      open={index >= 0}
      index={index}
      close={() => setIndex(-1)}
      slides={slides}
      // You can add all the settings you want here.
      // Documentation: https://yet-another-react-lightbox.com/documentation
      plugins={[Zoom, Thumbnails]}
      // animation.slide has been renamed to animation.navigation
      animation={{ fade: 250, navigation: 400, swipe: 500 }}
      // Disable infinite loop to prevent repeating images when there are few.
      carousel={{ finite: true, imageFit: "contain" }}
      // Example: Adjust max zoom level and speed
      zoom={{ maxZoomPixelRatio: 2.5, zoomInMultiplier: 1.5 }}
      // Example: Add a border to thumbnails and change their position
      thumbnails={{ position: "bottom", border: 0, borderColor: "none" }}
      // controller.closeOnSwipeDown has been renamed to controller.closeOnPullDown
      controller={{ closeOnPullDown: true }}
    />
  );
}
