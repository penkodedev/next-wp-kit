// src/app/sitemap/page.tsx

import Link from "next/link";
import { getAllContent } from "@/api/wordpressApi";
import type { Post, Page } from "@/types/wordpressTypes";
import { getActiveCptSlugs } from "@/utils/cptConfig";

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

async function getSitemapData() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  // Get all pages and build hierarchy
  const pages = (await getAllContent<Page>("pages")) || [];
  const pageHierarchy = buildPageHierarchy(pages, baseUrl);

  // Get all blog posts
  const posts = (await getAllContent<Post>("posts")) || [];
  const postItems = posts.map((post: Post) => ({
    title: post.title.rendered,
    url: `${baseUrl}/blog/${post.slug}`,
    children: []
  }));

  // Get all active CPTs dynamically
  const cptSections: SitemapSection[] = [];
  for (const cptSlug of getActiveCptSlugs()) {
    const cptItems = (await getAllContent(cptSlug)) || [];
    const items = cptItems.map((item: any) => ({
      title: item.title.rendered,
      url: `${baseUrl}/${cptSlug}/${item.slug}`,
      children: []
    }));

    if (items.length > 0) {
      // Capitalize first letter for section title
      const sectionTitle = cptSlug.charAt(0).toUpperCase() + cptSlug.slice(1);
      cptSections.push({ title: sectionTitle, items });
    }
  }

  const sections: SitemapSection[] = [
    { title: "Páginas", items: pageHierarchy },
    ...(postItems.length > 0 ? [{ title: "Posts", items: postItems }] : []),
    ...cptSections,
  ];

  return sections;
}

export default async function SitemapPage() {
  const sections = await getSitemapData();


/**********************************************
      START BUILDING THE PAGE CONTENT
**********************************************/
  return (
    <div className="page-one-col sitemap-page">
      <section className="page-title">
        <h1>Mapa del Sitio</h1>
      </section>
      
      <article className="page-content">

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
      </article>
    </div>
  );
}
