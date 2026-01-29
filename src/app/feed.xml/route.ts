// src/app/feed.xml/route.ts
import RSS from 'rss';
import { STATIC_CONTENT } from '@/utils/staticContent';
import { SITE_METADATA } from '@/utils/staticContent';
import localesConfig from '@/i18n/locales.generated.json';

export async function GET() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // Lógica mejorada para obtener el título del sitio de forma segura
  let siteTitle = 'Blog';
  if (SITE_METADATA.title) {
    if (typeof SITE_METADATA.title === 'string') {
      siteTitle = SITE_METADATA.title;
    }
  }

  // 1. Configurar la información general del feed usando los metadatos del sitio
  const feedOptions = {
    title: siteTitle,
    description: SITE_METADATA.description || 'Últimas noticias y artículos',
    site_url: baseUrl,
    feed_url: `${baseUrl}/feed.xml`,
    language: localesConfig.defaultLocale,
    pubDate: new Date(),
  };

  const feed = new RSS(feedOptions);

  // 2. Obtener los posts de la configuración estática
  const allPosts = STATIC_CONTENT.posts;
  
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