"use client";

import { useEffect, useRef, useState } from "react";
import { getTickerSettings, type TickerSettings } from "@/api/wordpressApi";
import { usePathname } from "next/navigation";
import localesConfig from "@/i18n/locales.generated.json";

export default function Ticker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const pathname = usePathname();

  const currentSlug = (() => {
    const segments = pathname.split('/').filter(Boolean);
    const locales = localesConfig.supportedLocales || [];
    const filtered = segments.filter(s => !locales.includes(s));
    return filtered.length === 0 ? '/' : filtered[filtered.length - 1];
  })();

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      const currentLocale = pathname ? pathname.split('/')[1] || localesConfig.defaultLocale : localesConfig.defaultLocale;
      const data = await getTickerSettings(currentLocale);
      if (isMounted) setSettings(data);
    };
    fetchSettings();
    return () => {
      isMounted = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    if (!settings) return;
    const { enabled = false, pages = [], text = '' } = settings;
    if (!enabled || !text) { setShouldRender(false); return; }
    if (pages.length === 0) { setShouldRender(true); return; }
    setShouldRender(pages.includes(currentSlug));
  }, [settings, currentSlug]);

  useEffect(() => {
    if (!shouldRender || !settings || !trackRef.current || !containerRef.current) return;

    const { text, link, speed = 50, noAnimate = false, pauseOnHover = true } = settings;
    const track = trackRef.current;
    const container = containerRef.current;

    track.innerHTML = "";
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const GAP = 220; // px entre el final de una copia y el inicio de la siguiente

    // Crear un bloque: .ticker-content + separador invisible al final
    const createBlock = () => {
      // .ticker-content ya tiene todos los estilos del SCSS
      const content = document.createElement("div");
      content.className = "ticker-content";
      content.innerHTML = link ? `<a href="${link}">${text}</a>` : text;

      // Separador independiente, no toca el texto ni sus estilos
      const separator = document.createElement("span");
      separator.style.display = "inline-block";
      separator.style.width = `${GAP}px`;
      separator.style.flexShrink = "0";

      const wrapper = document.createElement("div");
      wrapper.style.display = "contents"; // no genera caja extra
      wrapper.appendChild(content);
      wrapper.appendChild(separator);
      return { wrapper, content };
    };

    const { wrapper: w1, content: c1 } = createBlock();
    const { wrapper: w2 } = createBlock();
    track.appendChild(w1);
    track.appendChild(w2);

    if (noAnimate) return;

    const timeoutId = setTimeout(() => {
      // Medir el ancho del primer bloque completo (texto + separador)
      // Para eso medimos desde el inicio del track hasta el inicio del segundo bloque
      const blockWidth = c1.offsetWidth + GAP;
      if (blockWidth === 0) return;

      const speedPx = 0.5 + (speed / 100) * 4.5;
      let position = 0;
      let isPaused = false;

      const animate = () => {
        if (!isPaused) {
          position -= speedPx;
          if (position <= -blockWidth) position += blockWidth;
          track.style.transform = `translate3d(${position}px, 0, 0)`;
        }
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      if (pauseOnHover) {
        container.addEventListener("mouseenter", () => { isPaused = true; });
        container.addEventListener("mouseleave", () => { isPaused = false; });
      }
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [shouldRender, settings]);

  if (!shouldRender) return null;

  const { size = "medium", noAnimate = false } = settings || {};

  return (
    <div
      ref={containerRef}
      className={`ticker-container ticker-${size}${noAnimate ? " ticker-static" : ""}`}
    >
      <div ref={trackRef} className="ticker-track" />
    </div>
  );
}