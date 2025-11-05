// src/app/[...slug]/page.tsx
// Intelligent catch-all route to handle pages and CPTs from WordPress.

import { getContentBySlug, getAllContent, getAllPostTypes, getHomePage } from "@/api/wordpressApi";
import { fetchAPI } from "@/api/wordpressApi";
import AnimatedArticle from "@/components/animations/AnimatedArticle";
import { generateSeoMetadata } from "@/utils/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Page, WpContent } from "@/types/wordpressTypes";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { ContactForm7Content } from "@/components/forms";
import { WpPageIdSetter } from "@/utils/WpPageIdContext";
import Sidebar from "@/components/layout/Sidebar";
import GridPosts from "@/components/layout/GridPosts";
import PostNav from "@/components/navigation/PostNav";
import { Icons } from "@/components/ui/Icons";
import Link from "next/link";
import { processContent } from "@/utils/processContent";
import { WpPageId } from "@/utils/WpPageId";

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

async function detectRouteType(slug: string[]): Promise<RouteType> {
   // Check if first segment is a locale (es, en)
   const firstSegment = slug[0];
   const isLocale = ['es', 'en'].includes(firstSegment);

   // If it's a locale, remove it from slug for processing
   const actualSlug = isLocale ? slug.slice(1) : slug;

   // If it's just a locale (like /en), treat as home page
   if (actualSlug.length === 0 && isLocale) {
     return { type: 'page', path: '' };
   }

   if (actualSlug.length === 1) {
     const singleSlug = actualSlug[0];
     try {
       const allTypes = await getAllPostTypes();
       const validCpts = allTypes?.filter(type =>
         !['post', 'page', 'attachment', 'nav_menu_item', 'wp_block'].includes(type)
       ) || [];

       if (validCpts.includes(singleSlug)) {
         return { type: 'cpt-archive', cpt: singleSlug };
       }
     } catch (error) {
       // Continue to page handling if API fails
     }
   } else if (actualSlug.length === 2) {
     const [cptSlug, postSlug] = actualSlug;
     try {
       const allTypes = await getAllPostTypes();
       const validCpts = allTypes?.filter(type =>
         !['post', 'page', 'attachment', 'nav_menu_item', 'wp_block'].includes(type)
       ) || [];

       if (validCpts.includes(cptSlug)) {
         return { type: 'cpt-single', cpt: cptSlug, slug: postSlug };
       }
     } catch (error) {
       // Continue to page handling if API fails
     }
   }

   return { type: 'page', path: actualSlug.join('/') };
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
    const allTypes = await getAllPostTypes();
    if (allTypes) {
      const customTypes = allTypes.filter(type =>
        !['post', 'page', 'attachment', 'nav_menu_item', 'wp_block'].includes(type)
      );

      for (const cpt of customTypes) {
        // Add archive pages
        params.push({ slug: [cpt] });
        params.push({ slug: ['es', cpt] });
        params.push({ slug: ['en', cpt] });

        try {
          const posts = await getAllContent<WpContent>(cpt, '?per_page=10&_embed');
          if (posts) {
            posts.forEach(post => {
              // Add single CPT pages
              params.push({ slug: [cpt, post.slug] });
              params.push({ slug: ['es', cpt, post.slug] });
              params.push({ slug: ['en', cpt, post.slug] });
            });
          }
        } catch (error) {
          // Skip CPTs that fail to load
        }
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

  if (routeType.type === 'cpt-archive') {

    const posts = await getAllContent<WpContent>(routeType.cpt, '?per_page=12&_embed&orderby=date&order=desc');


/**********************************************
      START BUILDING CPT ARCHIVE HTML
**********************************************/
    return (
      <div className="page-fullwidth">
        <section className="page-title">
          <h1>{routeType.cpt.charAt(0).toUpperCase() + routeType.cpt.slice(1)}</h1>
        </section>

        {posts && posts.length > 0 ? (
          <GridPosts
            posts={posts}
            basePath={`/${routeType.cpt}`}
          />
        ) : (
          <article>
            <p>No content found in this section.</p>
          </article>
        )}
      </div>
    );
  }

  if (routeType.type === 'cpt-single') {
    const post = await getContentBySlug<WpContent>(routeType.cpt, routeType.slug);

    if (!post) {
      notFound();
    }


/**********************************************
          START BUILDING CPT SINGLE HTML
**********************************************/
    return (
      <div className="page-sidebar">
        <WpPageId id={post.id} />
        <main>
          <article className="entry-content">
            <Link href={`/${routeType.cpt}`} className="back-to-archive-link">
              <Icons.ArrowLeft size={26} strokeWidth={1} className="arrow-left" />
              Back to {routeType.cpt.charAt(0).toUpperCase() + routeType.cpt.slice(1)}
            </Link>

            <section className="page-title">
              <h1>{post.title.rendered}</h1>

              <div className="icons-wrap">
                <Icons.Share2
                  size={21}
                  strokeWidth={1.5}
                  className="icons-page-title icon-share"
                />
                <Icons.Heart
                  size={21}
                  strokeWidth={1.5}
                  className="icons-page-title icon-heart"
                />
              </div>
            </section>
            <Breadcrumbs />
            <AnimatedArticle className="custom-article-class" amount={0.5}>
              <div
                dangerouslySetInnerHTML={{
                  __html: processContent(post.content.rendered),
                }}
              />
            </AnimatedArticle>
          </article>
          <PostNav
            postId={post.id}
            postType={routeType.cpt}
            basePath={`/${routeType.cpt}`}
          />
        </main>
        <Sidebar />
      </div>
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

  // For nested pages, try the full path first, then just the last segment
  let page = await getContentBySlug<Page>("pages", path);

  // If page not found and we have a locale prefix, try to get the translated version
  if (!page && params.slug.length > 1 && ['es', 'en'].includes(params.slug[0])) {
    const lang = params.slug[0];
    const actualPath = params.slug.slice(1).join('/');

    // Try to get the translated page using the new endpoint
    if (lang !== 'es') {
      const translatedPage = await fetchAPI<Page>(`/custom/v1/page-by-lang?lang=${lang}&page_slug=${actualPath}`);
      if (translatedPage) {
        page = translatedPage;
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
