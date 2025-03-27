/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  target: 'serverless',
  swcMinify: true,
  images: {
    domains: [],
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Fix npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
