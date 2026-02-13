// src/app/sitemap/page.tsx

import Link from "next/link";
import { getAllContent, fetchAPI, safeGetSiteInfo } from "@/api/wordpressApi";
import type { Post, Page } from "@/types/wordpressTypes";
import { getActiveCptSlugs, getTranslatedCptSlug } from "@/utils/config/cptConfig";
import localesConfig from "@/i18n/locales.generated.json";
import SearchForm from "@/components/forms/SearchForm";

interface SitemapItem {
  title: string;
  url: string;
  children: SitemapItem[];
}

interface SitemapSection {
  title: string;
  items: SitemapItem[];
}

function SitemapItemComponent({ item, level = 0 }: { item: SitemapItem; level?: number }) {
  return (
    <>
      <li className="sitemap-leaf" style={{ marginLeft: `${level * 20}px` }}>
        <Link href={item.url} className="sitemap-link">
          <span className="sitemap-title">{item.title}</span>
        </Link>
      </li>
      {item.children && item.children.length > 0 && (
        <ul className="sitemap-leaves">
          {item.children.map((child, index) => (
            <SitemapItemComponent key={index} item={child} level={level + 1} />
          ))}
        </ul>
      )}
    </>
  );
}

function buildPageHierarchy(pages: Page[], baseUrl: string) {
  const pageMap = new Map();
  const rootPages: any[] = [];

  // First pass: create all page objects
  pages.forEach(page => {
    const pageObj = {
      title: page.title.rendered,
      url: `${baseUrl}/${page.slug}`,
      slug: page.slug,
      children: []
    };
    pageMap.set(page.slug, pageObj);
  });

  // Second pass: build hierarchy using parent ID instead of slug parsing
  pages.forEach(page => {
    const pageObj = pageMap.get(page.slug);

    if (page.parent === 0) {
      // Root level page
      rootPages.push(pageObj);
    } else {
      // Child page - find parent by ID
      const parentPage = pages.find(p => p.id === page.parent);
      if (parentPage) {
        const parentObj = pageMap.get(parentPage.slug);
        if (parentObj) {
          parentObj.children.push(pageObj);
        } else {
          // Parent not found, treat as root
          rootPages.push(pageObj);
        }
      } else {
        // Parent not found, treat as root
        rootPages.push(pageObj);
      }
    }
  });

  return rootPages;
}

/**
 * Get active languages from WordPress WPML
 * Automatically detects all languages configured by the editor
 */
async function getActiveLocales(): Promise<string[]> {
  try {
    const response = await fetchAPI<any>('/custom/v1/languages');
    if (response?.languages && Array.isArray(response.languages)) {
      return response.languages.map((lang: any) => lang.code);
    }
    return localesConfig.supportedLocales; // Fallback to generated config
  } catch (error) {
    return localesConfig.supportedLocales; // Fallback to generated config
  }
}

/**
 * Build localized URL for any post type
 */
function getLocalizedUrl(baseUrl: string, postType: string, slug: string, locale: string): string {
  const translatedSlug = getTranslatedCptSlug(postType, locale);
  const localePrefix = locale === localesConfig.defaultLocale ? '' : `/${locale}`;
  return `${baseUrl}${localePrefix}/${translatedSlug}/${slug}`;
}

async function getSitemapData(currentLocale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
  
  const sections: SitemapSection[] = [];

  // Only show content for the current locale
  const locale = currentLocale;
  const localePrefix = locale === localesConfig.defaultLocale ? '' : `/${locale}`;
  const apiParams = locale === localesConfig.defaultLocale ? '' : `?lang=${locale}`;
  
  // === PAGES ===
  const pages = (await getAllContent<Page>("pages", apiParams)) || [];
  if (pages.length > 0) {
    const pageHierarchy = buildPageHierarchy(pages, baseUrl + localePrefix);
    sections.push({ 
      title: "Páginas", 
      items: pageHierarchy 
    });
  }

  // === POSTS ===
  const posts = (await getAllContent<Post>("posts", apiParams)) || [];
  if (posts.length > 0) {
    const postItems = posts.map((post: Post) => ({
      title: post.title.rendered,
      url: getLocalizedUrl(baseUrl, 'posts', post.slug, locale),
      children: []
    }));
    sections.push({ 
      title: "Posts", 
      items: postItems 
    });
  }

  // === CUSTOM POST TYPES ===
  for (const cptSlug of getActiveCptSlugs(['modales', 'hero'])) {
    const cptItems = (await getAllContent(cptSlug, apiParams)) || [];
    
    if (cptItems.length > 0) {
      const items = cptItems.map((item: any) => ({
        title: item.title.rendered,
        url: getLocalizedUrl(baseUrl, cptSlug, item.slug, locale),
        children: []
      }));

      const translatedSlug = getTranslatedCptSlug(cptSlug, locale);
      const sectionTitle = translatedSlug.charAt(0).toUpperCase() + translatedSlug.slice(1);
      sections.push({ 
        title: sectionTitle, 
        items 
      });
    }
  }

  return sections;
}

export default async function SitemapPage() {
  // Get default locale from WordPress
  const siteInfo = await safeGetSiteInfo();
  const currentLocale = siteInfo?.i18n?.default_locale || localesConfig.defaultLocale;
  const sections = await getSitemapData(currentLocale);


/**********************************************
      START BUILDING THE PAGE CONTENT
**********************************************/
  return (
    <div className="page-one-col sitemap-page">
      <section className="page-title">
        <h1>Mapa del Sitio</h1>
      </section>
      
      <article className="">

        {/* <p>Encuentra todas las páginas y contenidos de nuestro sitio web</p> */}

        <div className="sitemap-tree">
          {sections.map((section, index) => (
            <div key={index} className="sitemap-branch">
              <h3 className="sitemap-node--root">{section.title}</h3>
              <ul className="sitemap-leaves">
                {section.items.map((item, itemIndex) => (
                  <SitemapItemComponent key={itemIndex} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
<SearchForm />

      </article>
    </div>
  );
}
