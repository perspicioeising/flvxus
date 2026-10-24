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
- [x] **Fase 5 — Features aluno**: área do aluno, execução de treino, dieta, evolução. ✅ integrada na main (aprovada na revisão semântica, 182 testes). CAMINHO CRÍTICO COMPLETO.
- [x] **Fase 6 — IA Anthropic**: Edge Functions, prompts versionados, validação Zod, rate limit, logs. ✅ integrada (aprovada; deploy depende de ANTHROPIC_API_KEY + CLI).
- [x] **Fase extra — Execução/Gamificação/IA↔UI**: ✅ integrada na main (`b42b1fa`). Execução
  de treino do aluno corrigida (seletor de dia + vídeo + detalhes), avaliação física corrigida
  (bug do decimal com vírgula), gamificação (conquistas/pontos ao finalizar), IA↔UI
  (rascunho→aprovação), LGPD removido da UI e das Edge Functions, Zod fixado em 3.23.8 (build).
- [ ] **Fase 7 — Qualidade**: testes de RLS e lógica crítica, lint, typecheck, README.
- [ ] **Fase 8 — Revisão final** (`docs/REVISAO-FINAL.md`): checklist de publicação.

## Andamento

### Em andamento
- Fase de execução/gamificação/IA (workflow): (A) CORRIGIR execução de treino do aluno — iniciar
  sessão, ver vídeo+detalhes do exercício, registrar série, finalizar, sem ficar preso ao dia
  atual; (B) GAMIFICAÇÃO (voltou ao escopo por decisão do usuário) — conquistas/pontos ao
  finalizar sessão, tela do aluno; (C) INTEGRAÇÃO IA↔UI — ligar botões às Edge Functions com
  fluxo rascunho→aprovação.
- A seguir: Fase 7 (qualidade/CI/README) e Fase 8 (revisão final).

### Versões inline das Edge Functions (entregue)
- `supabase/functions-inline/` com generate-diet, suggest-workout e analyze-assessment em arquivo
  único + README, para o usuário deployar pelo dashboard do Supabase (sem CLI/Docker).

### Fixes aplicados durante os testes do usuário (produção)
- Auth religado à v2 (cadastro via signUp + trigger); `/dashboard` legado redireciona por papel.
- Scroll mobile corrigido no AppShell (h-[100dvh] + min-h-0).
- Exercícios do catálogo global: botão "Duplicar para o meu acervo".
- "Criar ficha a partir de modelo": explica quando desabilitado (sem alunos/modelos).
- Convite de aluno PKCE (redirectTo + /callback server + set-password) e domínio oficial.
- Formulário de aluno: campos opcionais de verdade, gênero como select, erros em pt-BR.
- Upload de vídeo: bodySizeLimit 50mb (erro 413).
- Trigger handle_new_user não cria mais aluno como trainer; aluno pendente visível + reenvio de convite.
- Segredos removidos do .env.example (CRON_SECRET real; ANTHROPIC_API_KEY).

### Concluído

#### Lote de 9 melhorias + 3 recursos novos (rodada de out/2026, via workflows) — tudo na `main`, aprovado em revisão

> Cada item abaixo passou por implementação + revisão de código (e, nos mais arriscados, também
> por design + revisão de design). Verificação `typecheck`/`lint`/`test`/`build` EXIT=0 em todos.
> Trabalho direto na `main`, sem push automático. **Bloqueios de ambiente no fim desta seção.**

- **Onda 1** — bug da avaliação que "fechava sozinha" na etapa de fotos (reuso de nó DOM + guarda
  de submit + Enter); RPE 1..10 opcional ao finalizar treino; uma série por vez na execução;
  descanso reiniciado a cada série concluída. (migration `...092000` perceived_intensity)
- **Onda 2** — circunferências novas (braço contraído, antebraço, coxa medial/distal, esq/dir);
  anamnese com roteiro-padrão na criação; filtro por grupo muscular no seletor de exercício.
  (migration `...093000` circunferências)
- **Onda 3** — pontuação InBody na avaliação física (coluna dedicada `inbody_score`).
  (migration `...094000`)
