import './globals.css';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Providers } from './providers';
import { cn } from '@/lib/utils';

// Inter self-hospedada (next/font/local) — build deterministico, sem fetch de
// rede ao Google Fonts (melhor LCP e aderencia a LGPD: nao expoe o IP do usuario
// a servidores do Google). Fontes versionadas em app/fonts/ sob SIL OFL 1.1
// (ver app/fonts/OFL.txt). Pesos usados pelo design system: 400/500/600/700.
const inter = localFont({
  src: [
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-sans',
});

// O Web App Manifest é emitido por app/manifest.ts (PWA — ADR 0009); o Next
// adiciona o <link rel="manifest"> automaticamente, por isso não há mais
// `manifest: '/manifest.json'` aqui.
export const metadata: Metadata = {
  title: 'Flvxus | Plataforma para personal trainers',
  description:
    'Gestão de alunos, avaliação física, treinos, dietas e evolução para personal trainers.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Flvxus',
  },
  formatDetection: {
    telephone: false,
  },
};

// themeColor e viewport vivem em `export const viewport` (Next 15); mantê-los em
// `metadata` é desaconselhado e gera warning de build.
export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-512x512.png" />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}