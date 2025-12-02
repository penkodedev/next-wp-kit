import React from "react";
import type { Term, WpContent, Taxonomy } from "@/types/wordpressTypes";
import GridPosts from "@/components/layout/content/GridPosts";
import Link from "next/link";
// Elimina la importación de TaxonomyFilter

interface ContentTaxonomyIndexProps {
  taxonomy: Taxonomy;
  terms: Term[];
  posts: WpContent[];
  locale: string;
}

/**
 * Shows a catalog of all terms in a taxonomy and all posts with any term of that taxonomy.
 */
export default function ContentTaxonomyIndex({
  taxonomy,
  terms,
  posts,
  locale,
}: ContentTaxonomyIndexProps) {
  // Calculate displayTitle and basePath for UI consistency
  const displayTitle = taxonomy.name;
  // Siempre usar /recursos como basePath para los recursos
  const basePath = "/recursos";
    
  return (
    <div className="page-fullwidth">
      <section className="page-title">
        <h1>{displayTitle}</h1>
        {taxonomy.description && (
          <p className="taxonomy-description">{taxonomy.description}</p>
        )}
      </section>
      <article className="page-content">
        <section className="taxonomy-terms-list">
          {/* Elimina cualquier uso de TaxonomyFilter */}
        </section>
        {posts && posts.length > 0 ? (
          <GridPosts posts={posts} basePath={basePath} />
        ) : (
          <p>No se encontró contenido en esta sección.</p>
        )}
      </article>
    </div>
  );
}
