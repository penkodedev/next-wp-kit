// Intelligent catch-all route to handle pages and CPTs from WordPress.

import { getContentBySlug, getAllContent, getHomePage } from "@/api/wordpressApi";
import { fetchAPI } from "@/api/wordpressApi";
import { generateSeoMetadata } from "@/utils/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Page, WpContent } from "@/types/wordpressTypes";
import { WpPageIdSetter } from "@/utils/WpPageIdContext";
import { processContent } from "@/utils/processContent";
import { CPT_SLUG_MAP, getTranslatedCptSlug } from "@/utils/cptConfig";
import HeroConfig from '@/components/sections/HeroConfig';
import ContentSingle from '@/components/layout/content/ContentSingle';
import ContentArchive from '@/components/layout/content/ContentArchive';
import ContentPages from '@/components/layout/content/ContentPages';

type PageProps = {
  params: {
    slug: string[];
  };
};

function getPathFromParams(params: PageProps["params"]): string {
  return params.slug.join("/");
}

type RouteType =
  | { type: 'page'; path: string }
  | { type: 'cpt-archive'; cpt: string }
  | { type: 'cpt-single'; cpt: string; slug: string };

export async function detectRouteType(slug: string[]): Promise<RouteType> {
  console.log('Detecting route type for slug:', slug);

  const firstSegment = slug[0];  
  const isLocale = ['es', 'en'].includes(firstSegment);
  const slugWithoutLocale = isLocale ? slug.slice(1) : slug;

  // Case 1: Home page (e.g., / or /en)
  if (slugWithoutLocale.length === 0) {
    console.log('Route type: home page');
    return { type: 'page', path: '' };
  }

  const firstSlugSegment = slugWithoutLocale[0];
  const secondSlugSegment = slugWithoutLocale[1];

  // Case 2: CPT Archive (e.g., /noticias or /en/news)
  if (slugWithoutLocale.length === 1 && CPT_SLUG_MAP[firstSlugSegment]) {
    const internalCpt = CPT_SLUG_MAP[firstSlugSegment];
    console.log(`Route type: cpt-archive for ${internalCpt} (from slug ${firstSlugSegment})`);
    return { type: 'cpt-archive', cpt: internalCpt };
  }

  // Case 3: CPT Single (e.g., /noticias/mi-noticia or /en/news/my-news)
  if (slugWithoutLocale.length === 2 && CPT_SLUG_MAP[firstSlugSegment]) {
    const internalCpt = CPT_SLUG_MAP[firstSlugSegment];
    const postSlug = secondSlugSegment;
    console.log(`Route type: cpt-single for ${internalCpt} (from slug ${firstSlugSegment}), post slug: ${postSlug}`);
    return { type: 'cpt-single', cpt: internalCpt, slug: postSlug };
  }

  // Case 4: Default to a page
  const pagePath = slugWithoutLocale.join('/');
  console.log('Route type: page with path', pagePath);
  return { type: 'page', path: pagePath };
}

// Generate Dynamic Metadata for SEO.
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const path = getPathFromParams(params);
  const routeType = await detectRouteType(params.slug);

  if (routeType.type === 'cpt-single') {
    const post = await getContentBySlug<WpContent>(routeType.cpt, routeType.slug);
    return generateSeoMetadata(post);
  } else if (routeType.type === 'cpt-archive') {
    return {
      title: `${routeType.cpt.charAt(0).toUpperCase() + routeType.cpt.slice(1)} Archive`,
    };
  } else {
    let page = await getContentBySlug<Page>("pages", path).catch(() => null);

    if (!page && params.slug.length > 1) {
      const lastSlug = params.slug[params.slug.length - 1];
      page = await getContentBySlug<Page>("pages", lastSlug).catch(() => null);
    }

    return generateSeoMetadata(page);
  }
}

// Generate Static Routes at build time.
export async function generateStaticParams() {
  const params: { slug: string[] }[] = [];

  // Add locale-only routes (like /en for home page)
  params.push({ slug: ['es'] });
  params.push({ slug: ['en'] });

  // Add pages
  const pages = await getAllContent<Page>("pages");
  if (pages) {
    pages.forEach((page) => {
      const pageSlugs = page.slug.split("/").filter(Boolean);
      // Add without locale prefix (default)
      params.push({ slug: pageSlugs });
      // Add with locale prefixes
      params.push({ slug: ['es', ...pageSlugs] });
      params.push({ slug: ['en', ...pageSlugs] });
    });
  }

  // Add CPT archives and singles
  try {
    // Get all known CPTs from config (dynamic, no hardcoding individual CPTs)
    const customTypes = Object.values(CPT_SLUG_MAP).filter((cpt, index, self) => 
      self.indexOf(cpt) === index // Remove duplicates
    );

    for (const cpt of customTypes) {
      // Add archive pages - use translated slugs for English
      params.push({ slug: [cpt] });
      params.push({ slug: ['es', cpt] });

      // For English, use getTranslatedCptSlug (100% dynamic, no hardcoding)
      const englishSlug = getTranslatedCptSlug(cpt, 'en');
      params.push({ slug: ['en', englishSlug] });

      try {
        // Get posts in both languages to generate all possible routes
        const spanishPosts = await getAllContent<WpContent>(cpt, '?per_page=10&_embed');
        const englishPosts = await getAllContent<WpContent>(cpt, '?per_page=10&_embed&lang=en');

        // Combine posts from both languages
        const allPosts = [...(spanishPosts || []), ...(englishPosts || [])];
        const uniquePosts = allPosts.filter((post, index, self) =>
          index === self.findIndex(p => p.id === post.id)
        );

        if (uniquePosts.length > 0) {
          uniquePosts.forEach(post => {
            // Add single CPT pages in Spanish
            params.push({ slug: [cpt, post.slug] });
            params.push({ slug: ['es', cpt, post.slug] });

            // Add single CPT pages in English with translated archive slug
            params.push({ slug: ['en', englishSlug, post.slug] });
          });
        }
      } catch (error) {
        // Skip CPTs that fail to load
      }
    }
  } catch (error) {
    // Continue without CPT params if API fails
  }

  return params;
}

