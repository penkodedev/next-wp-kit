// src/components/ui/SearchTrigger.tsx

"use client";

import { useState } from 'react';
import SearchModal from '@/components/features/search/SearchModal';
import { Icons } from '@/components/ui/Icons';

export default function SearchTrigger() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleOpenSearch = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsSearchOpen(true);
  };

  return (
    <>
      <a href="#" onClick={handleOpenSearch} className="search-open-button" aria-label="Abrir búsqueda">
        <Icons.Search size={20} strokeWidth={1.4} />
      </a>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}