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

  // Security headers for production
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
