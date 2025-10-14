const path = require('path');
const withNextIntl = require('next-intl/plugin')(
  './src/i18n/i18n.ts' // Apunta al archivo de configuración
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles/sass')],
  },

  // i18n: {
  //   locales: ['es', 'en', 'fr'], // Supported languages
  //   defaultLocale: 'es',       // Main language
  // },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        // Si tu WP local usa un puerto, añádelo aquí. Ej: port: '10003'
        // port: '', 
      },
      {
        protocol: 'http',
        hostname: 'penkode-headless.local',
      },
    ],
  },
  // Esta función actúa como un "proxy".
  // Le dice a Next.js: "Cuando alguien pida un archivo de /wp-content/..."
  // "...en realidad, búscalo en tu backend de WordPress y sírvelo".
  async rewrites() {
    return [
      {
        source: '/wp-content/:path*',
        destination: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL.replace('/wp-json', '')}/wp-content/:path*`,
      },
    ]
  },
};

module.exports = withNextIntl(nextConfig);
