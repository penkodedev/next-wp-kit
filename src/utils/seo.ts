// src/utils/seo.ts
import type { Metadata } from 'next';
import type { Post, Page } from '@/types/wordpressTypes';

/**
 * Genera metadatos para una página o post, priorizando los datos de Yoast SEO.
 * @param {Post | Page | null} content - El objeto del post o página de WordPress.
 * @returns {Metadata} El objeto de metadatos para Next.js.
 */
export function generateSeoMetadata(content: Post | Page | null): Metadata {
  if (!content) {
    return {};
  }

  // Lógica para SEO: Priorizar los datos de Yoast si existen
  if (content.yoast_head_json) {
    return {
      title: content.yoast_head_json.title,
      description: content.yoast_head_json.description,
      openGraph: {
        title: content.yoast_head_json.og_title,
        description: content.yoast_head_json.og_description,
        url: content.yoast_head_json.og_url,
        images: content.yoast_head_json.og_image?.map(img => ({ url: img.url })),
      },
    };
  }

  // Fallback: si no hay datos de Yoast, usar los datos básicos del contenido
  return {
    title: content.title.rendered,
    description: content.excerpt.rendered.replace(/<[^>]+>/g, ''),
  };
}