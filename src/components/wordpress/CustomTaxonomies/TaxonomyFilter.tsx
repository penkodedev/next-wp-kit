// src/components/wordpress/CustomTaxonomies/TaxonomyFilter.tsx

/**
 * Modern taxonomy filter component with search, multi-select and chips
 * Client component for interactive filtering
 */

"use client";

import React, { useState, useMemo } from "react";
import type { Term } from "@/types/wordpressTypes";
import { Icons } from "@/components/ui/Icons";

interface TaxonomyFilterProps {
  terms: Term[];
  onFilter: (selected: Term[]) => void;
}

export default function TaxonomyFilter({ terms, onFilter }: TaxonomyFilterProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Term[]>([]);

  // Filter terms by search
  const filteredTerms = useMemo(() => {
    if (!search) return terms;
    return terms.filter((term) => term.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, terms]);

  // Handle select/deselect
  const toggleTerm = (term: Term) => {
    if (selected.some((t) => t.id === term.id)) {
      setSelected(selected.filter((t) => t.id !== term.id));
    } else {
      setSelected([...selected, term]);
    }
  };

  // Remove chip
  const removeChip = (term: Term) => {
    setSelected(selected.filter((t) => t.id !== term.id));
  };

  // Notify parent on change
  React.useEffect(() => {
    onFilter(selected);
  }, [selected, onFilter]);

  return (
    <div className="taxonomy-filter">
      <div className="filter-search">
        <span className="search-icon">
          <Icons.Search size={18} />
        </span>
        <input type="search" placeholder="Buscar término..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="filter-chips">
        {selected.map((term) => (
          <span className="filter-chip" key={term.id}>
            {term.name}
            <button type="button" onClick={() => removeChip(term)} aria-label="Quitar">
              <Icons.X size={14} />
            </button>
          </span>
        ))}
      </div>
      <ul className="filter-terms">
        {filteredTerms.map((term) => (
          <li key={term.id}>
            <label className="filter-term-label">
              <input type="checkbox" checked={selected.some((t) => t.id === term.id)} onChange={() => toggleTerm(term)} />
              <span>{term.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
