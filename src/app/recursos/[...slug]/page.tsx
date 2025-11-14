// src/app/recursos/[...slug]/page.tsx
// Custom layout for recursos CPT (if needed different from default)

import { getContentBySlug, getAllContent } from "@/api/wordpressApi";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/utils/seo";
import type { WpContent } from "@/types/wordpressTypes";
import { getTranslatedCptSlug } from "@/utils/cptConfig";
import ContentSingle from '@/components/layout/content/ContentSingle';

type RecursoPageProps = {
  params: {
    slug: string[];  // Array to support locale prefix
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
   * USAR EL COMPONENTE ContentSingle
   * Si necesitas un layout diferente para recursos, 
   * crea un RecursosSingleCustom.tsx y úsalo aquí
   **********************************************/
  return (
    <ContentSingle 
      post={recurso}
      cpt="recursos"
      backToArchiveUrl={backToArchiveUrl}
      archiveName={archiveName}
      locale={locale}
    />
  );
}
