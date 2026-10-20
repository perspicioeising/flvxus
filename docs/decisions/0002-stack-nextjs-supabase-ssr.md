# ADR 0002 — Versão do Next.js e migração para @supabase/ssr

- **Status:** aceito
- **Data:** 2026-10-19
- **Relacionado:** `docs/architecture.md` §2; `docs/audit.md` §10

## Contexto

A v1 está com `next` e `eslint-config-next` em `^14.2.0-canary.29` — uma versão **canary**,
inadequada para produção. A autenticação usa `@supabase/auth-helpers-nextjs ^0.9.0`, pacote
**em descontinuação** e não recomendado para o App Router. O `package.json` carrega
dependências sem uso (`i`, `npm`, `node-wav`) e duas libs de IA do Google. O `tsconfig.json`
tem `target: es2015` com `downlevelIteration`, antiquado para Next 14+. O relançamento é a
oportunidade de corrigir a base de dependências de uma vez.

## Opções consideradas

### Framework
- **(A) Next 14 estável (14.2.x).** Mais conservador; mínima mudança nos 226 componentes.
- **(B) Next 15 estável + React 19.** Correções de longo prazo, defaults de cache mais
  previsíveis e seguros (sem cache agressivo por padrão), alinhado ao `@supabase/ssr`. O Next 15
  estável fixa **React 19** como peer dependency — não há combinação viável de Next 15 com
  React 18.3; o par é Next 15 + React 19. Os componentes shadcn/Radix têm versões compatíveis
  com React 19 (alguns pacotes Radix podem exigir bump de versão).

### Cliente Supabase
- **(C) Manter `@supabase/auth-helpers-nextjs`.** Descontinuado; dívida imediata.
- **(D) Migrar para `@supabase/ssr`.** Via recomendada para App Router; cobre RSC, Server
  Actions, Route Handlers e middleware com gestão de cookies unificada.

## Decisão

- **Next.js 15 estável** (opção B), App Router, **React 19** (`react@19`, `react-dom@19` e
  `@types` correspondentes) — exigido pelo peer range do Next 15.
- **Migrar para `@supabase/ssr`** (opção D), mantendo `@supabase/supabase-js` como base.
- **TypeScript:** elevar `target`/`lib` para **ES2022** (remove `downlevelIteration`), manter
  `strict: true` e `moduleResolution: bundler`.
- **Entra/sai do `package.json`** conforme `docs/architecture.md` §2.3 — sai Gemini,
  `i`/`npm`/`node-wav` e `auth-helpers`; entra `@supabase/ssr`, `@anthropic-ai/sdk` (só nas
  Edge Functions), Vitest + Testing Library, CLI do Supabase, PWA.
- **Scripts novos:** `typecheck`, `test`, `test:rls`, `db:types`, `db:reset`. Renomear o
  pacote de `fitconnect-pro` para `flvxus`.

## Justificativa

Sair da canary agora evita migrar de novo em poucos meses. O Next 15 torna o cache mais seguro
para dados por usuário (relevante num app multi-tenant com RLS). A migração para `@supabase/ssr`
é inevitável (o auth-helpers está morrendo) e é pré-requisito do modelo de camadas em §4 da
arquitetura. O custo real de mexer nos componentes reaproveitados vem da subida de React 18→19
exigida pelo Next 15: shadcn/Radix têm versões compatíveis com React 19, mas alguns pacotes
Radix podem exigir bump de versão — custo administrável, a ser confirmado na Fase 3.

## Consequências

- Refazer `next.config.js` (remover tensão `output: 'standalone'` × export estático; reativar
  minificação) — coordenado com o ADR 0007.
- Reescrever `middleware.ts` e criar `lib/supabase/{server,browser,middleware,admin}.ts`.
- Subir React 18→19 e os `@types` correspondentes; confirmar na Fase 3 os ranges de peer
  dependency dos pacotes Radix contra React 19, subindo versão onde o range não cobrir React 19.
- Risco baixo de ajustes pontuais em componentes por mudanças de API de cache do Next 15.
