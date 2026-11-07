---
inclusion: always
---

# Flvxus — Inventário do projeto (memória institucional)

Mapa do que EXISTE de fato no repositório, ancorado no código real. Complementa
`.kiro/steering/architecture.md` (regras/convenções) — **não** o duplica. Quando
este inventário divergir do código, **o código vence** (confirme lendo). Objetivo:
em qualquer sessão futura, achar rápido onde cada coisa vive e não recriar
duplicidade/redundância/contradição.

Números do inventário (verificados nesta varredura): **~45 tabelas**, **~24 enums**,
**68 migrations** (112 arquivos com rollbacks), **17 arquivos de actions**, **~40
funções SQL** (30 arquivos de migration com `security definer`), **~100 testes**.

## Índice
1. Fluxo de trabalho do projeto
2. Comandos e stack
3. Inventário de features entregues (por área)
4. Mapa de migrations (ordem + papel + rollback)
5. Modelo de dados real (tabelas, enums, funções SECURITY DEFINER)
6. Convenções de código confirmadas
7. Armadilhas / lições aprendidas (crítico)
8. Pendências de produção (lado do usuário)
9. Inconsistências docs × código

---

## 1. Fluxo de trabalho do projeto
- Branch principal: **`main`** (`origin/main`). Merge por fast-forward a cada frente aprovada.
- Migrations são **aplicadas à mão** no painel do Supabase (sem Docker local). Teste em **produção (Vercel)** a cada merge.
- `types/database.types.ts` é **mantido à mão** (o script `db:types` exige CLI+Docker; não roda aqui).
- Worktrees isolados por frente em `.worktrees/`; cada fase pesada tem design revisado antes de implementar.
- Histórico/evolução do aluno são **preservados** ao trocar de plano/encerrar vínculo (princípio transversal).

## 2. Comandos e stack
- Verificação: `npm run typecheck` · `npm run build` · `npm run test` (vitest) · `npm run test:rls`. `npm run lint`.
- Stack confirmada no `package.json`: Next `^15.5.4`, React `^19`, `@supabase/ssr ^0.7`, `@supabase/supabase-js ^2.39`, `zod 3.23.8`, `stripe 17.7.0`, Capacitor `^7.4`, Tailwind `^3.4`, Radix/shadcn, `recharts`, `framer-motion`, `react-hook-form`, `lucide-react`, `@mjcdev/react-body-highlighter` (mapa muscular).
- IA Anthropic só em Edge Functions Deno (`supabase/functions/`); o Next nunca fala com a Anthropic.

## 3. Inventário de features entregues (por área)

Nota de layout: as áreas **vivas** são `app/(professor)/`, `app/(aluno)/`, `app/(auth)/`, `app/(marketing)/`. `app/(dashboard)/dashboard/*` e `app/_legacy-api/*` são **código v1 legado** (referência, fora do caminho feliz; `_legacy-api` está fora do roteamento). Não construir em cima deles.

### Auth (`app/(auth)/`, `actions/auth.ts`, `lib/auth`)
- Login (`login/page.tsx`), cadastro (`register/page.tsx` → `signUp` + trigger `handle_new_user`), callback de magic link/convite (`callback/route.ts`), set-password (convite de aluno), forgot/reset-password.
- Gate server-side de papel em `lib/auth/index.ts`: `getSessionUser`, `requireRole`, `requireSelfOrStudent`, `requireMaster`, `assertMaster`, `isSelfManaged`. Filiado desativado (`deactivated_at`) perde acesso aqui (não é fronteira de RLS).

