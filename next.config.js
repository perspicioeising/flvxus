/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Worktree vive dentro do repo pai: fixa a raiz de tracing aqui para evitar o
  // conflito de multiplos lockfiles / plugin @next/next herdado do repo pai.
  outputFileTracingRoot: __dirname,
  images: {
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
};

module.exports = nextConfig;
