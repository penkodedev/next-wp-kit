// src/app/page.tsx
// HOME PAGE

import { getHomePage } from '@/api/wordpressApi';
import { processContent } from '@/utils/processContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SliderRecursos from '@/components/ui/SliderRecursos';

/**
 * Connects to WordPress to get the title and description.
 */
export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getHomePage();

  if (!homePage) {
    return {
      title: 'Page not found',
      description: 'The home page content could not be loaded.',
    };
  }

  return {
    title: homePage.title.rendered,
    // Remove HTML tags from the excerpt
    description: homePage.excerpt.rendered.replace(/<[^>]+>/g, ''),
  };
}

export default async function Home() {
  const homePage = await getHomePage();

  if (!homePage) {
    notFound();
  }

  // Build the main page content
  return (
    <>
      <article className="entry-content container">
        {/* <h1 dangerouslySetInnerHTML={{ __html: processContent(homePage.title.rendered) }} /> */}
        <div dangerouslySetInnerHTML={{ __html: processContent(homePage.content.rendered) }} />
      </article>

      <section className="slider-container">
        <SliderRecursos />
      </section>
    </>
  );
}