### Professor (`app/(professor)/professor/*`)
- **Alunos**: lista/filtros/paginação, criar (`alunos/novo`), editar, detalhe, status; convite por e-mail. Actions `actions/alunos.ts` (`convidarAluno` = único caminho service_role de criação de aluno, `reenviarConvite`, `editarAluno`, `alterarStatusAluno`). Componentes em `components/professor/alunos/*` e `components/students/*` (v1 reusado).
- **Avaliações físicas**: lista/nova/editar/detalhe. `actions/avaliacoes.ts` (`criarAvaliacao`, `editarAvaliacao`, `uploadFotoAvaliacao`, `excluirFotoAvaliacao`). Protocolos de dobras, composição corporal, InBody score, circunferências extra. Cálculos puros em `lib/assessment/*`. Fotos em bucket privado `assessment-photos` (paths em `measurements.photos`, URL assinada). Comparação/evolução em `components/physical-assessments/*` e `components/professor/avaliacoes/*`.
- **Exercícios**: CRUD + mídia (vídeo/thumb/gif). `actions/exercicios.ts` (`criarExercicio`, `editarExercicio`, `excluirExercicio`, `duplicarExercicioParaTenant`, `importarExercicios`, `uploadMidiaExercicio`, `criarUploadUrlMidiaExercicio`, `confirmarMidiaExercicio`, `excluirMidiaExercicio`). **Biblioteca global** (`tenant_id IS NULL`): importação em lote via `GET /professor/exercicios/biblioteca` (route handler) + RPC `importar_exercicios_globais`. Mídia de `lib/storage/exercise-media.ts` (upload direto via signed URL; vídeo ≤50MB, img ≤5MB).
- **Modelos de treino** (`modelos-treino/*`) e **Treinos/fichas** (`treinos/*`): `actions/treinos.ts` (`criarModelo`/`editarModelo`/`excluirModelo`, `criarFicha`/`editarFicha`/`excluirFicha`, `criarFichaDeModelo`, `criarFichaMultiModelo`, `clonarFicha`, `reordenarItensModelo`/`reordenarItensFicha`, `alterarStatusFicha`, `programarLiberacao`, `desmarcarLiberacao`). Séries v2 (tipos ampliados), ficha por divisão, rotação + descanso. Busca server-side (`search_workout_plans`). Componentes em `components/professor/treinos/*` (ficha-form, item-editor, rotation-editor, status-control, agendar-liberacao, clonar-ficha, criar-de-modelo).
- **Dietas** (`dietas/*`): visão de gestão/liberação. `actions/dietas.ts` (`alterarStatusDieta` — carimba `released_at` ao liberar). Geração por IA (ver IA).
- **Desafios (painel do personal / B2B intra-tenant)** (`desafios/*`, gate em `desafios/layout.tsx`): `actions/professor-desafios.ts` (`criarDesafioTurma`), leitura em `lib/professor/desafios-dados.ts`, placar em `components/professor/desafios/placar-turma.tsx`. Desafio `coach` tem janela imediata.
- **Configurações** (`configuracoes/*`): filiados (`components/professor/configuracoes/filiados-section.tsx`) e visibilidade de módulos (`visibilidade-section.tsx`). Actions `actions/filiados.ts` (`convidarFiliado`, `removerFiliado`, `atualizarVisibilidade`).
- **Plano/Billing** (`plano/*`, master-only): `actions/billing.ts` (`iniciarCheckout` → Stripe), `components/professor/plano/checkout-button.tsx`.
- **IA (rascunhos)**: `actions/ia.ts` (`gerarDieta`, `sugerirTreino`, `analisarAvaliacao` → Edge Functions; `editarRascunho`, `aprovarGeracao` = única materialização). UI em `components/professor/ia/*`.
- **Avaliações posturais** (`posture-assessments` existem no legado v1). **ui-kit** existe como rota. A **Agenda** (Fase 1) está viva e visível no menu (ver seção "Agenda" abaixo).
- Perfil do professor: `actions/perfil.ts` (`atualizarPerfilProfessor`, `definirFotoPerfil`, `removerFotoPerfil`).

### Aluno (`app/(aluno)/aluno/*`) — reusada também pelo aluno autônomo
- **Início** (`aluno/page.tsx`): hábitos do dia (água/check-in), card de treino de hoje (`components/aluno/inicio/*`, `components/aluno/habitos/*`).
- **Treinos** (`treinos/*`): ficha liberada, por divisão/dia, resumo de descanso (`components/aluno/treinos/*`).
- **Execução de treino** (`execucao/[planId]`, `.../resumo/[sessionId]`): `actions/execucao.ts` (`iniciarSessao`, `carregarSessaoAberta`, `carregarUltimosRegistros` = **pré-preenchido da última vez**, `carregarDetalheExercicio` + `registrarSerie` com substituto = **troca/backup de exercício**, `finalizarSessao`, `cancelarSessao` = **abandono**, `confirmarDescanso`). Lógica pura em `lib/treino/*` (`prefill`, `inicio`, `progresso`, `series`, `resumo`, `aderencia`, `evolucao-carga`, `alertas-evolucao`). UI em `components/aluno/execucao/*` (sessao-execucao, timer-descanso, trocar-exercicio-dialog, anel-progresso, dialog-avaliacao-treino).
- **Histórico** (`historico/`), **Dieta** (`dieta/` — ver dieta liberada + `toggle-cumprimento` marca "cumpri hoje"), **Evolução** (`evolucao/`), **Avaliações** (`avaliacoes/`), **Conquistas** (`conquistas/`).
- **Arena** (`arena/page.tsx`): ver §Arena abaixo.
- **Perfil** (`perfil/`): dados pessoais (`PerfilForm`), **foto de perfil** (`foto-perfil.tsx`), **@handle** (`meu-handle.tsx`). LGPD **removido da UI** por decisão do usuário (ver §9).

