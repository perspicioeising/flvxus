/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Worktree vive dentro do repo pai: fixa a raiz de tracing aqui para evitar o
  // conflito de multiplos lockfiles / plugin @next/next herdado do repo pai.
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      // Vídeos/thumbnails de exercício sobem via Server Action. O padrão do
      // Next (1 MB) estoura com vídeo (erro 413 "Body exceeded 1 MB limit").
      // 50 MB cobre vídeos curtos de demonstração. Observação: upload direto
      // ao Storage (signed upload URL) seria o ideal para arquivos grandes —
      // ver docs/pendencias.md.
      bodySizeLimit: '100mb',
    },
  },
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
