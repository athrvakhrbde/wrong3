/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  target: 'serverless',
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