### Gamificação "Flvxus Arena" (entregue em ondas G1→G2→G3 + duelo)
- **Motor (G1)**: ledger append-only `gamification_events`; XP só via `gamification_award` (idempotente por `(user_id, event_type, reference_id)`, cap diário). Catálogo `gamification_event_types`. Cache derivado em `gamification_profiles` (XP/nível/streak/stats). Trigger `award_points_on_session_finish` emite `workout_completed` ao fechar sessão (≥1 série completed). Níveis permanentes `lib/arena/niveis.ts` (0/500/1500/3000/6000/12000 = Iniciante/Aprendiz/Dedicado/Atleta/Elite/Lenda). Streak `lib/arena/streak.ts`, missões `lib/arena/missoes.ts`, PR `lib/arena/pr.ts`, conquistas `lib/gamificacao/conquistas.ts`.
- **Rankings**: tenant (gate ≥2 participantes), global mensal/anual (cross-tenant, só colunas públicas), amigos. Pódio top 3 ouro/prata/bronze: `lib/arena/podio.ts` + `components/aluno/arena/podio-top3.tsx` (compartilhado). Leitura agregada em `lib/arena/dados.ts`. UI: `abas-ranking.tsx`, `leaderboard-arena.tsx`, `leaderboard-global.tsx`, `cartao-nivel.tsx`, `lista-missoes.tsx`, `mini-cards-arena.tsx`.
- **Social (G3)**: amigos (`gamification_friends`), desafios (`gamification_challenges` + `_members`). Actions `actions/arena-social.ts` (`definirHandle`, `verificarDisponibilidadeHandle`, `enviarSolicitacaoPorHandle`, `responderSolicitacao`, `criarDuelo`, `responderDuelo`). Leitura `lib/arena/social.ts`. UI em `components/aluno/arena/social/*`: **amigos e desafios agrupados em acordeão** (`lista-amigos.tsx`, `lista-desafios.tsx` — `Accordion type="single" collapsible`, badge de convites pendentes), `adicionar-amigo-dialog`, `criar-desafio-dialog`, `placar-desafio`, `resultado-desafio`.
- **Duelo com janela a partir do 2º aceite**: duelo nasce sem janela (`starts_on/ends_on NULL`); a janela comum é fixada quando ambos aceitam (`gamification_respond_duel`, dia-SP do 2º aceite + `duration_days-1`). `window_state` ('pending'|'active'|'finished') no scoreboard. Desafio NUNCA gera XP (medalha = evento de 0 ponto).
- Aluno autônomo é cidadão de 1ª classe na Arena (entra no global; tenant de 1 nunca vê ranking de tenant — correto, não bug).

### Agenda (Fase 1 — `app/(professor)/professor/agenda`, `app/(aluno)/aluno/agenda`)
- **Rotas**: `/professor/agenda` (trainer profissional; `self_managed` => `redirect('/aluno/agenda')`) e `/aluno/agenda` (aluno vinculado e autônomo). RSC leem `?visao=dia|semana|mes&data=YYYY-MM-DD` (validados em `lib/agenda/query.ts`; padrão: hoje no fuso do usuário), carregam por `lib/agenda/dados.ts` (`carregarAgenda`, RLS ativo) e renderizam `components/agenda/agenda-view.tsx`. `loading.tsx` por rota; falha de leitura => `ErroAgenda`.
- **Núcleo puro** em `lib/agenda/*`: `fuso` (instantes por `tz`, nunca o fuso da máquina), `recorrencia` (regra + exceções, expandida na leitura), `treino`/`refeicoes`/`agua` (derivados projetados na leitura, nunca gravados), `permissoes` (matriz papel×tipo×ação, espelho de UI), `erros`, `tipos`, `query`.
- **Actions** `actions/agenda.ts`: `criarCompromisso`, `editarCompromisso`, `cancelarCompromisso` (RPCs `agenda_*`, escopos ocorrência/seguintes/todos) e `atualizarFusoHorario` (isenta do gate; ação de conta). Também: `definirHorarioRefeicao` em `actions/dietas.ts` e `lembretes` opcional em `definirMetaAgua` (`actions/habitos.ts`). "Concluir" na agenda reusa `registrarAgua`, `alternarRefeicaoCumprida` e `confirmarDescanso` (sem action nova).
- **UI** `components/agenda/*` (agenda-view, lista-dia, faixa-semana, grade-mes, evento-card, agua-resumo/agua-lembretes, aviso-fichas-sem-dia, compromisso-form, escopo-recorrencia-dialog, selo-responsavel-desativado); `components/perfil/fuso-horario-form.tsx` (perfil do aluno e configurações do professor); `components/professor/dietas/horario-refeicao.tsx` (página da dieta); `components/aluno/habitos/campos-lembrete-agua.tsx` (Intervalo/Início/Fim em `editar-meta-agua` e `meta-agua-aluno`).
- **Quem vê o quê**: professor vê só compromissos (sem derivados); aluno vinculado e autônomo veem compromissos pessoais + treino (dias = união dos `weekday` dos itens da ficha liberada), refeições (`diet_meals.time`; sem hora => faixa "Sem horário") e lembretes de água. Card de atendimento de terceiro é somente leitura para quem não é `owner_id`, `trainer_id` nem master; passado é somente leitura.
- **Módulo de visibilidade `agenda`**: liberado = todos os personais veem os atendimentos do tenant; restrito = cada filiado vê só os seus. Em `configuracoes/page.tsx` a lista de módulos deriva de `MODULOS_VISIBILIDADE` (`schemas/filiado.ts`); `visibilidade-section.tsx` lista `agenda` em `ORDEM`/`MODULO_LABEL`.
- **Menu**: "Agenda" em `trainerNav` (após Desafios), em `studentNav` (4ª posição, após Histórico; as 3 abas primárias não mudam) e em `usoItems` do autônomo (após Minha dieta); o filtro do autônomo remove `/professor/agenda`. Testes em `tests/unit/nav-items.test.ts` e `tests/unit/agenda-componentes.test.tsx`.
- Fase 1 não tem Google Calendar, notificações, solicitação de horário pelo aluno, IA nem resumo semanal.

