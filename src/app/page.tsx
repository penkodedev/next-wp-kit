// src/app/page.tsx
// HOME PAGE

import { getContentBySlug } from '@/api/wordpressApi';
import { processContent } from '@/utils/processContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SliderRecursos from '@/components/ui/SliderRecursos';


/**
 * Genera los metadatos para la página de inicio.
 * Ahora se conecta a WordPress para obtener el título y la descripción.
 */
export async function generateMetadata(): Promise<Metadata> {
  // Asumimos que la página de inicio tiene el slug 'inicio'
  const homePage = await getContentBySlug('pages', 'inicio');

  if (!homePage) {
    return {
      title: 'Página no encontrada',
      description: 'El contenido de la página de inicio no pudo ser cargado.',
    };
  }

  return {
    title: homePage.title.rendered,
    description: homePage.excerpt.rendered.replace(/<[^>]+>/g, ''), // Limpiamos el HTML del extracto
  };
}

export default async function Home() {
  // Obtenemos el contenido de la página con el slug 'inicio' desde WordPress
  const homePage = await getContentBySlug('pages', 'inicio');

  // Si la página no se encuentra, mostramos un error 404 de Next.js
  if (!homePage) {
    notFound();
  }

/**********************************************
    START BUILDING THE PAGE CONTENT HTML
**********************************************/
  // Ejemplo de cómo podrías añadir el slider a la home
  return (
    <>
      <article className="entry-content container">
        <h1 dangerouslySetInnerHTML={{ __html: processContent(homePage.title.rendered) }} />
        <div dangerouslySetInnerHTML={{ __html: processContent(homePage.content.rendered) }} />
      </article>

      <section className="slider-container">
        <SliderRecursos />
      </section>
    </>
  );
}
