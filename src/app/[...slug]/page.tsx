// src/app/[...slug]/page.tsx
// Intelligent catch-all route to handle pages and CPTs from WordPress.

import { getContentBySlug, getAllContent, getAllPostTypes } from "@/api/wordpressApi";
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
  if (slug.length === 1) {
    const singleSlug = slug[0];
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
  } else if (slug.length === 2) {
    const [cptSlug, postSlug] = slug;
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

  return { type: 'page', path: slug.join('/') };
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

  // Add pages
  const pages = await getAllContent<Page>("pages");
  if (pages) {
    params.push(...pages.map((page) => ({
      slug: page.slug.split("/").filter(Boolean),
    })));
  }

  // Add CPT archives and singles
  try {
    const allTypes = await getAllPostTypes();
    if (allTypes) {
      const customTypes = allTypes.filter(type =>
        !['post', 'page', 'attachment', 'nav_menu_item', 'wp_block'].includes(type)
      );

      for (const cpt of customTypes) {
        params.push({ slug: [cpt] });

        try {
          const posts = await getAllContent<WpContent>(cpt, '?per_page=10&_embed');
          if (posts) {
            posts.forEach(post => {
              params.push({ slug: [cpt, post.slug] });
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

  // Default: Render Page
  // For nested pages, try the full path first, then just the last segment
  let page = await getContentBySlug<Page>("pages", path);

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
