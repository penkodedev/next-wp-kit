import React from "react";
import { getTermsForTaxonomy } from "@/api/wordpressApi";
import type { Term } from "@/types/wordpressTypes";


import Link from "next/link";

interface TaxonomyTermsListProps {
  taxonomy: string; // Slug of the taxonomy (e.g. 'categoria', 'recursos_categoria')
  title?: string;   // Optional title for the list
  link?: boolean;   // If true, render terms as links to archive pages
  postType?: string; // Optional: CPT type to filter terms by usage (future-proof)
}

// Server Component: Lists all terms for a given taxonomy
export default async function TaxonomyTermsList({ taxonomy, title, link = false, postType }: TaxonomyTermsListProps) {
  const terms: Term[] | null = await getTermsForTaxonomy(taxonomy);

  // En el futuro, aquí se podría filtrar los términos por uso en el postType
  // Por ahora, solo recibimos el prop y mostramos todos los términos

  if (!terms || terms.length === 0) {
    return null;
  }

  return (
    <section className="taxonomy-terms-list">
      {title && <span className="taxonomy-label">{title}</span>}
      <ul>
        {terms.map(term => (
          <li key={term.id}>
            {link ? (
              <Link href={`/${taxonomy}/${term.slug}`}>{term.name}</Link>
            ) : (
              <span>{term.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
