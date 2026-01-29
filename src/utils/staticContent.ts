// Configuración estática para el build sin contenido de WordPress
export const STATIC_CONTENT = {
  posts: [
    {
      id: 1,
      title: {
        rendered: 'Bienvenido al Blog'
      },
      excerpt: {
        rendered: 'Este es un post de ejemplo para el feed XML y sitemap'
      },
      slug: 'bienvenido',
      date: new Date().toISOString(),
      _embedded: {
        author: [
          {
            name: 'Administrador'
          }
        ]
      }
    }
  ],
  pages: [
    {
      id: 1,
      title: {
        rendered: 'Inicio'
      },
      slug: 'inicio',
      date: new Date().toISOString()
    },
    {
      id: 2,
      title: {
        rendered: 'Blog'
      },
      slug: 'blog',
      date: new Date().toISOString()
    }
  ]
};

export const SITE_METADATA = {
  title: 'Next WP Kit',
  description: 'Un proyecto Next.js con WordPress'
};