- **Item "fotos na criação da avaliação"** — já existia e funcionava; nada a fazer.
- **Ondas 4 e 5 (Item 9)** — divisões A/B/C/D/E + ficha a partir de MÚLTIPLOS modelos. Parte A:
  base (coluna `division` em itens/sessões, `lib/divisao.ts`, schemas, `criarFichaMultiModelo`,
  `order_index` global contínuo, `source_workout_id=null` quando multi-origem) + UI do professor.
  Parte B: execução e detalhe do aluno agrupam/selecionam por divisão com detecção por ficha e
  fallback total ao eixo "dia" legado; a sessão carimba a divisão executada. Mecânica da execução
  (navegação, descanso, série-por-vez, herança, RPE) preservada. (migration `...095000`)
- **Recurso — Liberação programada de treinos** — o professor agenda a liberação por DATA FIXA ou
  PRAZO EM DIAS; um cron diário (`/api/cron/liberar-treinos`, auth `CRON_SECRET` endurecida) vira
  `draft→released` quando a data chega. Liberar agendado/imediato é um ATALHO DELIBERADO fora da
  máquina de transições (`draft→pending_review→approved→released`), aceito por produto. Aluno vê só
  o treino liberado. (migration `...098000` `scheduled_release_at` + `vercel.json` com cron 06:00 UTC)
- **Recurso — Treino presencial (professor executa em nome do aluno)** — botão "Treinar com o
  aluno" nas fichas liberadas abre a MESMA tela de execução, operada pelo professor; a sessão grava
  `student_id` do aluno e `recorded_by` do autor logado. A RLS já autorizava o trainer do tenant a
  escrever sessões/séries do aluno (nenhuma policy mudou). Aluno vê como execução dele.
  (migration `...099000` `recorded_by`)
- **Recurso — Hub de atalhos na ficha do aluno** — a página do professor `/professor/alunos/[id]`
  ganhou um bloco de atalhos: criar treino (`?aluno=` pré-seleciona), nova avaliação (`?aluno=`),
  dieta, e âncoras para treinos/evolução da própria página. Sem duplicar a seção de evolução nem o
  botão de treino presencial. Só navegação; zero mudança de banco.
- **Ajuste — Remoção da "Pontuação InBody" da avaliação física** — o campo saiu do fluxo:
  removido do formulário de criação/edição, da validação Zod, da escrita na Server Action, da
  apresentação (detalhe do professor + card do aluno), dos tipos à mão em `database.types.ts`,
  das cópias de ajuda/marketing e das referências na Edge Function de IA (fonte inline
  `analyze-assessment.txt`). A COLUNA `inbody_score` foi MANTIDA no banco (nullable, ignorada):
  um `drop` quebraria o `SELECT` da Edge Function `analyze-assessment` (deploy manual) até um
  redeploy, acoplamento arriscado e fora do fluxo forward-only; por isso nenhuma migration nova
  foi criada. Follow-ups manuais quando/se o usuário quiser dropar a coluna: (1) RE-DEPLOYAR a
  Edge Function `analyze-assessment` para a limpeza do `.txt` valer em produção — a função antiga
  ainda funciona até lá, pois a coluna continua existindo; (2) só então criar o par de migrations
  `..._avaliacao_inbody_score_drop.sql` (`alter table public.physical_assessments drop column if
  exists inbody_score;`) + rollback pareado que re-adiciona (`add column inbody_score
  numeric(5,2);`), seguindo o padrão `...110200/110300_exercises_source_link(_rollback)`.
- **Ajuste — Tooltip dos gráficos de avaliação legível no tema escuro** — o `<Tooltip>` do
  recharts no donut "Massa gorda × massa magra" (`composicao-grafico.tsx`) e no wrapper de linha
  de evolução (`charts/evolucao-line-chart.tsx`) agora define também `itemStyle`/`labelStyle`
  (texto = `--popover-foreground`) e `wrapperStyle` além do `contentStyle` existente, para o
  texto acompanhar o tema (claro/escuro) em vez do padrão branco ilegível.

**Bloqueios de ambiente desta rodada (fazer no deploy — não dá para fazer no ambiente sem Docker/Supabase):**
- **Aplicar as 6 migrations novas** no Supabase (à mão / `db reset`): `...092000` (RPE),
  `...093000` (circunferências), `...094000` (InBody), `...095000` (divisões),
  `...098000` (liberação programada), `...099000` (recorded_by). Todas aditivas/nullable.
- **Regenerar `types/database.types.ts`** via CLI (`supabase gen types ... --local`) — hoje os
  tipos dessas colunas foram editados à mão.
- **Cron da liberação programada:** garantir `CRON_SECRET` no ambiente de produção e o agendamento
  do `vercel.json` ativo (ou agendador equivalente). Testar o endpoint com o header de autorização.

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
