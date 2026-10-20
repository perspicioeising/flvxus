# Progresso — Flvxus v2

> Documento vivo. Atualizado ao longo do relançamento do Flvxus como produto.

## Contexto

Flvxus é uma plataforma para personal trainers (professores) gerenciarem alunos:
avaliação física, biblioteca de exercícios, montagem de treinos, geração de dietas
com IA (Anthropic), e área do aluno para acompanhar treinos/dieta/evolução.

Stack atual detectada: Next.js 14 (App Router) + Supabase + Radix/shadcn + Tailwind +
Capacitor (Android/iOS) + IA via Google Gemini (a migrar para Anthropic).

## Fases do relançamento

- [x] **Fase 0 — Auditoria** (`docs/audit.md`): mapear o que existe, incompleto, quebrado, dívida técnica. ✅ concluída.
- [x] **Fase 1 — Arquitetura v2** (`docs/architecture.md`, ADRs 0001–0008): stack, estrutura, padrões. ✅ aprovada e verificada.
- [x] **Fase 2 — Banco Supabase do zero** (`supabase/migrations/`, `docs/database.md`): schema, RLS, storage, seed, tipos TS. ✅ aprovada na revisão de segurança. (Aplicação via CLI pendente de Docker/projeto Supabase — ver pendências.)
- [ ] **Fase 3 — Design system + front-end**: tokens, componentes, dark/light, mobile-first, i18n pt-BR.
- [ ] **Fase 4 — Features professor**: alunos, avaliação física, exercícios, treinos.
- [ ] **Fase 5 — Features aluno**: área do aluno, execução de treino, dieta, evolução.
- [ ] **Fase 6 — IA Anthropic**: Edge Functions, prompts versionados, validação Zod, rate limit, logs.
- [ ] **Fase 7 — Qualidade**: testes de RLS e lógica crítica, lint, typecheck, README.
- [ ] **Fase 8 — Revisão final** (`docs/REVISAO-FINAL.md`): checklist de publicação.

## Andamento

### Em andamento
- Fase 3 — Design system e fundação do front-end (tokens, dark/light, mobile-first, i18n pt-BR,
  stack Next 15 + React 19 + @supabase/ssr, gate por papel nos layouts).

### Concluído
- Setup do repositório: resolvido erro de clone no Windows (arquivos `:Zone.Identifier`),
  `.gitignore` atualizado para ignorar artefatos "mark of the web" e worktrees.
- Fase 0 — Auditoria completa do código atual em `docs/audit.md`. Principais achados:
  banco inconsistente (migrations versionadas vs. 4 SQL manuais; `physical_assessments`
  com 2 esquemas conflitantes; sem seed), segurança frágil (buckets de Storage públicos
  sem policy, webhook WhatsApp sem assinatura, 1 rota de IA sem auth), IA Gemini sem
  Zod/rate-limit/log/anti-injection, zero testes, sem CI, deps inúteis (`i`, `npm`,
  `node-wav`), Next em canary, e rota quebrada `diets/[id]/routes.ts`.
- Consulta à documentação oficial da Anthropic (modelos vigentes jun/2026: Opus 5.5,
  Sonnet 5.5, Haiku 5.5, Fable 5.1) registrada em `docs/decisions/0001-ia-anthropic.md`.
- Fase 1 — Arquitetura v2 completa: `docs/architecture.md` (14 seções + diagrama ER Mermaid)
  e ADRs 0002–0008. Decisões-chave: Next 15 + React 19 + `@supabase/ssr`; rotas separadas por
  papel com gate server-side; RLS multi-tenant com contrato por tabela; enums nativos; storage
  privado com URLs assinadas; Edge Functions Anthropic com rascunho→aprovação; design system
  sobre shadcn/Radix; PWA + Capacitor; Vitest + harness de RLS + CI. Aprovada na revisão.
- Repositório migrado para a conta GitHub nova (`perspicioeising/flvxus`); identidade de
  commits e autenticação (`gh`) reconfiguradas. Commits antigos mantidos; novos vão para a conta nova.
- Fase 2 — Banco Supabase v2 do zero: removidas 21 SQLs legadas; 10 migrations versionadas;
  13 enums nativos; 23 tabelas de negócio com RLS (90 policies) isolando por tenant, aluno só
  vê o próprio e só treino/dieta liberados; 4 buckets privados com policies; seed pt-BR de
  exercícios; `types/database.types.ts` (à mão, regenerar via CLI); harness de RLS em
  `tests/rls/` (skip até Docker); `docs/database.md` com ER sincronizado. Aprovada na revisão
  de segurança (verifiquei contagens de forma independente: 23 RLS, 90 policies, 0 bucket público).

## Decisões tomadas

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-10-19 | IA migra de Google Gemini para API da Anthropic via Supabase Edge Functions | Requisito do produto; segredo só no servidor; validação de JWT/role. |
| 2026-10-19 | Migrations SQL legadas serão auditadas; banco v2 reescrito do zero versionado por timestamp | Migrations atuais têm nomes não-versionados (`avaliacao.sql`, `dieta.sql`) e dívida acumulada. |

## Pendências

- (a preencher conforme a auditoria revela itens)
