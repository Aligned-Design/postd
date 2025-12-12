/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Exclude server-only packages from client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle cheerio and its dependencies on the client
      config.resolve.alias = {
        ...config.resolve.alias,
        'cheerio': false,
        'undici': false,
      }
    }
    return config
  },
}

module.exports = nextConfig