### Hábitos (`actions/habitos.ts`, `lib/habitos/*`)
- Água (`registrarAgua`, `removerRegistroAgua`, `definirMetaAgua`), dieta do dia (`alternarRefeicaoCumprida`), check-in (`fazerCheckin`). Triggers de hábito concedem XP via motor (`habit_water_after_change`, `habit_diet_after_change`, `habit_checkin_after_insert`). Meta de água derivável do peso (`lib/habitos/meta-agua.ts`).

### Billing / planos
- 3 tiers atuais: `individual`/`personal`/`assessoria` (legados `solo`/`team`/`gym` normalizados). Entitlements puros em `lib/billing/entitlements.ts` (IA quota: individual 50, personal 300, assessoria ∞; filiados: 0/5/∞), agora a partir de `EstadoAcesso`. Espelho de UI em `lib/billing/entitlement.ts` (`canAddAffiliate({podeEscrever,...})`, `moduleIsOpen`, `statusComDireito` — este NÃO conhece expiração de trial). Franquia de IA: `lib/ia/quota.ts`, `ai_usage_counters`/`ai_usage_logs`.
- **Trial 14 dias controlado pelo app** (sem cartão, sem `trial_period_days` da Stripe): `handle_new_user()` cria `subscriptions` `trialing` + `trial_ends_at`. **Somente leitura** após o prazo / `past_due` / cancelada. Estado puro em `lib/billing/acesso.ts` (`resolverAcesso`); leitura server em `lib/billing/access.ts` (`getAccess` cacheado, `getAccessFor(user)`, fail-closed) via RPC `billing_tenant_state()`; gate em `lib/billing/guard.ts` (`requireEntitlement(feature|null, user?)`, chamado no INÍCIO de toda action de escrita; teste estático `tests/unit/actions-write-guard.test.ts`); textos em `lib/billing/mensagens.ts`; catálogo de exibição da landing em `lib/billing/catalogo.ts`; intenção plano/ciclo em `lib/billing/intencao.ts`.
- **Checkout**: `lib/billing/checkout.ts` (`criarSessaoCheckout`, usado por `actions/billing.ts` `iniciarCheckout`/`abrirPortal` e por `GET /assinar` em `app/assinar/route.ts`). Landing: `components/marketing/planos-section.tsx` (2 CTAs: "Testar 14 dias grátis" e "Assinar agora"). UI: `components/billing/{banner-assinatura,acesso-provider,aviso-somente-leitura}.tsx`, `components/professor/plano/{planos-grid,portal-button,checkout-button}.tsx`. Webhook `app/api/stripe/webhook/route.ts` + `lib/stripe/webhook-map.ts` (`deveAplicarEvento`: ordem/idempotência, `canceled` terminal). Detalhes e checklist de ambiente: `docs/billing.md`.

### Aluno autônomo (self_managed)
- `role='trainer'` + `is_tenant_master=true` + `account_type='self_managed'`. Trigger `enforce_self_managed_no_students` impede alunos. Nav ramificada em `components/navigation/nav-items.ts` (`getNavItems` remove Visão geral/Alunos/Modelos/Desafios e injeta Início/Treinar/Minha dieta/Evolução/Conquistas/Arena). Rótulo "Aluno" (`roleLabel`). Cai em `/aluno` nos 3 pontos de login (ver §7e).

### Avatar / foto de perfil
- `lib/storage/avatar.ts` (bucket **público** `avatars`, path determinístico `{user_id}.<ext>`, validação por magic bytes, cache-busting `?v=`). Componente `components/ui/avatar.tsx` com `object-cover object-center` (centraliza fotos não-quadradas). Crop em `lib/image/crop-quadrado.ts` (≤2MB). Exibido cru nos rankings cross-tenant.

### @handle (nome de usuário social)
- `profiles.social_handle` (índice único). `actions/arena-social.ts` (`definirHandle`/`verificarDisponibilidadeHandle`). RPC `gamification_social_handle_available`. UI `components/aluno/perfil/meu-handle.tsx`.

### Marketing / legal / ajuda
- `app/(marketing)/`: landing (`page.tsx`), `documentacao/`, `termos/`, `privacidade/`. Aceite de termos: `actions/legal.ts` (`registrarAceiteLegal`), `lib/legal/*`, tabela `terms_acceptances` (append-only, update bloqueado por trigger). Ajuda: `professor/ajuda`, `aluno/ajuda`.

### API Route Handlers (vivos)
- `app/api/cron/liberar-treinos/route.ts` (GET, protegido por `CRON_SECRET`) — liberação programada de treinos. `app/api/stripe/webhook/route.ts` (POST). `app/(professor)/professor/exercicios/biblioteca/route.ts` (GET, biblioteca global).

## 4. Mapa de migrations (`supabase/migrations/`, ordem por timestamp)

**MAIOR timestamp atual: `20261107090200`** (`_agenda_functions`). Reconfira com `ls supabase/migrations` antes de criar outra. **Qualquer migration nova DEVE usar timestamp estritamente maior e único.**

