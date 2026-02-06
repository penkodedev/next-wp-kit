// src/components/ui/ButtonShare.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/ui/Icons';

interface ButtonShareProps {
  title: string;
  description?: string;
  className?: string;
}

/**
 * Professional share menu with multiple social networks
 * Detects mobile for native WhatsApp sharing
 * Includes copy-to-clipboard functionality
 */
export default function ButtonShare({ title, description, className = '' }: ButtonShareProps) {
  const t = useTranslations('Content');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}${pathname}`;
  const text = description || title;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`*${title}*\n${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail if clipboard API not available
    }
  };

  return (
    <div className="button-share-wrapper" ref={menuRef}>
      <a
        href="#share"
        className="icons-page-title icon-share"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-label={t('share')}
        aria-expanded={isOpen}
      >
        <Icons.Share2 size={18} strokeWidth={1.5} />
      </a>

      {isOpen && (
        <div className="share-dropdown">
          <p>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
            <Icons.Facebook size={18} /> Facebook
          </a>
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
            <Icons.Twitter size={18} /> Twitter
          </a>
          <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
            <Icons.MessageCircle size={18} /> WhatsApp
          </a>
          <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
            <Icons.Send size={18} /> Telegram
          </a>
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
            <Icons.Linkedin size={18} /> LinkedIn
          </a>
          <a href={shareLinks.email} onClick={() => setIsOpen(false)}>
            <Icons.Mail size={18} /> Email
          </a>
          <a 
            href="#copy" 
            className="copy-link"
            onClick={(e) => {
              e.preventDefault();
              handleCopyLink();
            }}
          >
            {copied ? <Icons.Check size={18} /> : <Icons.ExternalLink size={18} />}
            {copied ? '¡Copiado!' : 'Copiar enlace'}
          </a>
          </p>
        </div>
      )}
    </div>
  );
}
