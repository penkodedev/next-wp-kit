// src/components/layout/content/ContentTaxonomy.tsx

import React from "react";
import { getTranslatedCptSlug } from "@/utils/config/cptConfig";
import type { WpContent, Term } from "@/types/wordpressTypes";
import localesConfig from "@/i18n/locales.generated.json";
import PostCard from "@/components/ui/PostCard";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import SearchForm from "@/components/forms/SearchForm";
import { Search } from "lucide-react";

interface ContentTaxonomyProps {
  posts: WpContent[];
  taxonomy: string;
  term: Term;
  locale: string;
}

/**
 * Archive page for a taxonomy term.
 * Shows the term info and all posts associated with it.
 */
export default function ContentTaxonomy({
  posts,
  taxonomy,
  term,
  locale,
}: ContentTaxonomyProps) {
  // Calculate displayTitle and basePath like ContentArchive
  const translatedSlug = getTranslatedCptSlug(taxonomy, locale);
  const displayTitle =
    term.name ||
    translatedSlug.charAt(0).toUpperCase() + translatedSlug.slice(1);
  const basePath =
    locale === localesConfig.defaultLocale
      ? `/${translatedSlug}`
      : `/${locale}/${translatedSlug}`;

  // Calculate basePath for each post's CPT, not for taxonomy
  function getPostBasePath(post: WpContent) {
    const cptSlug = post.type || "posts";
    const translatedCptSlug = getTranslatedCptSlug(cptSlug, locale);
    return locale === localesConfig.defaultLocale
      ? `/${translatedCptSlug}`
      : `/${locale}/${translatedCptSlug}`;
  }

  return (
    <div className="page-one-col">
      <section className="page-title">
        <h1>{displayTitle}</h1>
        <div className="columns-wrap">
          {term.description && (
            <p
              className="taxonomy-description"
              dangerouslySetInnerHTML={{ __html: term.description }}
            />
          )}
        </div>
      </section>
      <Breadcrumbs />
      {posts && posts.length > 0 ? (
        <div className={`post-grid cols-3 taxonomy`}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              item={post}
              basePath={getPostBasePath(post)}
            />
          ))}
        </div>
      ) : (
        <article className="page-content">
          <p>No se encontró contenido en esta sección.</p>
        </article>
      )}
      <SearchForm />
    </div>
  );
}
