// src/app/page.tsx
// HOME PAGE

import { getHomePage } from '@/api/wordpressApi';
import { processContent } from '@/utils/processContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SliderRecursos from '@/components/ui/SliderRecursos';
import Hero from '@/components/ui/Hero';

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
      <Hero
        slides={[
          {
            title: "Bienvenido a Next WP Kit",
            subtitle: "Un kit moderno para integrar Next.js con WordPress headless",
            buttonText: "Explorar Recursos",
            buttonLink: "/recursos"
          },
          {
            title: "Animaciones Suaves",
            subtitle: "Componentes de animación reutilizables con Framer Motion",
            buttonText: "Ver Animaciones",
            buttonLink: "/animaciones"
          },
          {
            title: "WordPress Headless",
            subtitle: "Integra fácilmente tu contenido de WordPress con Next.js",
            buttonText: "Más Info",
            buttonLink: "/acerca"
          }
        ]}
        autoPlay={true}
        autoPlayInterval={6000}
      />

      <article className="container">
        {/* <h1 dangerouslySetInnerHTML={{ __html: processContent(homePage.title.rendered) }} /> */}
        <div dangerouslySetInnerHTML={{ __html: processContent(homePage.content.rendered) }} />
      </article>

      <section className="slider-container">
        <SliderRecursos />
      </section>
    </>
  );
}
