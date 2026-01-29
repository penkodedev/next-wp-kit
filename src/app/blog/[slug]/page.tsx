// src/app/blog/[slug]/page.tsx

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { generateSeoMetadata } from '@/utils/seo/seo';
import { getContentBySlug, getAllContent } from '@/api/wordpressApi';
import type { Post } from '@/types/wordpressTypes';
import ContentSingle from '@/components/layout/content/ContentSingle';
import localesConfig from '@/i18n/locales.generated.json';

type PostPageProps = {
  params: {
    slug: string;
  };
};

// 1. Generar Metadatos Dinámicos para SEO
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const headersList = headers();
  const locale = (headersList.get('x-locale') || localesConfig.defaultLocale) as string;
  const post = await getContentBySlug<Post>('posts', params.slug).catch(() => null);
  return generateSeoMetadata(post, locale);
}

// 2. Generar Rutas Estáticas en el momento de la compilación
export async function generateStaticParams() {
  const posts = await getAllContent<Post>('posts', '?_fields=slug');
  if (!posts) {
    return [];
  }
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 3. El componente de la página
export default async function PostPage({ params }: PostPageProps) {
  // Get current locale from middleware header
  const headersList = headers();
  const locale = (headersList.get('x-locale') || localesConfig.defaultLocale) as string;

  const post = await getContentBySlug<Post>('posts', params.slug);

  // Si el post no se encuentra (o la API falló), muestra la página 404.
  if (!post) {
    notFound();
  }

  return (
    <ContentSingle 
      post={post}
      postType="posts"
      locale={locale}
    />
  );
}
