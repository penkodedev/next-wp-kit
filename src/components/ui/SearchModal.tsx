"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { searchSite } from '@/api/wordpressApi';
import type { SearchResult } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/url';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      const searchResults = await searchSite(query);
      setResults(searchResults || []);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

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
            <a href="#" onClick={(e) => { e.preventDefault(); handleClose(); }} className="search-modal-close" aria-label="Cerrar búsqueda">&times;</a>

            <form onSubmit={handleSearchSubmit} className="search-modal-form">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué estás buscando?"
                aria-label="Campo de búsqueda"
              />
              <div className="search-modal-buttons">
                <button className="button" type="submit" disabled={!query.trim()}>Buscar</button>
                <button className="button" type="button" onClick={resetSearch}>Limpiar</button>
              </div>
            </form>

            <motion.div layout className="search-modal-results">
              {isLoading && <p>Buscando...</p>}
              {!isLoading && results.length > 0 && (
                <ul>
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
                <p>No se encontraron resultados para "{query}"</p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}