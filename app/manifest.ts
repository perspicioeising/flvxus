import type { MetadataRoute } from 'next';

/**
 * Web App Manifest (PWA — ADR 0009). Torna o app instalável nesta fase; o
 * service worker / cache offline fica como pendência (docs/pendencias.md).
 *
 * Cores derivadas dos tokens do design system (app/globals.css):
 * - theme_color: --primary claro (emerald, hsl 160 84% 39%) ≈ #10b981.
 * - background_color: --background claro (hsl 160 30% 99%) ≈ #fbfefc.
 *
 * Ícones: apenas 512×512 é versionado em public/; 192 só seria declarado se o
 * arquivo existisse.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flvxus',
    short_name: 'Flvxus',
    description:
      'Gestão de alunos, avaliação física, treinos, dietas e evolução para personal trainers.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'pt-BR',
    dir: 'ltr',
    background_color: '#fbfefc',
    theme_color: '#10b981',
    categories: ['fitness', 'health', 'sports'],
    icons: [
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
