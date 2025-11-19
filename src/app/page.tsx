// src/app/page.tsx
// HOME PAGE

import { getHomePage } from "@/api/wordpressApi";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import ContentHome from "@/components/layout/content/ContentHome";

/**
 * Connects to WordPress to get the title and description.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = headers().get("x-locale") || "es";
  const homePage = await getHomePage(locale);

  if (!homePage) {
    return {
      title: "Page not found",
      description: "The home page content could not be loaded.",
    };
  }

  return {
    title: homePage.title.rendered,
    description: homePage.excerpt.rendered.replace(/<[^>]+>/g, ""),
  };
}

export default async function Home() {
  const locale = headers().get("x-locale") || "es";
  const homePage = await getHomePage(locale);

  if (!homePage) {
    notFound();
  }

  return <ContentHome page={homePage} />;
}
