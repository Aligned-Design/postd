/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Mark server-only packages as external to prevent bundling issues
  experimental: {
    serverComponentsExternalPackages: ['cheerio', 'undici'],
  },
}

module.exports = nextConfig

