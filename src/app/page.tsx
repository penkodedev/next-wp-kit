// src/app/page.tsx
// HOME PAGE

import { getHomePage, safeGetSiteInfo } from "@/api/wordpressApi";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import ContentHome from "@/components/layout/content/ContentHome";
import localesConfig from '@/i18n/locales.generated.json';


/**
 * Connects to WordPress to get the title and description.
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await safeGetSiteInfo();
  const defaultLocale = siteInfo?.i18n?.default_locale || localesConfig.defaultLocale;
  const locale = headers().get("x-locale") || defaultLocale;
  const homePage = await getHomePage(locale);

  if (!homePage) {
    return {
      title: "Page not found",
      description: "The home page content could not be loaded.",
    };
  }

  // Use Yoast SEO if available
  if (homePage.yoast_head_json) {
    const yoast = homePage.yoast_head_json;
    return {
      title: yoast.title,
      description: yoast.description,
      openGraph: {
        title: yoast.og_title,
        description: yoast.og_description,
        url: yoast.og_url,
        siteName: yoast.og_site_name,
        type: yoast.og_type as 'website' | 'article',
        images: yoast.og_image?.map(img => ({
          url: img.url,
          width: img.width,
          height: img.height,
        })),
      },
    };
  }

  // Fallback to WordPress title and excerpt
  return {
    title: homePage.title.rendered,
    description: homePage.excerpt.rendered.replace(/<[^>]+>/g, ""),
  };
}

export default async function Home() {
  const siteInfo = await safeGetSiteInfo();
  const defaultLocale = siteInfo?.i18n?.default_locale || localesConfig.defaultLocale;
  const locale = headers().get("x-locale") || defaultLocale;
  const homePage = await getHomePage(locale);

  if (!homePage) {
    notFound();
  }

  return <ContentHome page={homePage} lang={locale} />;
}
