// src/app/recursos/[...slug]/page.tsx
// Custom layout for recursos CPT (if needed different from default)

import { getContentBySlug, getAllContent } from "@/api/wordpressApi";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/utils/seo";
import type { WpContent } from "@/types/wordpressTypes";
import ContentSingle from '@/components/layout/content/ContentSingle';
import localesConfig from '@/i18n/locales.generated.json';

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
  const locale = params.slug.length > 1 && localesConfig.supportedLocales.includes(params.slug[0]) 
    ? params.slug[0] 
    : localesConfig.defaultLocale;
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
  
  // Get recursos in all languages dynamically
  for (const locale of localesConfig.supportedLocales) {
    const apiParams = locale === localesConfig.defaultLocale
      ? "?_fields=slug&per_page=100"
      : `?_fields=slug&per_page=100&lang=${locale}`;
    
    const recursos = await getAllContent<WpContent>("recursos", apiParams);
    
    if (recursos) {
      recursos.forEach((recurso) => {
        // Add with locale prefix
        params.push({ slug: [locale, recurso.slug] });
        
        // Add without prefix for default locale
        if (locale === localesConfig.defaultLocale) {
          params.push({ slug: [recurso.slug] });
        }
      });
    }
  }
  
  return params;
}

export default async function RecursoPage({ params }: RecursoPageProps) {
  // Detect locale from slug array (e.g., ['en', 'my-post'] or ['my-post'])
  const locale = params.slug.length > 1 && localesConfig.supportedLocales.includes(params.slug[0]) 
    ? params.slug[0] 
    : localesConfig.defaultLocale;
  
  // Get the actual post slug (last element)
  const postSlug = params.slug[params.slug.length - 1];
  
  const recurso = await getContentBySlug<WpContent>("recursos", postSlug, locale);

  // Si no se encuentra el recurso, muestra la página 404 de Next.js
  if (!recurso) {
    notFound();
  }

  /**********************************************
   * USAR EL COMPONENTE ContentSingle
   * Los cálculos internos se hacen en el componente
   **********************************************/
  return (
    <ContentSingle 
      post={recurso}
      postType="recursos"
      locale={locale}
    />
  );
}
