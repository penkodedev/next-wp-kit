// src/components/ui/SearchForm.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchSite } from '@/api/wordpressApi';
import type { SearchResult } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/url';

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Función para obtener el título, ya sea un string o un objeto
  const getResultTitle = (result: SearchResult): string => {
    if (typeof result.title === 'string') return result.title;
    return result.title.rendered;
  }

  // Efecto para el "debouncing" de la búsqueda
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setIsDropdownVisible(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      const searchResults = await searchSite(query);
      setResults(searchResults || []);
      setIsLoading(false);
      setIsDropdownVisible(true);
    }, 300); // Espera 300ms después de la última pulsación

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Efecto para cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);

  // Manejar el envío del formulario (al pulsar Enter)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsDropdownVisible(false);
    }
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <form onSubmit={handleSearchSubmit} role="search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setIsDropdownVisible(true)}
          placeholder="Buscar en el sitio..."
          aria-label="Buscar en el sitio"
        />
      </form>
      {isDropdownVisible && (
        <div className="search-results-dropdown">
          {isLoading ? (
            <div className="search-result-item">Cargando...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li key={result.id} className="search-result-item">
                  <Link href={cleanInternalUrl(result.url)} onClick={() => setIsDropdownVisible(false)}>
                    {getResultTitle(result)}
                    <span className="search-result-type">{result.type}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-result-item">No se encontraron resultados.</div>
          )}
        </div>
      )}
    </div>
  );
}