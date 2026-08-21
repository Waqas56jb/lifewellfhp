import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  images: {
    // All imagery is served locally from /public — no remote patterns needed.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 200, 256, 320, 384],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },

  // Clean aliases -> canonical WordPress-era URLs. The original slugs are kept
  // as the real routes so existing search rankings and inbound links survive.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'lifewellfhp-client.vercel.app' }],
        destination: 'https://www.lifewellfhp.com/:path*',
        permanent: true,
      },
      { source: '/about', destination: '/bio', permanent: true },
      { source: '/contact', destination: '/contact-telehealth-mental-health-provider', permanent: true },
      { source: '/book', destination: '/book-telehealth-mental-health-appointment', permanent: true },
      { source: '/testimonials', destination: '/telehealth-mental-health-testimonials', permanent: true },
      { source: '/faq', destination: '/faqs', permanent: true },
      { source: '/services-overview', destination: '/our-services', permanent: true },

      // Retired WooCommerce surface (was an indexable soft-404 on the old site).
      { source: '/shop', destination: '/', permanent: true },
      { source: '/cart', destination: '/', permanent: true },
      { source: '/checkout', destination: '/', permanent: true },
      { source: '/my-account', destination: '/', permanent: true },

      // Empty taxonomy carried over from the WordPress install.
      { source: '/category/uncategorized', destination: '/blog', permanent: true },
    ];
  },
};

export default nextConfig;