export default async function CatchAllPage({ params }: PageProps) {
  const path = getPathFromParams(params);
  const routeType = await detectRouteType(params.slug);
  // Determine the current locale from the path
  const locale = (params.slug.length > 0 && ['es', 'en'].includes(params.slug[0])) ? params.slug[0] : 'es';
  console.log('Route type result:', routeType);
  if (routeType.type === 'cpt-archive') {
    // Use WPML REST API filtering for translated content
    const apiParams = locale === 'es'
      ? '?per_page=12&_embed&orderby=date&order=desc'
      : `?per_page=12&_embed&orderby=date&order=desc&lang=${locale}`;

    const posts = await getAllContent<WpContent>(routeType.cpt, apiParams);

    // Use getTranslatedCptSlug for dynamic title and basePath (100% scalable)
    const translatedCptSlug = getTranslatedCptSlug(routeType.cpt, locale);
    const displayTitle = translatedCptSlug.charAt(0).toUpperCase() + translatedCptSlug.slice(1);
    const basePath = locale === 'es' ? `/${translatedCptSlug}` : `/${locale}/${translatedCptSlug}`;

/**********************************************
      START BUILDING CPT ARCHIVE HTML
**********************************************/
    return (
      <ContentArchive 
        posts={posts}
        displayTitle={displayTitle}
        basePath={basePath}
      />
    );
  }

  if (routeType.type === 'cpt-single') {
    // For single posts, we need to find the translated slug if we're in a different locale
    let slugToFetch = routeType.slug;

    // For single posts, slugs are the same in both languages
    // No translation needed - use the slug directly
    console.log(`Fetching single post with slug: ${routeType.slug} for CPT: ${routeType.cpt} in locale: ${locale}`);

    const post = await getContentBySlug<WpContent>(routeType.cpt, slugToFetch, locale);

    if (!post) {
      notFound();
    }

    // Build the correct "Back to Archive" URL based on current locale
    const translatedCptSlug = getTranslatedCptSlug(routeType.cpt, locale);
    const backToArchiveUrl = locale === 'es' ? `/${translatedCptSlug}` : `/${locale}/${translatedCptSlug}`;
    
    // Display name: capitalize the translated slug (fully dynamic, no hardcoding)
    const archiveName = translatedCptSlug.charAt(0).toUpperCase() + translatedCptSlug.slice(1);

/**********************************************
           START BUILDING CPT SINGLE HTML
**********************************************/
    return (
      <ContentSingle 
        post={post}
        cpt={routeType.cpt}
        backToArchiveUrl={backToArchiveUrl}
        archiveName={archiveName}
        locale={locale}
      />
    );
  }

  // Default: Render Page or Home
  // Check if this is a locale-only route (like /en) that should show home page
  const firstSegment = params.slug[0];
  const isLocaleOnly = params.slug.length === 1 && ['es', 'en'].includes(firstSegment);

  if (isLocaleOnly) {
    // Load home page with language support
    const lang = firstSegment === 'es' ? undefined : firstSegment; // es is default, so no lang param
    const homePage = await getHomePage(lang);

    if (!homePage) {
      notFound();
    }

    return (
      <>
        <WpPageIdSetter pageId={homePage.id} />
        <HeroConfig /> {/* Render HeroConfig here */}
        <div className="page-one-col">
          <article>
            <div
              dangerouslySetInnerHTML={{
                __html: processContent(homePage.content.rendered),
              }}
            />
          </article>
        </div>

        <section className="slider-container">
          {/* You might want to import and use SliderRecursos here */}
        </section>
      </>
    );
  }

  // Default: Render Page
  // For pages, we simply use the slug from the URL and the current locale
  let page = await getContentBySlug<Page>("pages", path, locale);

  // If page not found and we have a locale prefix, try to get the translated version
  if (!page && params.slug.length > 1 && ['es', 'en'].includes(params.slug[0])) {
    const lang = params.slug[0];
    const actualPath = params.slug.slice(1).join('/');

    // Try to get the translated page using WPML REST API
    if (lang !== 'es') { // This check is redundant if getContentBySlug already uses locale
      const translatedPage = await fetchAPI<Page>(`/wp/v2/pages?slug=${actualPath}&lang=${lang}&_embed`);
      if (translatedPage && Array.isArray(translatedPage) && translatedPage.length > 0) {
        page = translatedPage[0];
      }
    }
  }

  if (!page && params.slug.length > 1) {
    // Try with just the last segment for child pages
    const lastSlug = params.slug[params.slug.length - 1];
    page = await getContentBySlug<Page>("pages", lastSlug);
  }

  if (!page) {
    notFound();
  }

  // Set page ID for body classes
  const pageId = page.id;

/**********************************************
       START BUILDING STATIC PAGE HTML
**********************************************/
   return <ContentPages page={page} />;
}
