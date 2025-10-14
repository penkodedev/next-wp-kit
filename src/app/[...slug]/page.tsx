// src/app/[locale]/[...slug]/page.tsx
// Catch-all route to handle all static pages from WordPress.

import { getContentBySlug, getAllContent } from '@/api/wordpressApi';
import { generateSeoMetadata } from '@/utils/seo';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Page } from '@/types/wordpressTypes';

type PageProps = {
  params: {
    // The `slug` is an array because this is a catch-all route.
    slug: string[];
  };
};

function getPathFromParams(params: PageProps['params']): string {
  return params.slug.join('/');
}

// Generate Dynamic Metadata for SEO.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = getPathFromParams(params);
  const page = await getContentBySlug<Page>('pages', path).catch(() => null);
  return generateSeoMetadata(page);
}

// Generate Static Routes at build time.
export async function generateStaticParams() {
  const pages = await getAllContent<Page>('pages');
  if (!pages) {
    return [];
  }
  // We map the page's slug to a slug array.
  return pages.map((page) => ({
    slug: page.slug.split('/').filter(Boolean),
  }));
}

export default async function CatchAllPage({ params }: PageProps) {
  const path = getPathFromParams(params);
  const page = await getContentBySlug<Page>('pages', path);

  if (!page) {
    notFound();
  }

  return (
    <main>
      <div className="container">
        <article className="page-content">
          <h1>{page.title.rendered}</h1>
          <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
        </article>
      </div>
    </main>
  );
}