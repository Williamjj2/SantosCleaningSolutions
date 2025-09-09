/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance Optimizations
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
    serverComponentsExternalPackages: []
  },
  
  // Compilers  
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // Images
  images: {
    domains: ['santoscsolutions.com', 'images.unsplash.com', 'ui-avatars.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // ISR for reviews
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8001/api/:path*'
        }
      ]
    };
  },

  // Compress
  compress: true,
  poweredByHeader: false,

  // Environment
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://santoscsolutions.com',
    NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8001'
  }
};

module.exports = nextConfig;