// src/app/[...slug]/page.tsx
// Catch-all route to handle all static pages from WordPress.

import { getContentBySlug, getAllContent } from "@/api/wordpressApi";
import AnimatedArticle from "@/components/animations/AnimatedArticle";
import { generateSeoMetadata } from "@/utils/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Page } from "@/types/wordpressTypes";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { ContactForm7Content } from "@/components/forms";
import { WpPageIdSetter } from "@/utils/WpPageIdContext";

type PageProps = {
  params: {
    // The `slug` is an array because this is a catch-all route.
    slug: string[];
  };
};

function getPathFromParams(params: PageProps["params"]): string {
  return params.slug.join("/");
}

// Generate Dynamic Metadata for SEO.
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const path = getPathFromParams(params);
  const page = await getContentBySlug<Page>("pages", path).catch(() => null);
  return generateSeoMetadata(page);
}

// Generate Static Routes at build time.
export async function generateStaticParams() {
  const pages = await getAllContent<Page>("pages");
  if (!pages) {
    return [];
  }
  // We map the page's slug to a slug array.
  return pages.map((page) => ({
    slug: page.slug.split("/").filter(Boolean),
  }));
}

export default async function CatchAllPage({ params }: PageProps) {
  const path = getPathFromParams(params);
  const page = await getContentBySlug<Page>("pages", path);

  if (!page) {
    notFound();
  }

  // Set page ID for body classes
  const pageId = page.id;


/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  return (
    <>
      <WpPageIdSetter pageId={pageId} />
      <div className="page-one-col">
        <main>
          <section className="page-title">
            <h1>{page.title.rendered}</h1>
          </section>
          <article className="page-content">
            <AnimatedArticle>
            <Breadcrumbs />
            <ContactForm7Content
              content={page.content.rendered}
              hasForm={page.content.rendered.includes('wpcf7-form')}
              />
              </AnimatedArticle>
          </article>
        </main>
      </div>
    </>
  );
}
