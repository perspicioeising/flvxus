# ADR 0007 — Estratégia mobile/PWA e Capacitor

- **Status:** aceito
- **Data:** 2026-10-19
- **Relacionado:** `docs/architecture.md` §10; `docs/audit.md` §9; `capacitor.config.json`,
  `lib/api-config.ts`, `next.config.js`

## Contexto

A v1 configura Capacitor 7 (Android/iOS) apontando o WebView para `server.url =
https://flvxus.com.br` (**remote URL**), com `cleartext: true` (permite HTTP em claro). Não há
PWA (sem `manifest`, sem service worker). O `next.config.js` tem `output: 'standalone'`,
`images.unoptimized` e comentários de "export estático" em tensão — configuração confusa
herdada da tentativa de empacotar o app. A visão v2 pede experiência mobile para uso durante o
treino e possível modo offline/PWA.

## Opções consideradas

- **(A) Manter remote URL cru.** Simples, mas sem offline, sem instalação PWA e com cleartext
  inseguro.
- **(B) Export estático empacotado no app.** Incompatível com a arquitetura v2, que usa Server
  Components/Actions e Edge Functions — o app **não** é estático.
- **(C) PWA + Capacitor apontando para o app hospedado com HTTPS.** Entrega offline do shell e
  instalação no navegador; o Capacitor reaproveita o mesmo app para as lojas.

## Decisão

- **Opção C.** A v2 é um **PWA** (`app/manifest.ts` + service worker com cache de app shell e
  assets) e o **Capacitor empacota esse mesmo app**, apontando para a URL hospedada com
  **HTTPS obrigatório** (`cleartext: false`).
- **Refazer `next.config.js`:** remover a tensão `output: 'standalone'` × export estático e
  reativar a minificação (`swcMinify` deixa de ser `false`).
- **Plugins nativos** (Haptics, StatusBar, Share, Network, Preferences, Keyboard,
  SplashScreen) usados só quando `Capacitor.isNativePlatform()`.
- **PWA:** escolher entre `next-pwa` e configuração manual de service worker na Fase 3; a
  decisão default é `next-pwa` por reduzir boilerplate, com fallback manual se houver atrito
  com Next 15.

## Justificativa

O app depende de renderização dinâmica e Edge Functions, então export estático está descartado.
O remote URL cru não dá offline nem segurança. PWA + Capacitor sobre o mesmo app hospedado
entrega instalação, cache offline do shell e distribuição nas lojas com um único código,
corrigindo o `cleartext` inseguro.

## Consequências

- Definir o escopo de cache do service worker (app shell/assets; dados sensíveis **não** são
  cacheados offline por padrão, por LGPD).
- Revisar `capacitor.config` para HTTPS e `lib/api-config.ts` para a nova URL/hospedagem.
- A escolha final `next-pwa` vs. manual é confirmada na Fase 3 conforme compatibilidade.
