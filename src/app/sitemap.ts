// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPosts, getAllPages } from '@/api/wordpressApi';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Obtiene la URL base de las variables de entorno
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // 1. Obtener todas las URLs de los posts del blog
  const posts = (await getAllPosts()) || [];
  const postUrls = posts.map((post) => {
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
    };
  });

  // 2. Obtener todas las URLs de las páginas
  const pages = (await getAllPages()) || [];
  const pageUrls = pages.map((page) => {
    return {
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.date),
    };
  });

  // 3. Añadir las rutas estáticas (como la home y el índice del blog)
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
  ];

  // 4. Combinar todas las URLs y devolverlas
  return [...staticUrls, ...postUrls, ...pageUrls];
}