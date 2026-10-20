import './globals.css';
import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'FLVXUS | Personal Trainer Management Platform',
  description: 'Complete solution for personal trainers to manage students, workouts, and evaluations',
  manifest: '/manifest.json',
  themeColor: '#10b981',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FLVXUS'
  },
  formatDetection: {
    telephone: false
  }
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
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}