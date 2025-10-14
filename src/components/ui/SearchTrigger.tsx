// src/components/ui/SearchTrigger.tsx
"use client";

import { useState } from 'react';
import SearchModal from '@/components/ui/SearchModal';

export default function SearchTrigger() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleOpenSearch = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsSearchOpen(true);
  };

  return (
    <>
      <a href="#" onClick={handleOpenSearch} className="search-open-button" aria-label="Abrir búsqueda">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </a>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}