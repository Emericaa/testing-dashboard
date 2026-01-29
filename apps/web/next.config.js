/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vc/shared'],
  env: {
    N8N_EMBED_MODE: process.env.N8N_EMBED_MODE
  }
};

module.exports = nextConfig;
