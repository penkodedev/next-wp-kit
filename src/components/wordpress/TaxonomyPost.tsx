import React from "react";
import Link from "next/link";
import type { WpContent, Term } from "@/types/wordpressTypes";

interface TaxonomyPostProps {
  post: WpContent;
  taxonomies: string[]; // Array of taxonomy slugs to display (e.g. ['nivel_educativo', 'categoria'])
  link?: boolean;       // If true, render terms as links to their archive pages
  title?: string;       // Optional title for the group
}

/**
 * Displays all terms associated with a post for the given taxonomies.
 * Scalable: works with any taxonomy, custom or native.
 */

export default function TaxonomyPost({ post, taxonomies, link = false, title }: TaxonomyPostProps) {
  if (!post || !post._embedded) return null;

  // WP REST API usually embeds terms in _embedded['wp:term'] as an array of arrays
  const embeddedTerms = post._embedded['wp:term'] as Term[][] | undefined;

  // Recopilar todos los términos de las taxonomías indicadas
  const allTerms: Term[] = [];
  if (embeddedTerms) {
    for (const taxonomy of taxonomies) {
      for (const termArr of embeddedTerms) {
        if (termArr.length > 0 && termArr[0].taxonomy === taxonomy) {
          allTerms.push(...termArr);
        }
      }
    }
  }
  // Si no hay ningún término, no renderizar nada
  if (!allTerms.length) return null;

  return (
    <div className="taxonomy-post">
      {title && <span className="taxonomy-label">{title}</span>}
      {taxonomies.map((taxonomy) => {
        let terms: Term[] = [];
        if (embeddedTerms) {
          for (const termArr of embeddedTerms) {
            if (termArr.length > 0 && termArr[0].taxonomy === taxonomy) {
              terms = termArr;
              break;
            }
          }
        }
        if (!terms.length) return null;
        return (
          <div key={taxonomy} className={`taxonomy-group taxonomy-${taxonomy}`}>
            <span className="taxonomy-label"></span>
            <ul>
              {terms.map((term) => (
                <li key={term.id}>
                  {link ? (
                    <Link href={`/${taxonomy}/${term.slug}`}>{term.name}</Link>
                  ) : (
                    <span>{term.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
