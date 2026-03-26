// src/components/forms/SearchForm.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { searchSite } from '@/api/wordpressApi';
import type { SearchResult } from '@/types/wordpressTypes';
import { cleanInternalUrl } from '@/utils/wordpress/url';
import { Icons } from '@/components/ui/Icons';

export default function SearchForm() {
  const t = useTranslations('Search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Get title as string from SearchResult (can be string or object)
  const getResultTitle = (result: SearchResult): string => {
    if (typeof result.title === 'string') return result.title;
    return result.title.rendered;
  }

  // Debounce search queries
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
    }, 300); // Wait 300ms after last keystroke

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle form submission (on Enter key)
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
        <div className="input-wrapper">
          <input
            type="search"
            id="search-form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 3 && setIsDropdownVisible(true)}
            placeholder=" "
            aria-label={t('ariaLabel')}
          />
          <label htmlFor="search-form-input">{t('placeholder')}</label>
          <span className="search-icon">
            <Icons.Search size={20} strokeWidth={1.2} />
          </span>
        </div>
      </form>
      {isDropdownVisible && (
        <div className="search-results-dropdown">
          {isLoading ? (
            <div className="search-result-item">{t('loading')}</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li key={result.id} className="search-result-item">
                  <Link href={cleanInternalUrl(result.url)} onClick={() => setIsDropdownVisible(false)}>
                    {getResultTitle(result)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-result-item">{t('noResults')}</div>
          )}
        </div>
      )}
    </div>
  );
}