// src/components/wordpress/CustomTaxonomies/TaxonomyTermsList.tsx

/**
 * Server Component: Lists all terms for a given taxonomy
 * Can be used to display category lists, tag clouds, etc.
 */

import React from "react";
import Link from "next/link";
import { getTermsForTaxonomy } from "@/api/wordpressApi";
import type { Term } from "@/types/wordpressTypes";

interface TaxonomyTermsListProps {
  taxonomy: string; // Slug of the taxonomy (e.g. 'categoria', 'recursos_categoria')
  title?: string; // Optional title for the list
  link?: boolean; // If true, render terms as links to archive pages
  postType?: string; // Optional: CPT type to filter terms by usage (future-proof)
}

export default async function TaxonomyTermsList({ taxonomy, title, link = false, postType }: TaxonomyTermsListProps) {
  const terms: Term[] | null = await getTermsForTaxonomy(taxonomy);

  // Future enhancement: filter terms by postType usage
  // For now, we just receive the prop and show all terms

  if (!terms || terms.length === 0) {
    return null;
  }

  return (
    <section className="taxonomy-terms-list">
      {title && <span className="taxonomy-label">{title}</span>}
      <ul>
        {terms.map((term) => (
          <li key={term.id}>
            {link ? <Link href={`/${taxonomy}/${term.slug}`}>{term.name}</Link> : <span>{term.name}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
