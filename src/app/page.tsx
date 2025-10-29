// src/app/page.tsx
// HOME PAGE

import { getHomePage } from "@/api/wordpressApi";
import { processContent } from "@/utils/processContent";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import SliderRecursos from "@/components/ui/SliderRecursos";
import HeroConfig from "@/components/ui/HeroConfig";

/**
 * Connects to WordPress to get the title and description.
 */
export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getHomePage();

  if (!homePage) {
    return {
      title: "Page not found",
      description: "The home page content could not be loaded.",
    };
  }

  return {
    title: homePage.title.rendered,
    // Remove HTML tags from the excerpt
    description: homePage.excerpt.rendered.replace(/<[^>]+>/g, ""),
  };
}

export default async function Home() {
  const homePage = await getHomePage();

  if (!homePage) {
    notFound();
  }


/**********************************************
      START BUILDING THE PAGE CONTENT
**********************************************/
  return (
    <>
      <HeroConfig />
      <div className="page-one-col">
        <article>
          {/* <h1 dangerouslySetInnerHTML={{ __html: processContent(homePage.title.rendered) }} /> */}
          <div
            dangerouslySetInnerHTML={{
              __html: processContent(homePage.content.rendered),
            }}
          />
        </article>
      </div>

      <section className="slider-container">
        <SliderRecursos />
      </section>
    </>
  );
}
