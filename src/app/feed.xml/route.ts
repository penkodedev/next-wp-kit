// src/app/feed.xml/route.ts
import RSS from 'rss';
import { getAllPosts } from '@/api/wordpressApi';
import { metadata as siteMetadata } from '@/app/layout'; // Importamos los metadatos base

export async function GET() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // Lógica mejorada para obtener el título del sitio de forma segura
  let siteTitle = 'Blog';
  if (siteMetadata.title) {
    if (typeof siteMetadata.title === 'string') {
      siteTitle = siteMetadata.title;
    } else if ('default' in siteMetadata.title) {
      siteTitle = siteMetadata.title.default;
    } else if ('absolute' in siteMetadata.title) {
      siteTitle = siteMetadata.title.absolute;
    }
  }

  // 1. Configurar la información general del feed usando los metadatos del sitio
  const feedOptions = {
    title: siteTitle,
    description: siteMetadata.description || 'Últimas noticias y artículos',
    site_url: baseUrl,
    feed_url: `${baseUrl}/feed.xml`,
    language: 'es', // TODO: Hacer dinámico si se implementa i18n
    pubDate: new Date(),
  };

  const feed = new RSS(feedOptions);

  // 2. Obtener los posts de WordPress
  const allPosts = await getAllPosts();
  
  // 3. Añadir cada post como un item en el feed
  if (allPosts) {
    allPosts.forEach((post) => {
      feed.item({
        title: post.title.rendered,
        description: post.excerpt.rendered,
        url: `${baseUrl}/blog/${post.slug}`,
        guid: post.id.toString(),
        date: post.date,
        author: post._embedded?.author[0]?.name || 'Autor Desconocido',
      });
    });
  }

  // 4. Generar el XML y servirlo con la cabecera correcta
  const xml = feed.xml({ indent: true });

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}