// src/app/page.tsx
// HOME PAGE

import { getHomePage, safeGetSiteInfo } from "@/api/wordpressApi";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import ContentHome from "@/components/layout/content/ContentHome";
import { generateSeoMetadata } from "@/utils/seo/seo";
import localesConfig from '@/i18n/locales.generated.json';

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

  return generateSeoMetadata(homePage, locale);
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