Rollback pareado (`_rollback.sql`) existe a partir de `20261021110300`. As 11 primeiras (base v2, `20261020*`–`20261021120000`, exceto source_link) **não** têm rollback pareado.

Base v2 (sem rollback pareado):
- `20261020090000_extensions_e_enums` — extensões + 12 enums nativos.
- `20261020090100_core_e_funcoes` — tenants/profiles + `app_tenant_id`/`app_role`/`handle_new_user`/`set_updated_at` (SECURITY DEFINER).
- `20261020090200_treinos` · `..0300_avaliacoes` · `..0400_dietas` · `..0500_agenda_gamificacao` (achievements/user_achievements/appointments) · `..0600_ia` · `..0700_lgpd` · `..0800_rls_policies` · `..0900_storage` (buckets).
- `20261020120000_fix_handle_new_user_convite_aluno` — trigger lê convite de aluno.

Fase execução/treino/avaliação:
- `20261021090000_uniq_workout_set_logs` · `091000_gamificacao_conquistas` (SD) · `092000_workout_session_perceived_intensity` · `093000_avaliacao_circunferencias_extra` · `094000_avaliacao_inbody_score` · `095000_ficha_por_divisao` · `098000_liberacao_programada` · `099000_workout_session_recorded_by` · `100000_busca_treinos` (RPC `search_workout_plans` + GIN trigram) · `110100_bucket_exercise_gifs` · `110200_exercises_source_link` (+rollback) · `110400_seed_biblioteca_global_exercicios` · `120000_terms_acceptances` (SD).

Fase 3 (RLS condicional, master/filiado, billing) — todas com rollback:
- `20261022090000_idx_workout_sessions_plan_division_finished` · `090100_award_earned_at_from_finished` (SD) · `090100_profiles_master_affiliate` (SD) · `090200_tenant_module_visibility` (SD) · `090300_created_by_backfill` · `090400_rls_conditional_visibility` · `090500_billing_plans_subscriptions` (SD) · `091000_uniq_workout_session_aberta` · `091100_rls_sessions_conditional_visibility`.
- `20261023090000_exercise_videos_file_size_limit` (50MB) · `090100_rls_sessions_student_delete`.

Séries v2 / execução (todas com rollback):
- `20261024090000_series_tipo_observacao` · `090100_ficha_rotation_steps_descanso` · `090200_series_tipos_ampliados` (enum `set_kind` += dropset/cluster_set/rest_pause...) · `090300_series_reps_descanso_carga`.
- `20261025090000_workout_set_logs_substitute_exercise` (troca de exercício).

Evolução de carga resiliente (com rollback):
- `20261104090000_workout_set_logs_exercise_id` — coluna `workout_set_logs.exercise_id` (FK `exercises`, `on delete set null`, índice): identidade DURÁVEL do exercício executado, gravada no registro (`registrarSerie`: `substitute_exercise_id` senão o `exercise_id` do item prescrito). Sobrevive à recriação de `plan_item_id` pelo `editarFicha`. Backfill idempotente por `coalesce` (recupera só o derivável; órfãos irrecuperáveis ficam NULL — Opção A). Leitura de evolução (`secao-evolucao.tsx` → `montarSerieCarga`) agrupa por `exercise_id`.
- **Frente de execução por série individual já estava no `main`** (commit `feat: resolver reps/descanso/carga por série na execução`): o merge "série vence; item é fallback" vive em `lib/treino/series.ts` (`valoresDaSerie`), consumido por aluno e professor via `SessaoExecucao`. Testes em `tests/unit/series-valores.test.ts`.

Billing — trial + checkout (todas com rollback):
- `20261105090000_billing_trial_core` — colunas `subscriptions.trial_ends_at`/`stripe_event_at`/`stripe_event_kind`; RPC `billing_tenant_state()` (SD, leitura do estado por qualquer membro do tenant); `can_add_affiliate()` ciente do trial; `handle_new_user()` cria o trial (bloco com `exception`, nunca derruba o cadastro); backfill idempotente (14 dias a partir da aplicação). **Aplicar ANTES do deploy.**
- `20261105090100_plans_stripe_price_ids_seed` — seed idempotente dos 6 price IDs em `plans.stripe_price_id_monthly/_yearly` (uma linha por tier). Rollback zera só os IDs semeados (não restaura centavos/`is_active`).

Agenda Fase 1 (todas com rollback; **aplicar na ordem, cada uma em execução própria**):
- `20261107090000_visibility_module_agenda` — só `alter type visibility_module add value if not exists 'agenda'`. Rollback é no-op documentado (Postgres não remove valor de enum).
- `20261107090100_agenda_core` — enum `appointment_kind`; `appointments` evoluída (colunas `owner_id`, `kind`, `title`, `location`, `tz`, `recur_freq`, `recur_weekdays`, `recur_until`, `series_id`, `original_date`, `canceled_reason`, `canceled_at`; RLS de leitura, **sem** policies de escrita); `profiles.timezone` (+ trigger de validação IANA); `water_goals.reminder_interval_min/_start_min/_end_min`. Rollback **destrutivo** (ver cabeçalho).
- `20261107090200_agenda_functions` (SD) — `agenda_create`, `agenda_update`, `agenda_cancel` (escrita única), helpers `agenda_caller`/`agenda_check_fields`/`agenda_can_manage`/`agenda_occurrence_on`/`agenda_is_occurrence`/`agenda_next_occurrence` e trigger `agenda_on_student_unlink` (aluno arquivado ou vínculo encerrado cancela atendimentos futuros).
Teste estático: `tests/unit/agenda-migrations.test.ts`; RLS (`describe.skip`): `tests/rls/agenda.visibility.test.ts`.
Billing Fase B + aluno autônomo (todas com rollback):
- `20261025090050_account_type` + `_handle_new_user_account_type` · `090100_plan_tier_values` (individual/personal/assessoria) · `090200_plans_billing_fase_b` (SD) · `090300_subscriptions_billing_cycle` · `090400_ai_usage_counters` (franquia IA).

