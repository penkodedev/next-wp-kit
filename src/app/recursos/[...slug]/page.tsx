// src/app/recursos/[slug]/page.tsx
// Like a single.php page on a WP theme

import { getContentBySlug, getAllContent } from "@/api/wordpressApi";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import { generateSeoMetadata } from "@/utils/seo";
import type { WpContent } from "@/types/wordpressTypes";
import { processContent } from "@/utils/processContent";
import { WpPageId } from "@/utils/WpPageId";
import PostNav from "@/components/navigation/PostNav";
import { Icons } from "@/components/ui/Icons";
import Link from "next/link";
import AnimatedArticle from "@/components/animations/AnimatedArticle";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { getTranslatedCptSlug } from "@/utils/cptConfig";

type RecursoPageProps = {
  params: {
    slug: string[];  // Changed to array to support locale prefix
  };
};

/**
 * Genera los metadatos para la página de un recurso específico.
 */
export async function generateMetadata({
  params,
}: RecursoPageProps): Promise<Metadata> {
  // Detect locale and get post slug
  const locale = params.slug.length > 1 && ['es', 'en'].includes(params.slug[0]) 
    ? params.slug[0] 
    : 'es';
  const postSlug = params.slug[params.slug.length - 1];
  
  const recurso = await getContentBySlug<WpContent>("recursos", postSlug, locale);
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
  const params: { slug: string[] }[] = [];
  
  // Get recursos in both languages
  const spanishRecursos = await getAllContent<WpContent>("recursos", "?_fields=slug&per_page=100");
  const englishRecursos = await getAllContent<WpContent>("recursos", "?_fields=slug&per_page=100&lang=en");
  
  // Add Spanish routes (default, no prefix)
  if (spanishRecursos) {
    spanishRecursos.forEach((recurso) => {
      params.push({ slug: [recurso.slug] });
      params.push({ slug: ['es', recurso.slug] });
    });
  }
  
  // Add English routes (with /en prefix and translated archive slug 'resorts')
  if (englishRecursos) {
    englishRecursos.forEach((recurso) => {
      params.push({ slug: ['en', recurso.slug] });
    });
  }
  
  return params;
}

export default async function RecursoPage({ params }: RecursoPageProps) {
  // Detect locale from slug array (e.g., ['en', 'my-post'] or ['my-post'])
  const locale = params.slug.length > 1 && ['es', 'en'].includes(params.slug[0]) 
    ? params.slug[0] 
    : 'es';
  
  // Get the actual post slug (last element)
  const postSlug = params.slug[params.slug.length - 1];
  
  const recurso = await getContentBySlug<WpContent>("recursos", postSlug, locale);

  // Si no se encuentra el recurso, muestra la página 404 de Next.js
  if (!recurso) {
    notFound();
  }

  // Build dynamic "Back to Archive" URL
  const translatedCptSlug = getTranslatedCptSlug('recursos', locale);
  const backToArchiveUrl = locale === 'es' ? `/${translatedCptSlug}` : `/${locale}/${translatedCptSlug}`;
  const archiveName = translatedCptSlug.charAt(0).toUpperCase() + translatedCptSlug.slice(1);

/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  return (
    <div className="page-sidebar">
      {/* Este componente establece el ID de la página en el contexto para BodyClass */}
      <WpPageId id={recurso.id} />
      <main>
        <article className="entry-content">
          <Link href={backToArchiveUrl} className="back-to-archive-link">
            <Icons.ArrowLeft size={26} strokeWidth={1} className="arrow-left" />
            {archiveName}
          </Link>

          <section className="page-title">
            <h1>{recurso.title.rendered}</h1>

            <div className="icons-wrap">
              <Icons.Share2
                size={21}
                strokeWidth={1.5}
                className="icons-page-title icon-share"
              />
              <Icons.Heart
                size={21}
                strokeWidth={1.5}
                className="icons-page-title icon-heart"
              />
            </div>
          </section>
          <Breadcrumbs />
          {/* We process the content to fix potential issues like missing block wrappers */}
          <AnimatedArticle className="custom-article-class" amount={0.5}>
            <div
              dangerouslySetInnerHTML={{
                __html: processContent(recurso.content.rendered),
              }}
            />
          </AnimatedArticle>
        </article>
        <PostNav
          postId={recurso.id}
          postType="recursos"
          basePath={backToArchiveUrl}
          locale={locale}
        />
      </main>
        <Sidebar />
    </div>
  );
}
