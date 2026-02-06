// src/components/ui/ButtonCopyLink.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
// Animación solo con span, sin portal
import { Icons } from '@/components/ui/Icons';

interface ButtonCopyLinkProps {
  className?: string;
}

/**
 * Small copy-to-clipboard button used near share actions.
 * Copies the current page URL.
 * Minimal, accessible feedback shown for a short time.
 */
export default function ButtonCopyLink({
  className = ''
}: ButtonCopyLinkProps) {
  const pathname = usePathname();
  // Usar location.origin + pathname para asegurar URL absoluta
  let href: string;
  if (typeof window !== 'undefined' && window.location) {
    href = window.location.origin + pathname;
  } else if (process.env.NEXT_PUBLIC_BASE_URL) {
    href = process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '') + pathname;
  } else {
    href = pathname;
  }

  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  // No portal, solo animación CSS

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (err) {
      document.body.removeChild(textarea);
      return false;
    }
  };

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(href);
      } else {
        const ok = fallbackCopy(href);
        if (!ok) throw new Error('copy-failed');
      }

      setCopied(true);
      // small ephemeral feedback
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      // silent fail — we don't block the UI
    }
  };

  
  return (
    <>
      <a
        href={href}
        onClick={handleCopy}
        className={`button-copy-link ${className}`.trim()}
        aria-label="Copy link"
        title={copied ? 'OK' : 'Copy link'}
      >
  <Icons.Copy size={18} strokeWidth={1.6} />
        {/* Toast animado, sin portal */}
        <span
          className={`copy-modal${copied ? ' visible' : ''}`}
          aria-hidden={!copied}
        >
                  <p>✔ Link Copied</p>
                  <p>✔ Enlace Copiado</p>
                  <p>✔ Lien copié</p>
        </span>

        {/* Screen reader announcement */}
        <span className="sr-only" aria-live="polite">
          {copied ? 'Link copied to clipboard' : ''}
        </span>
      </a>
    </>
  );
}
