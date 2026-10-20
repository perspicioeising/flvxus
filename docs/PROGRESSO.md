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
- [x] **Fase 3 — Design system + front-end**: tokens, componentes, dark/light, mobile-first, i18n pt-BR. ✅ aprovada (convergência + revisão semântica). Stack migrada p/ Next 15 + React 19 + @supabase/ssr; gate server-side por papel; PWA manifest; .env.example.
- [x] **Fase 4 — Features professor**: alunos, avaliação física, exercícios, treinos. ✅ integrada na main (aprovada na revisão, 93 testes).
- [ ] **Fase 5 — Features aluno**: área do aluno, execução de treino, dieta, evolução.
- [ ] **Fase 6 — IA Anthropic**: Edge Functions, prompts versionados, validação Zod, rate limit, logs.
- [ ] **Fase 7 — Qualidade**: testes de RLS e lógica crítica, lint, typecheck, README.
- [ ] **Fase 8 — Revisão final** (`docs/REVISAO-FINAL.md`): checklist de publicação.

## Andamento

### Em andamento
- Fase 6 — IA Anthropic (Edge Functions) em paralelo: gerar dieta, sugerir treino, analisar
  avaliação; Zod, rate limit, log de uso, anti-injection, rascunho→aprovação.
- A seguir: Fase 5 (área do aluno), integração IA↔UI, Fase 7 (qualidade/CI/README), Fase 8 (revisão final).

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
- Fase 3 — Fundação do front-end: stack migrada para Next 15.5 + React 19 + `@supabase/ssr`
  (pacote renomeado para `flvxus`, deps mortas removidas, tsconfig ES2022); clientes Supabase
  server/browser/middleware/admin; design system (tokens light/dark emerald, tema, estados
  Loading/Empty/Error); route groups `(marketing)/(professor)/(aluno)` com gate server-side
  real por papel (fim do `userRole` hardcoded); navegação mobile-first (sidebar + bottom-nav);
  PWA manifest instalável; Capacitor em HTTPS; fonte Inter self-hospedada (build offline);
  `.env.example` sem segredos. typecheck/lint/build/test verdes. Aprovada na revisão semântica.
- Ajustes na integração da Fase 3: `.env.example` com `ANTHROPIC_MODEL=claude-sonnet-5-5`
  (corrigido do placeholder antigo, consistente com ADR 0001) + variáveis NEXT_PUBLIC_API_URL
  e WhatsApp; `.agents/` (metadados internos de workflow) removido do tracking e adicionado
  ao `.gitignore`.
- Fase 4 — Features do professor integrada na main (aprovada na revisão semântica): gestão de
  alunos (listagem/busca/convite via service_role §4.4/ficha 360), biblioteca de exercícios
  (CRUD + mídia privada assinada), avaliação física (cálculos no servidor testados — IMC, Siri,
  Pollock 3/7, Guedes, Durnin; formulário multi-etapa; histórico; gráficos recharts; fotos em
  bucket privado respeitando consentimento LGPD), montagem de treinos (modelos reutilizáveis +
  fichas por aluno, transição de status rascunho→liberado garantida por RLS, reordenação
  acessível) e painel real do professor (RSC sob RLS). 93 testes passando. ADR 0010 (limiar de
  avaliação vencida = 90 dias). Achado low não-bloqueante: termo de busca interpolado em `.or()`
  do PostgREST (contido pelo RLS) — tratar como robustez na Fase 7.

## Decisões tomadas

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-10-19 | IA migra de Google Gemini para API da Anthropic via Supabase Edge Functions | Requisito do produto; segredo só no servidor; validação de JWT/role. |
| 2026-10-19 | Migrations SQL legadas serão auditadas; banco v2 reescrito do zero versionado por timestamp | Migrations atuais têm nomes não-versionados (`avaliacao.sql`, `dieta.sql`) e dívida acumulada. |
| 2026-10-20 | Cortar/adiar da v2: gamificação, agenda, resumo semanal por IA, PWA offline e WhatsApp | Foco no caminho crítico (alunos → avaliação → treino → área do aluno → dieta com IA) para acelerar o relançamento. Detalhado em `docs/pendencias.md` → "Escopo adiado da v2". Retomar depois. |

## Pendências

- (a preencher conforme a auditoria revela itens)
