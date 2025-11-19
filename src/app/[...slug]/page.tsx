// Intelligent catch-all route to handle pages and CPTs from WordPress.

import { getContentBySlug, getAllContent, getHomePage } from "@/api/wordpressApi";
import { fetchAPI } from "@/api/wordpressApi";
import { generateSeoMetadata } from "@/utils/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Page, WpContent } from "@/types/wordpressTypes";
import { CPT_SLUG_MAP, getTranslatedCptSlug } from "@/utils/cptConfig";
import ContentSingle from '@/components/layout/content/ContentSingle';
import ContentArchive from '@/components/layout/content/ContentArchive';
import ContentPages from '@/components/layout/content/ContentPages';
import ContentHome from '@/components/layout/content/ContentHome';
import localesConfig from '@/i18n/locales.generated.json';

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
  | { type: 'post-archive'; postType: string }
  | { type: 'post-single'; postType: string; slug: string };

export async function detectRouteType(slug: string[]): Promise<RouteType> {
  console.log('Detecting route type for slug:', slug);

  const firstSegment = slug[0];  
  const isLocale = localesConfig.supportedLocales.includes(firstSegment);
  const slugWithoutLocale = isLocale ? slug.slice(1) : slug;

  // Case 1: Home page (e.g., / or /en)
  if (slugWithoutLocale.length === 0) {
    console.log('Route type: home page');
    return { type: 'page', path: '' };
  }

  const firstSlugSegment = slugWithoutLocale[0];
  const secondSlugSegment = slugWithoutLocale[1];

  // Case 2: Post Archive (e.g., /noticias or /en/news)
  if (slugWithoutLocale.length === 1 && CPT_SLUG_MAP[firstSlugSegment]) {
    const internalPostType = CPT_SLUG_MAP[firstSlugSegment];
    console.log(`Route type: post-archive for ${internalPostType} (from slug ${firstSlugSegment})`);
    return { type: 'post-archive', postType: internalPostType };
  }

  // Case 3: Post Single (e.g., /noticias/mi-noticia or /en/news/my-news)
  if (slugWithoutLocale.length === 2 && CPT_SLUG_MAP[firstSlugSegment]) {
    const internalPostType = CPT_SLUG_MAP[firstSlugSegment];
    const postSlug = secondSlugSegment;
    console.log(`Route type: post-single for ${internalPostType} (from slug ${firstSlugSegment}), post slug: ${postSlug}`);
    return { type: 'post-single', postType: internalPostType, slug: postSlug };
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

  if (routeType.type === 'post-single') {
    const post = await getContentBySlug<WpContent>(routeType.postType, routeType.slug);
    return generateSeoMetadata(post);
  } else if (routeType.type === 'post-archive') {
    return {
      title: `${routeType.postType.charAt(0).toUpperCase() + routeType.postType.slice(1)} Archive`,
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

  // Add locale-only routes (like /en for home page) - dynamic from WordPress
  localesConfig.supportedLocales.forEach(locale => {
    params.push({ slug: [locale] });
  });

  // Add pages
  const pages = await getAllContent<Page>("pages");
  if (pages) {
    pages.forEach((page) => {
      const pageSlugs = page.slug.split("/").filter(Boolean);
      // Add without locale prefix (default)
      params.push({ slug: pageSlugs });
      // Add with locale prefixes - dynamic
      localesConfig.supportedLocales.forEach(locale => {
        params.push({ slug: [locale, ...pageSlugs] });
      });
    });
  }

  // Add CPT archives and singles
  try {
    // Get all known CPTs from config (dynamic, no hardcoding individual CPTs)
    const customTypes = Object.values(CPT_SLUG_MAP).filter((cpt, index, self) => 
      self.indexOf(cpt) === index // Remove duplicates
    );

    for (const cpt of customTypes) {
      // Add archive pages - dynamic for all locales
      params.push({ slug: [cpt] });
      
      localesConfig.supportedLocales.forEach(locale => {
        const translatedSlug = getTranslatedCptSlug(cpt, locale);
        params.push({ slug: [locale, translatedSlug] });
      });

      try {
        // Get posts in all languages dynamically
        const allPosts: WpContent[] = [];
        
        for (const locale of localesConfig.supportedLocales) {
          const apiParams = locale === localesConfig.defaultLocale 
            ? '?per_page=10&_embed'
            : `?per_page=10&_embed&lang=${locale}`;
          const posts = await getAllContent<WpContent>(cpt, apiParams);
          if (posts) allPosts.push(...posts);
        }

        // Remove duplicates by ID
        const uniquePosts = allPosts.filter((post, index, self) =>
          index === self.findIndex(p => p.id === post.id)
        );

        if (uniquePosts.length > 0) {
          uniquePosts.forEach(post => {
            // Add single CPT pages in all locales
            params.push({ slug: [cpt, post.slug] });
            
            localesConfig.supportedLocales.forEach(locale => {
              const translatedSlug = getTranslatedCptSlug(cpt, locale);
              params.push({ slug: [locale, translatedSlug, post.slug] });
            });
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
  const locale = (params.slug.length > 0 && localesConfig.supportedLocales.includes(params.slug[0])) ? params.slug[0] : localesConfig.defaultLocale;
  console.log('Route type result:', routeType);

  // ROUTE 1: Post Archive (CPT Archive)
  if (routeType.type === 'post-archive') {
    // Use WPML REST API filtering for translated content
    const apiParams = locale === 'es'
      ? '?per_page=12&_embed&orderby=date&order=desc'
      : `?per_page=12&_embed&orderby=date&order=desc&lang=${locale}`;

    const posts = await getAllContent<WpContent>(routeType.postType, apiParams);

    return (
      <ContentArchive 
        posts={posts}
        postType={routeType.postType}
        locale={locale}
      />
    );
  }

  // ROUTE 2: Post Single (CPT Single)
  if (routeType.type === 'post-single') {
    const post = await getContentBySlug<WpContent>(routeType.postType, routeType.slug, locale);

    if (!post) {
      notFound();
    }

    return (
      <ContentSingle 
        post={post}
        postType={routeType.postType}
        locale={locale}
      />
    );
  }

  // ROUTE 3: Home Page (locale-only routes like /en)
  const firstSegment = params.slug[0];
  const isLocaleOnly = params.slug.length === 1 && localesConfig.supportedLocales.includes(firstSegment);

  if (isLocaleOnly) {
    const lang = firstSegment === 'es' ? undefined : firstSegment;
    const homePage = await getHomePage(lang);

    if (!homePage) {
      notFound();
    }

    return <ContentHome page={homePage} />;
  }

  // ROUTE 4: Static Pages
  let page = await getContentBySlug<Page>("pages", path, locale);

  // If page not found and we have a locale prefix, try to get the translated version
  if (!page && params.slug.length > 1 && localesConfig.supportedLocales.includes(params.slug[0])) {
    const lang = params.slug[0];
    const actualPath = params.slug.slice(1).join('/');

    if (lang !== 'es') {
      const translatedPage = await fetchAPI<Page>(`/wp/v2/pages?slug=${actualPath}&lang=${lang}&_embed`);
      if (translatedPage && Array.isArray(translatedPage) && translatedPage.length > 0) {
        page = translatedPage[0];
      }
    }
  }

  if (!page && params.slug.length > 1) {
    const lastSlug = params.slug[params.slug.length - 1];
    page = await getContentBySlug<Page>("pages", lastSlug);
  }

  if (!page) {
    notFound();
  }

  return <ContentPages page={page} />;
}