Gamificação G1 (todas com rollback):
- `20261026090000_gamification_core` · `090100_gamification_engine` (SD `gamification_award`, trigger de sessão) · `090200_gamification_rls` · `090300_gamification_leaderboard` (SD tenant) · `090400_gamification_seed_achievements`.

Hábitos (todas com rollback):
- `20261027090000_habit_event_types` · `090100_water_goals_and_intake` (SD) · `090200_diet_meal_completions` (SD) · `090300_daily_checkins` (SD) · `090400_habits_rls`.

Gamificação G2 (global, com rollback):
- `20261028090000_gamification_global_indexes` · `090100_gamification_global_leaderboard` (SD cross-tenant).
- `20261029090000_tenant_leaderboard_min_2` (SD, gate de 2).

Gamificação G3 social + fixes (todas com rollback):
- `20261030090000_gamification_social_core` · `090100_gamification_social_rls` · `090200_gamification_social_functions` (SD amigos) · `090300_gamification_challenges_functions` (SD desafios) · `090400_gamification_social_seed`.
- `20261031090000_gamification_challenges_rls_recursion_fix` (SD helpers — fix 42P17, ver §7c).
- `20261101090000_gamification_duel_common_window` (SD — janela a partir do 2º aceite).
- `20261102090000_social_handle_available` (SD `gamification_social_handle_available`).
- `20261103090000_tenant_leaderboard_avatar` (SD — avatar no ranking de tenant).

Seeds/scripts (fora de migrations, aplicados à mão): `supabase/seed*.sql`, `supabase/catalogo/*`, `supabase/reset-total.sql`, `supabase/criar-bucket-exercise-gifs.sql`.

## 5. Modelo de dados real

### Enums (`CREATE TYPE ... as enum`)
`user_role`(trainer/student) · `student_status`(active/inactive/pending/archived) · `goal_type` · `experience_level` · `assessment_protocol`(pollock_3/7, durnin...) · `plan_status`(draft/pending_review/released...) · `ai_job_type` · `ai_job_status`(pending/succeeded/failed/rejected) · `appointment_status` · `consent_type`(data_processing/health_data/ai_processing/terms) · `data_request_type`(export/delete) · `data_request_status` · `legal_document_type`(terms/privacy) · `set_kind`(warmup/adaptation/work +dropset/cluster_set/rest_pause...) · `account_type`(professional/self_managed) · `plan_tier`(solo/team/gym + individual/personal/assessoria) · `billing_cycle`(monthly/yearly) · `subscription_status` · `visibility_module` · `challenge_kind`(duel/coach) · `challenge_status`(active/finished/cancelled) · `challenge_member_result`(pending/won/lost/tie) · `friend_status`(pending/accepted/blocked).

### Tabelas (das migrations)
Core: `tenants`, `profiles` (role, tenant_id, is_tenant_master, account_type, deactivated_at, avatar_url, social_handle, timezone, total_points legado). 
Treino: `exercises`, `workouts`, `workout_exercises`, `workout_exercise_sets`, `workout_plans`, `workout_plan_items`, `workout_plan_item_sets`, `workout_plan_rest_completions`, `workout_sessions`, `workout_set_logs`. 
Avaliação: `physical_assessments` (superset único), `posture_assessments`. 
Dieta: `diets`, `diet_meals`, `diet_meal_foods`, `diet_meal_completions`, `diet_history`, `diet_shopping_lists`. 
Conquistas (legado + Arena): `achievements`, `user_achievements`. 
IA: `ai_generations`, `ai_usage_logs`, `ai_usage_counters`. 
Agenda: `appointments` (evoluída pela Agenda Fase 1; escrita só via `agenda_*`). 
LGPD: `consent_records`, `data_requests`, `terms_acceptances`. 
Billing: `plans`, `subscriptions`, `tenant_module_visibility`. 
Hábitos: `water_goals` (meta + lembretes da agenda), `water_intake_logs`, `daily_checkins`. 
Arena: `gamification_event_types`, `gamification_events` (ledger), `gamification_profiles`, `gamification_seasons`, `gamification_friends`, `gamification_challenges`, `gamification_challenge_members`.

