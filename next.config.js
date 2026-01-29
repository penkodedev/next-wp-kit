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
    remotePatterns: (() => {
      const patterns = [];
      const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

      if (apiUrl) {
        try {
          const url = new URL(apiUrl);
          patterns.push({
            protocol: url.protocol.replace(':', ''),
            hostname: url.hostname,
            port: url.port || undefined,
          });
        } catch (e) {
          console.warn('Invalid NEXT_PUBLIC_WORDPRESS_API_URL for images remotePatterns');
        }
      }

      // Additional local hostnames if needed
      if (process.env.NODE_ENV === 'development') {
        patterns.push({
          protocol: 'http',
          hostname: 'localhost',
        });
      }

      return patterns;
    })(),
  },
  // Esta función actúa como un "proxy".
  // Le dice a Next.js: "Cuando alguien pida un archivo de /wp-content/..."
  // "...en realidad, búscalo en tu backend de WordPress y sírvelo".
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_WORDPRESS_API_URL not configured, skipping rewrites');
      return [];
    }

    return [
      {
        source: '/wp-content/:path*',
        destination: `${apiUrl.replace('/wp-json', '')}/wp-content/:path*`,
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
