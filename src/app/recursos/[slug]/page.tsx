// src/app/recursos/[slug]/page.tsx

import { getContentBySlug, getAllContent } from '@/api/wordpressApi';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import { generateSeoMetadata } from '@/utils/seo';
import type { Recurso } from '@/types/wordpressTypes';
import { WpPageId } from '@/utils/WpPageId';
import PostNav from '@/components/navigation/PostNav';

type RecursoPageProps = {
  params: {
    slug: string;
  };
};

/**
 * Genera los metadatos para la página de un recurso específico.
 */
export async function generateMetadata({ params }: RecursoPageProps): Promise<Metadata> {
  const recurso = await getContentBySlug<Recurso>('recursos', params.slug);
  if (!recurso) {
    return {};
  }
  return generateSeoMetadata(recurso);
}

/**
 * Genera las rutas estáticas para cada recurso en tiempo de compilación.
 * Esto mejora el rendimiento y el SEO al pre-renderizar las páginas.
 */
export async function generateStaticParams() {
  // Usamos la función genérica y optimizamos pidiendo solo los slugs
  const allRecursos = await getAllContent<Recurso>('recursos', '?_fields=slug');
  if (!allRecursos) {
    return [];
  }
  return allRecursos.map((recurso) => ({
    slug: recurso.slug,
  }));
}

export default async function RecursoPage({ params }: RecursoPageProps) {
  const recurso = await getContentBySlug<Recurso>('recursos', params.slug);

  // Si no se encuentra el recurso, muestra la página 404 de Next.js
  if (!recurso) {
    notFound();
  }



/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
    return (
        <>
            {/* Este componente establece el ID de la página en el contexto para BodyClass */}
            <WpPageId id={recurso.id} />
            <div className="container with-sidebar">
                <main className="main-content">
                    <article className="entry-content">
                        <h1>{recurso.title.rendered}</h1>
                        <div dangerouslySetInnerHTML={{ __html: recurso.content.rendered }} />
                    </article>
                </main>
                <Sidebar />
            </div>
            <PostNav postId={recurso.id} postType={recurso.type} />
        </>
    );
}