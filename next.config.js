/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations - standalone mode for Azure App Service
  output: 'standalone', // Required for Azure App Service deployment
  // If deploying to a subdirectory, uncomment and set basePath:
  // basePath: '/market-analysis',
  // assetPrefix: '/market-analysis',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig