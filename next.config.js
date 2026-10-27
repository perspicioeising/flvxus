/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Worktree vive dentro do repo pai: fixa a raiz de tracing aqui para evitar o
  // conflito de multiplos lockfiles / plugin @next/next herdado do repo pai.
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      // O vídeo/thumbnail de exercício NÃO passa mais pela Server Action: sobe
      // DIRETO ao Supabase Storage via signed upload URL (ver
      // actions/exercicios.ts → criarUploadUrlMidiaExercicio e
      // components/professor/exercicios/exercise-media-upload.tsx). Com isso o
      // teto do vídeo (50 MB) depende do `file_size_limit` do bucket no Supabase,
      // não deste limite. O `bodySizeLimit` cobre só os demais FormData pequenos
      // das Server Actions, então um valor modesto basta.
      bodySizeLimit: '4mb',
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
