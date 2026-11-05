---
inclusion: always
---

# Flvxus — arquitetura e convenções (steering)

Resumo acionável do app para qualquer trabalho de código. A fonte detalhada é
`docs/architecture.md` (plano e contratos) e os ADRs em `docs/decisions/`
(0001–0013). Quando este resumo e o código real divergirem, **o código real
vence** — confirme lendo antes de assumir.

## O que é

SaaS **multi-tenant** (um tenant por personal trainer) para gestão de alunos:
avaliação física, exercícios, treinos, dietas com IA, execução de treino,
evolução, hábitos (água/dieta/check-in) e gamificação ("Flvxus Arena").

Três perfis sobre o mesmo modelo:
- **Professor (personal):** `role='trainer'`, `account_type='professional'`. Gerencia alunos, monta treinos/dietas, avalia.
- **Aluno vinculado:** `role='student'`. Vê/executa o que o professor liberou; só os próprios dados.
- **Aluno autônomo:** `role='trainer'` + `is_tenant_master=true` + `account_type='self_managed'`. Tenant de 1 pessoa; cria o próprio treino/dieta (que **nascem liberados** para ele) e reusa as rotas `/aluno`. Helper: `isSelfManaged(user)` em `lib/auth`. É cidadão de primeira classe na Arena.

## Stack

Next.js 15 (App Router) + React 19 · Supabase (Postgres + RLS + Auth + Storage)
via `@supabase/ssr` · TypeScript strict (ES2022) · Tailwind + shadcn/Radix ·
Zod · Capacitor 7 (Android/iOS) + PWA · IA Anthropic **só** em Supabase Edge
Functions (Deno). Textos de UI em **pt-BR**; identificadores de código em inglês.

## Estrutura de pastas (onde cada coisa vive)

- `app/(marketing)/` pública · `app/(auth)/` login/register/set-password/callback
- `app/(professor)/` e `app/(aluno)/` — áreas por papel, cada uma com `layout.tsx` que faz o **gate server-side** de papel. Nunca misturar UI de papéis no mesmo grupo.
- `app/api/` — Route Handlers: só webhooks (`webhooks/`) e cron (`cron/`, protegido por `CRON_SECRET`).
- `actions/` — Server Actions por domínio (mutações de UI). Padrão de retorno `EstadoAcao`.
- `components/ui/` primitivos shadcn · `components/patterns/` composições · `components/professor/` e `components/aluno/` por área.
- `lib/` — `supabase/{server,browser,middleware,admin}.ts`, `auth/` (getSessionUser/requireRole/isSelfManaged), `arena/`, `habitos/`, `billing/`, cálculos puros.
- `schemas/` — Zod (entrada de forms + I/O de IA em `schemas/ia/`).
- `types/database.types.ts` — tipos do banco, **mantidos à mão** (não há Docker local para gerar via CLI; reflita fielmente as migrations).
- `supabase/migrations/` — SQL versionado por timestamp · `supabase/functions/` — Edge Functions de IA.
- `docs/` documentação · `tests/unit` e `tests/rls`.

## Camadas — qual é dona de cada operação

- **Leitura:** Server Component (RSC) com `createServerClient` (RLS ativo). Passa dados já filtrados como props.
- **Mutação de UI:** Server Action → valida Zod → grava com `createServerClient` (RLS ativo) → `revalidatePath`. Retorna `EstadoAcao { ok, message?, fieldErrors?, id? }`.
- **IA e segredo da Anthropic:** só Edge Function (valida JWT + papel). O Next **nunca** fala com a Anthropic direto.
- **`service_role` (ignora RLS):** exceção, só quando não há usuário cujo contexto resolveria (criação de aluno pelo professor, cron, webhooks, Edge). **Toda query com service_role filtra explicitamente por `tenant_id`**. Use `lib/supabase/admin.ts`.

## Segurança — invariantes inegociáveis

1. **RLS em toda tabela de negócio.** Isolamento de tenant via `tenant_id = app_tenant_id()`; papel via `app_role()` (ambas `SECURITY DEFINER`, lendo o `profiles` do `auth.uid()`). Zero acesso cruzado entre tenants.
2. **Aluno só vê o liberado** (`status='released'`). A RLS é a dona disso — um bug de UI não pode vazar rascunho.
3. **Escrita em tabelas sensíveis via função `SECURITY DEFINER`** (`search_path=''`, `revoke from public` + `grant execute to authenticated`), não por policy de INSERT/UPDATE direto quando a transição precisa ser validada num só lugar. Padrão usado na gamificação e no social.
4. **Nunca afrouxar RLS existente** para resolver uma leitura. Se precisa de dado cross-tenant (ex.: ranking global), exponha só colunas públicas via função `SECURITY DEFINER` dedicada.
5. Validar entrada externa com Zod; validar upload por magic bytes (não confiar em extensão/MIME).

## Gamificação "Arena" (motor de XP)

- Ledger **append-only** `gamification_events`; XP concedido só pela função `gamification_award` (`SECURITY DEFINER`), idempotente por `(user_id, event_type, reference_id)` com cap diário. **G3 e qualquer feature nova NÃO criam fonte de XP paralela** — só agregam o que o motor já validou.
- Fuso oficial de todas as fronteiras de dia: **America/Sao_Paulo**, via `gamification_sp_date` (SQL) e seu espelho `diaSP` em `lib/arena/datas.ts`. **Nunca** reconverter um `occurred_on` (que já é dia-SP cru `YYYY-MM-DD`) com `new Date()` — isso desloca o dia (bug já corrigido).
- Rankings: tenant (gate de 2 participantes), global mensal/anual (cross-tenant, só colunas públicas), amigos. Pódio top 3 ouro/prata/bronze via `lib/arena/podio.ts` e `components/aluno/arena/podio-top3.tsx` (compartilhado).

## Migrations (fluxo real do usuário)

- O usuário **aplica migrations à mão** no painel do Supabase (sem Docker local) e testa em **produção (Vercel)** a cada merge.
- Timestamps **estritamente crescentes e únicos** — colisão de timestamp já derrubou o app. Antes de criar, cheque o maior timestamp existente em `supabase/migrations/` e use um maior.
- Toda migration **idempotente** (`create ... if not exists`, `create or replace`, `on conflict do nothing`, `drop policy if exists`+`create policy`) e com **rollback pareado** (`_rollback.sql`).
- Storage (ex.: bucket `avatars`): bucket e policies são criados à mão no painel; o código só faz upload. Ver `docs/storage-avatars.md`.

## Verificação (comandos reais)

`npm run typecheck` · `npm run build` · `npm run test` (vitest) · `npm run test:rls`.
No Windows, o build às vezes falha com ENOENT em `.next/server/pages-manifest.json` ou `.next/types` — é flakiness de cache: limpar `.next` inteiro e rebuildar. Warnings pré-existentes de `react-hooks/exhaustive-deps` não são erro.

## Convenções de texto

- UI em **pt-BR**; código/identificadores em inglês; comentários em pt-BR.
- Para textos lidos pelo **aluno autônomo**, não pressupor que existe um "professor" (ele não tem). Ramificar por `isSelfManaged`.