### Funções SECURITY DEFINER (papel de cada uma)
- `app_tenant_id()` / `app_role()` — resolvem tenant/papel do `auth.uid()` (base de toda RLS).
- `app_is_master()` / `app_module_is_open()` — gate de master e visibilidade de módulos.
- `handle_new_user()` — cria tenant+profile no signup (trigger).
- `set_updated_at()` — trigger de timestamp.
- `can_add_affiliate()` — enforcement do limite de filiados por plano.
- `enforce_self_managed_no_students()` — impede autônomo de ter alunos.
- `search_workout_plans()` — busca de treinos (INVOKER, não DEFINER).
- `importar_exercicios_globais()` — cópia idempotente do catálogo global para o tenant.
- `seed_achievements_for_tenant()` — seed de conquistas por tenant.
- `prevent_terms_acceptance_update()` — torna `terms_acceptances` append-only.
- **Arena**: `gamification_sp_date()` (dia-SP), `gamification_resolve_season()`, `gamification_level_for_xp()`, `gamification_award()` (única fonte de XP), `award_points_on_session_finish()`, `gamification_check_prs_for_session()`, `gamification_recalc_streak()`, `gamification_on_assessment_insert()`, `gamification_on_rest_completion()`, `gamification_close_season_and_award()`.
- **Rankings**: `gamification_tenant_leaderboard()`, `gamification_global_leaderboard()`, `gamification_friends_leaderboard()`, `gamification_challenge_scoreboard()`.
- **Social**: `gamification_list_friends()`, `gamification_friend_request_by_handle()`, `gamification_respond_friend_request()`, `gamification_social_handle_available()`.
- **Desafios/duelo**: `gamification_create_duel()`, `gamification_respond_duel()`, `gamification_create_coach_challenge()`, `gamification_settle_challenge()`, `gamification_is_challenge_member()`, `gamification_is_challenge_creator()`.
- **Hábitos (triggers)**: `habit_water_after_change()`, `habit_diet_after_change()`, `habit_checkin_after_insert()`, `gamification_sync_water_goal()`, `gamification_sync_diet()`.

## 6. Convenções de código confirmadas
- **EstadoAcao** (`actions/_estado.ts`): `{ ok: boolean; message?: string; fieldErrors?: Record<string,string>; id?: string }` + helper `erroDeCampo(zodFlatten)`. Arena social usa variante `EstadoSocial` (`actions/arena-social.ts`).
- **Leitura RSC**: `page.tsx`/`layout.tsx` async chamam `createClient()` de `lib/supabase/server.ts` (RLS ativo) e passam dados filtrados como props. Gate de papel no `layout.tsx` via `lib/auth`.
- **Fuso America/Sao_Paulo**: `gamification_sp_date(timestamptz)` no SQL; espelho puro `diaSP`/`periodoSP`/`diaSPdeDiaOuInstante` em `lib/arena/datas.ts`. NUNCA `new Date()`/`toISOString()` sobre um `occurred_on` cru.
- **Aluno autônomo**: `isSelfManaged(user)` (`lib/auth`); nav via `getNavItems(role, isMaster, accountType)` e `roleLabel` em `components/navigation/nav-items.ts`.
- **Avatar**: `components/ui/avatar.tsx` → `object-cover object-center`. Pódio compartilhado: `lib/arena/podio.ts` (metal/ring/badge/texto) + `components/aluno/arena/podio-top3.tsx`.
- **Supabase clients**: `lib/supabase/{server,browser,middleware,admin}.ts`. `admin.ts` (service_role) só nas exceções, sempre filtrando `tenant_id`.

## 7. Armadilhas / lições aprendidas (crítico — não repetir)
- **(a) Colisão de timestamp de migration já derrubou o app.** Regra: antes de criar, cheque o maior em `supabase/migrations/` (hoje `20261107090200`) e use estritamente maior e único. Idempotência + rollback pareado obrigatórios.
- **(b) Bug de fuso dia-SP.** Sintoma: dia deslocado -1. Causa: reconverter `occurred_on` (dia-SP cru `YYYY-MM-DD`) com `new Date()` → meia-noite UTC → volta um dia. Correção: `diaSPdeDiaOuInstante` em `lib/arena/datas.ts` devolve a string crua após validação, sem reconverter; instantes passam por `Intl.DateTimeFormat` no fuso SP.
- **(c) Recursão mútua de RLS (Postgres 42P17).** Sintoma: convite de duelo some; "Nenhum desafio" para o professor. Causa: policy de `gamification_challenges` referenciava `_challenge_members` e vice-versa (ciclo). Correção (`20261031090000`): mover as subconsultas cruzadas para helpers SECURITY DEFINER (`gamification_is_challenge_member`/`_creator`, `search_path=''`) — mesmo escopo, sem ciclo. **Padrão a reusar para qualquer policy que leia outra tabela sob RLS.**
- **(d) Cache de avatar.** Sintoma: foto antiga persistia após troca (path determinístico `{user_id}.<ext>`). Correção: cache-busting `?v=${Date.now()}` na public URL gravada em `profiles.avatar_url` (`lib/storage/avatar.ts`).
- **(e) 3 pontos de redirect de login do aluno autônomo.** O autônomo (trainer+self_managed) deve cair em `/aluno`, não `/professor`, e não vê "Visão geral". Os 3 pontos: `app/(auth)/login/page.tsx`, `app/(auth)/callback/route.ts`, `app/(auth)/set-password/page.tsx` (register também: `register/page.tsx`). Ao mexer em roteamento pós-login, ajuste **todos**. A ocultação de menu é em `getNavItems`.
- **(f) Flakiness do build no Windows.** Sintoma: ENOENT em `.next/server/pages-manifest.json` ou `.next/types`. Causa: cache corrompido. Correção: apagar `.next` inteiro e rebuildar. Warnings de `react-hooks/exhaustive-deps` são pré-existentes, não erro.
- **(g) Lock de `node_modules` no Windows** impede `git worktree remove`. Use `git worktree prune` + limpeza manual.
- **(h) RLS de `subscriptions` só deixa o master ler.** Aluno vinculado/filiado enxergam "sem assinatura" se lerem a tabela. Para o estado de acesso use SEMPRE `billing_tenant_state()` (`getAccess`/`getAccessFor`), nunca `from('subscriptions')` fora do master. Após o trial, a linha segue `trialing`: nunca use `statusComDireito(status)` na UI; use `EstadoAcesso.podeEscrever`. Toda action de escrita nova DEVE chamar `requireEntitlement` no início (o teste estático quebra se esquecer). O legado `/dashboard` (v1) escreve direto pela RLS e não passa pelo gate.

