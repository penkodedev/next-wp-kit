"use client";

import { useState, useEffect, useRef, useCallback, useDeferredValue, useMemo, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { searchSite } from '@/api/wordpressApi';
import type { SearchResult } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/wordpress/url';
import { Icons } from '@/components/ui/Icons';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const t = useTranslations('Search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Defer the query value to prevent blocking the UI during typing
  const deferredQuery = useDeferredValue(query);
  
  // Check if the deferred value is lagging behind the current value
  const isStale = query !== deferredQuery;

  const getResultTitle = (result: SearchResult): string => {
    if (typeof result.title === 'string') return result.title;
    return result.title.rendered;
  };

  const resetSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetSearch();
    onClose();
  }, [onClose, resetSearch]);

  // Perform search using deferred query value
  useEffect(() => {
    if (deferredQuery.length < 3) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      
      // Use startTransition to mark this update as non-urgent
      startTransition(async () => {
        const searchResults = await searchSite(deferredQuery);
        setResults(searchResults || []);
        setIsLoading(false);
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [deferredQuery]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus en el input al abrir
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="search-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="search-modal-content"
            initial={{ opacity: 0, y: -50 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{ opacity: 0, y: '-100%' }} // Sale hacia arriba
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={handleClose}
              className="search-modal-close"
              aria-label={t('closeSearch')}>
              <Icons.X size={28} strokeWidth={1.2} />
            </button>

            <form onSubmit={handleSearchSubmit} className="search-modal-form">
              <div className="input-wrapper">
                <input
                  ref={inputRef}
                  id="search-modal-input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder=" "
                  aria-label={t('ariaLabel')}
                />
                <label htmlFor="search-modal-input">{t('modalPlaceholder')}</label>
              </div>
              <div className="search-modal-buttons">
                <button className="button" type="submit" disabled={!query.trim()}>{t('searchButton')}</button>
                <button className="button" type="button" onClick={resetSearch}>{t('clearButton')}</button>
              </div>

              <div className="search-modal-hint">
                <p>{t('searchHint')}</p>
              </div>
              
            </form>

            <motion.div layout className="search-modal-results">
              {isLoading && <p>{t('searching')}</p>}
              {isStale && !isLoading && query.length >= 3 && (
                <p style={{ opacity: 0.6, fontStyle: 'italic' }}>
                  {t('updating') || 'Updating results...'}
                </p>
              )}
              {!isLoading && results.length > 0 && (
                
                
                <ul style={{ opacity: isStale ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
                  {results.map((result) => (
                    <li key={result.id}>
                      <Link href={cleanInternalUrl(result.url)} onClick={handleClose}>
                        {getResultTitle(result)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {!isLoading && query.length >= 3 && results.length === 0 && (
                <p>{t('noResultsFor', { query })}</p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}