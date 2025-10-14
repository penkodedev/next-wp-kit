// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*', // Aplica a todos los robots
        allow: '/', // Permite rastrear todo el sitio
        disallow: '/wp-admin/', // Prohíbe el acceso a la carpeta de admin de WP
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`, // Indica la ubicación del sitemap
  };
}