// src/app/sitemap/page.tsx

import Link from "next/link";
import { getAllContent } from "@/api/wordpressApi";
import type { Post, Page } from "@/types/wordpressTypes";

interface SitemapSection {
  title: string;
  items: Array<{
    title: string;
    url: string;
    date?: string;
  }>;
}

async function getSitemapData() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  // Get all pages
  const pages = (await getAllContent<Page>("pages")) || [];
  const pageItems = pages.map((page: Page) => ({
    title: page.title.rendered,
    url: `${baseUrl}/${page.slug}`,
    date: page.date,
  }));

  // Get all blog posts
  const posts = (await getAllContent<Post>("posts")) || [];
  const postItems = posts.map((post: Post) => ({
    title: post.title.rendered,
    url: `${baseUrl}/blog/${post.slug}`,
    date: post.date,
  }));

  // Get recursos (custom post type)
  const recursos = (await getAllContent("recursos")) || [];
  const recursoItems = recursos.map((recurso: any) => ({
    title: recurso.title.rendered,
    url: `${baseUrl}/recursos/${recurso.slug}`,
    date: recurso.date,
  }));

  // Static pages
  const staticItems = [
    { title: "Home", url: baseUrl },
    { title: "Blog", url: `${baseUrl}/blog` },
    { title: "Recursos", url: `${baseUrl}/recursos` },
    { title: "Buscar", url: `${baseUrl}/search` },
  ];

  const sections: SitemapSection[] = [
    { title: "Páginas Principales", items: staticItems },
    { title: "Páginas", items: pageItems },
    ...(postItems.length > 0 ? [{ title: "Posts", items: postItems }] : []),
    ...(recursoItems.length > 0
      ? [{ title: "Recursos", items: recursoItems }]
      : []),
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
                  <li key={itemIndex} className="sitemap-leaf">
                    <Link href={item.url} className="sitemap-link">
                      <span className="sitemap-title">{item.title}</span>
                      {item.date && (
                        <span className="sitemap-date">
                          {new Date(item.date).toLocaleDateString("es-ES")}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