- **(i) Valor novo de enum não pode ser usado na mesma transação.** `alter type ... add value` (ex.: `'agenda'` em `visibility_module`) só fica utilizável depois do commit; por isso fica numa migration própria (`20261107090000`) e as seguintes (`090100`, `090200`) só rodam depois. No painel do Supabase, execute uma migration por vez; se juntar tudo numa execução, o SQL que referencia o valor novo falha.
- **(j) Datas da agenda são cruas.** `original_date`, `recur_until` e `occurred_on` são `YYYY-MM-DD` no `tz` da série/dia-SP: nunca `new Date(string)`. Editar/cancelar usa `meta.dataOriginal` + `meta.tzSerie`, nunca o `dia` exibido (que está no fuso do espectador).
## 8. Pendências de produção (lado do usuário, não-código)
- **Stripe**: price IDs reais e valores são placeholders/configuráveis (env); o usuário define no painel do Stripe (ver `docs/billing.md`). Franquia de IA por plano (50/300/∞) é padrão do código — ajustar conforme custo real.
- **Migrations à mão**: aplicar no painel do Supabase na ordem de timestamp (sem Docker local). `types/database.types.ts` mantido à mão.
- **Storage**: buckets e policies criados à mão no painel — `avatars` (público), `assessment-photos`, `exercise-videos`/`exercise-gifs` (privados; `exercise-videos` com `file_size_limit=50MB`). Ver `docs/storage-avatars.md`.
- **Supabase Auth**: Site URL + Redirect URLs (`${NEXT_PUBLIC_SITE_URL}/callback`) e template de convite (`{{ .ConfirmationURL }}`) — senão o onboarding de aluno quebra (ver `docs/pendencias.md`).
- **Edge Functions IA**: deploy + `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` como secrets (bloqueio de ambiente, não de código).
- **Jurídico**: revisão de Termos/Privacidade (conteúdo em `lib/legal/documents.tsx`).

## 9. Inconsistências docs × código (para o usuário saber o que pode estar desatualizado)
- **LGPD do aluno**: `docs/decisions/0012-lgpd-aluno.md` descreve consentimento/controles, mas a UI do aluno e a checagem `ai_processing` na IA foram **removidas** (decisão registrada em `docs/pendencias.md`). Schemas `registrarConsentimento`/`solicitarDados` em `schemas/perfil.ts` permanecem sem uso. Tabelas `consent_records`/`data_requests` existem no banco mas não têm UI ativa.
- **Agenda/calendário**: a Agenda Fase 1 está viva e **deixou de estar oculta no menu** (`nav-items.ts`). Fora da Fase 1 (adiado): Google Calendar, notificações, solicitação de horário pelo aluno, IA e resumo semanal. `app/(dashboard)/dashboard/calendar` continua legado v1.
- **Resumo semanal de aderência por IA** (`ai_job_type` previsto no ADR 0001): **não implementado** (`weekly_adherence` adiado).
- **WhatsApp**: rotas em `app/_legacy-api/whatsapp/*` são código morto v1; feature adiada (vars em `.env.example` em branco).
- **`business_name` do cadastro**: coletado na UI e salvo em `raw_user_meta_data`, mas `handle_new_user()` nomeia o tenant só com `full_name` (não usa `business_name`).
- **Avaliação vencida fixa em 90 dias** (`DIAS_AVALIACAO_VENCIDA`), não configurável por tenant.
- **Dobra bíceps (Durnin & Womersley)**: sem coluna dedicada; gravada em `measurements.skf_biceps` (jsonb).
- **Áreas legadas v1**: `app/(dashboard)/dashboard/*` (inglês) e `app/_legacy-api/*` são referência, **não** o produto v2 vivo (`app/(professor)` / `app/(aluno)`). Rotas legadas usam termos em inglês (workout-plans, students) vs. v2 em pt-BR (treinos, alunos).
- `README.md` é um stub (8 bytes); a documentação real está em `docs/` e nos dois steering files.
