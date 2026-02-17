'use client';

import { useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icons } from '@/components/ui/Icons';

interface Tooltip {
  id: string;
  content: string;
}

export default function TooltipsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    let tooltips: Tooltip[] = [];
    let tooltipEl: HTMLDivElement | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let observer: MutationObserver | null = null;

    // ─── Crear el elemento del tooltip ───────────────────────────────────────
    function getTooltipEl(): HTMLDivElement {
      if (tooltipEl) return tooltipEl;

      tooltipEl = document.createElement('div');
      tooltipEl.className = 'pk-tooltip-bubble';
      document.body.appendChild(tooltipEl);

      tooltipEl.addEventListener('mouseenter', cancelHide);
      tooltipEl.addEventListener('mouseleave', () => scheduleHide());

      return tooltipEl;
    }

    // ─── Posicionar y mostrar ─────────────────────────────────────────────────
    function showTooltip(content: string, anchor: HTMLAnchorElement) {
      cancelHide();

      const el = getTooltipEl();
      el.innerHTML = content;
      el.classList.add('pk-tooltip-bubble--visible');

      requestAnimationFrame(() => {
        if (!tooltipEl) return;

        const ar = anchor.getBoundingClientRect();
        const tw = tooltipEl.offsetWidth;
        const th = tooltipEl.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = ar.left;
        let top  = ar.bottom + 8;

        if (left + tw > vw - 12) left = vw - tw - 12;
        if (top + th > vh - 12)  top  = ar.top - th - 8;
        if (left < 8) left = 8;
        
        const arrowLeft = Math.round(ar.left + ar.width / 2 - left - 6);
tooltipEl.style.setProperty('--arrow-left', `${Math.max(8, arrowLeft)}px`);

        tooltipEl.style.left = `${Math.round(left)}px`;
        tooltipEl.style.top  = `${Math.round(top)}px`;
      });
    }

    function hideTooltip() {
      if (!tooltipEl) return;
      tooltipEl.classList.remove('pk-tooltip-bubble--visible');
    }

    function scheduleHide() {
      hideTimer = setTimeout(hideTooltip, 150);
    }

    function cancelHide() {
      if (hideTimer !== null) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────
    function getTooltipId(href: string | null): string | null {
      if (!href) return null;
      const match = href.match(/#tooltip-(.+)$/);
      return match ? match[1] : null;
    }

    function findTooltip(id: string): Tooltip | undefined {
      return tooltips.find((t) => String(t.id) === String(id));
    }

    // ─── Handlers por enlace ──────────────────────────────────────────────────
    function onLinkMouseEnter(e: Event) {
      const link = e.currentTarget as HTMLAnchorElement;
      const id   = getTooltipId(link.getAttribute('href'));
      if (!id) return;

      const tooltip = findTooltip(id);
      if (!tooltip) return;

      showTooltip(tooltip.content, link);
    }

    function onLinkMouseLeave(e: Event) {
      const relatedTarget = (e as MouseEvent).relatedTarget as Node | null;
      if (tooltipEl && relatedTarget && tooltipEl.contains(relatedTarget)) return;
      scheduleHide();
    }

    function onLinkClick(e: Event) {
      e.preventDefault();
      e.stopPropagation();
    }

    // ─── Adjuntar listeners ───────────────────────────────────────────────────
    const attachedLinks = new WeakSet<HTMLAnchorElement>();

    function attachLink(link: HTMLAnchorElement) {
      if (attachedLinks.has(link)) return;
      attachedLinks.add(link);
      link.addEventListener('mouseenter', onLinkMouseEnter);
      link.addEventListener('mouseleave', onLinkMouseLeave);
      link.addEventListener('click',      onLinkClick);
    }

    function scanLinks(root: Document | Element = document) {
      root
        .querySelectorAll<HTMLAnchorElement>('a[href*="#tooltip-"]')
        .forEach((link) => {
          attachLink(link);
          injectInfoIcon(link);
        });
    }

    // ─── Inyectar icono de información ──────────────────────────────────────────
    function injectInfoIcon(link: HTMLAnchorElement) {
      // Ya tiene clase tooltip-link?
      if (link.classList.contains('tooltip-link')) return;

      // Añadir clase al enlace
      link.classList.add('tooltip-link');

      // Usar Icons de lucide-react via renderToStaticMarkup
      const iconHtml = renderToStaticMarkup(
        <Icons.Info size={13} strokeWidth={2.4} className="pk-tooltip-icon" />
      );

      const iconWrapper = document.createElement('span');
      iconWrapper.innerHTML = iconHtml;
      link.appendChild(iconWrapper.firstElementChild!);
    }

    // ─── MutationObserver ─────────────────────────────────────────────────────
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('a[href*="#tooltip-"]')) attachLink(node as HTMLAnchorElement);
          scanLinks(node);
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // ─── Fetch ────────────────────────────────────────────────────────────────
    const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? '';

    fetch(`${wpApiUrl}/custom/v1/tooltips`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) return;
        tooltips = data as Tooltip[];
        scanLinks(); // escanear DOM ya renderizado
      })
      .catch((err) => console.error('[Tooltips] Error fetch:', err));

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      observer?.disconnect();
      if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
      if (hideTimer !== null) clearTimeout(hideTimer);
    };
  }, []);

  return <>{children}</>;
}