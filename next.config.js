/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // This will ignore ESLint errors during build
  },
};

module.exports = nextConfig;
