// src/app/blog/[slug]/page.tsx
import { getContentBySlug, getAllContent } from '@/api/wordpressApi';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/utils/seo';
import type { Post } from '@/types/wordpressTypes';

type PostPageProps = {
  params: {
    slug: string;
  };
};

// 1. Generar Metadatos Dinámicos para SEO
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getContentBySlug<Post>('posts', params.slug).catch(() => null);
  return generateSeoMetadata(post);
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
  const post = await getContentBySlug<Post>('posts', params.slug);

  // Si el post no se encuentra (o la API falló), muestra la página 404.
  if (!post) {
    notFound();
  }

  return (
    <div className="container">
      <article className="post-content">
        <h1>{post.title.rendered}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
      </article>
    </div>
  );
}
