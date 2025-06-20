// next.config.js - Atualizado para suportar export estático
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  output: 'standalone',
  images: {
    unoptimized: true, // Necessário para export estático
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname;
    return config;
  },
  // Adicionar configuração para trailingSlash
  trailingSlash: true,
  // Configurar base path se necessário
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
};

module.exports = nextConfig;