# Progresso — Flvxus v2

> Documento vivo. Atualizado ao longo do relançamento do Flvxus como produto.

## Contexto

Flvxus é uma plataforma para personal trainers (professores) gerenciarem alunos:
avaliação física, biblioteca de exercícios, montagem de treinos, geração de dietas
com IA (Anthropic), e área do aluno para acompanhar treinos/dieta/evolução.

Stack atual detectada: Next.js 14 (App Router) + Supabase + Radix/shadcn + Tailwind +
Capacitor (Android/iOS) + IA via Google Gemini (a migrar para Anthropic).

## Fases do relançamento

- [ ] **Fase 0 — Auditoria** (`docs/audit.md`): mapear o que existe, incompleto, quebrado, dívida técnica.
- [ ] **Fase 1 — Arquitetura v2** (`docs/architecture.md`, `docs/decisions/`): decidir stack, estrutura, padrões.
- [ ] **Fase 2 — Banco Supabase do zero** (`supabase/migrations/`, `docs/database.md`): schema, RLS, storage, seed, tipos TS.
- [ ] **Fase 3 — Design system + front-end**: tokens, componentes, dark/light, mobile-first, i18n pt-BR.
- [ ] **Fase 4 — Features professor**: alunos, avaliação física, exercícios, treinos.
- [ ] **Fase 5 — Features aluno**: área do aluno, execução de treino, dieta, evolução.
- [ ] **Fase 6 — IA Anthropic**: Edge Functions, prompts versionados, validação Zod, rate limit, logs.
- [ ] **Fase 7 — Qualidade**: testes de RLS e lógica crítica, lint, typecheck, README.
- [ ] **Fase 8 — Revisão final** (`docs/REVISAO-FINAL.md`): checklist de publicação.

## Andamento

### Em andamento
- Fase 0 — Auditoria do código atual (delegada a workflow de investigação).

### Concluído
- Setup do repositório: resolvido erro de clone no Windows (arquivos `:Zone.Identifier`),
  `.gitignore` atualizado para ignorar artefatos "mark of the web" e worktrees.

## Decisões tomadas

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-10-19 | IA migra de Google Gemini para API da Anthropic via Supabase Edge Functions | Requisito do produto; segredo só no servidor; validação de JWT/role. |
| 2026-10-19 | Migrations SQL legadas serão auditadas; banco v2 reescrito do zero versionado por timestamp | Migrations atuais têm nomes não-versionados (`avaliacao.sql`, `dieta.sql`) e dívida acumulada. |

## Pendências

- (a preencher conforme a auditoria revela itens)
