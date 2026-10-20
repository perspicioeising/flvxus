# Auditoria completa — Flvxus (estado atual)

> Auditoria **somente leitura** do repositório `flvxus`, feita para registrar o estado do código **antes** do relançamento v2. Nada foi alterado. Caminhos citados são relativos à raiz do repo (`c:\Users\b.hsantos\Documents\flvxus\flvxus`).
>
> Data: 2026-10-19 · Branch: `main` · Commits no histórico: 534

---

## 1. Resumo executivo (a leitura rápida)

O Flvxus é um app **Next.js 14 (App Router) + Supabase + Radix/shadcn + Tailwind + Capacitor**, com uma base de funcionalidades **ampla mas irregular**: muitas telas e rotas de API existem para as áreas certas (alunos, avaliações, exercícios, treinos, dietas, área do aluno, achievements, webhooks, WhatsApp), porém há **dívida técnica séria em três eixos** que justificam a reescrita v2:

1. **Banco de dados inconsistente.** Existem 18 migrations versionadas por timestamp **e** 4 arquivos SQL não-versionados (`avaliacao.sql`, `dieta.sql`, `novo-dieta.sql`, `deletar-estruturas.sql`) aplicados manualmente. O `physical_assessments` é **criado com dois esquemas diferentes e incompatíveis** (um na migration base, outro em `avaliacao.sql`). Não há `seed.sql`. Rodar as migrations na ordem do diretório **não reproduz** o banco de produção.

2. **Segurança frágil, apesar de RLS existir.** O RLS está habilitado em quase todas as tabelas e as policies isolam por `tenant_id` (bom ponto de partida). Mas: **todos os buckets de Storage são públicos** (`public = true`) e **não há policies em `storage.objects`** — fotos de avaliação e áudios ficam acessíveis por URL. Rotas usam `service_role` (admin) no servidor, o que é aceitável, mas pelo menos uma rota de IA (`physical-assessments/analyze`) **não valida autenticação**. O webhook do WhatsApp **não verifica assinatura** (código comentado).

3. **IA via Google Gemini, sem guarda-corpos.** As chamadas são server-side (chave não vaza para o cliente — bom), porém o **modelo é string fixa espalhada** por 4 arquivos, **sem validação de schema (Zod)**, **sem rate limit**, **sem log de uso/custo**, **sem proteção contra prompt injection** (dados do aluno entram interpolados direto no prompt), e com **retry/fallback inconsistentes**. Isso é exatamente o que a visão v2 (Anthropic via Edge Functions) precisa substituir.

Além disso: **zero testes**, **sem typecheck/CI**, `README.md` vazio (só a palavra "flvxus"), `next` em versão **canary**, dependências inúteis/perigosas (`i`, `npm`, `node-wav` — nenhuma importada no código), e uma rota de API **quebrada por nome de arquivo errado** (`diets/[id]/routes.ts` em vez de `route.ts`).

Veredito: a base tem valor como referência de funcionalidades e UX, mas **reescrever o banco do zero e a camada de IA** (como o PROGRESSO.md já antecipa) é a decisão correta. O front-end tem muito material reaproveitável (226 componentes `.tsx`).

---

## 2. Inventário de features (o que existe, estado, onde vive)

Legenda de estado: ✅ parece completo · 🟡 incompleto/com ressalvas · 🔴 quebrado/ausente

| Área | Estado | Onde vive | Observações |
|------|--------|-----------|-------------|
| **Autenticação** | 🟡 | `app/(auth)/*` (login, register, reset-password, set-password, callback), `middleware.ts`, `app/api/auth/register`, `app/api/students/[id]/invite` | Fluxo de convite/magic link elaborado; middleware protege `/dashboard`. Ver §5. |
| **Alunos (gestão)** | ✅ | `app/(dashboard)/dashboard/students/*`, `app/api/students/*`, `components/students/*`, `types/student.ts` | CRUD completo com paginação, filtros, stats, convite por e-mail. Rota mais madura do projeto. |
| **Avaliação física** | 🟡 | `app/(dashboard)/dashboard/physical-assessments/*`, `app/api/physical-assessments/*` (route, `[id]`, `analyze`, `comparison/[studentId]`, `students/[studentId]`), AI em `analyze/route.ts` | Tem histórico/comparação e análise por IA. **Esquema da tabela conflita entre migrations** (§3). `analyze` sem auth (§5). |
| **Avaliação postural** | 🟡 | `app/(dashboard)/dashboard/posture-assessments/*`, `app/api/posture-assessments/*` | Tabela tem coluna `ai_analysis jsonb`, mas **não há rota de IA** que a preencha. Upload de imagens em bucket **público**. |
| **Exercícios (biblioteca)** | ✅/🟡 | `app/(dashboard)/dashboard/exercises/*`, `app/api/exercises/*`, `components/exercices/*`, `hooks/use-exercises.ts` | CRUD, upload de vídeo, geração de áudio (TTS) e sugestões por IA. Upload de áudio tem lógica de fallback frágil (§3/§6). |
| **Treinos / fichas** | ✅/🟡 | `workouts/*`, `workout-plans/*`, `app/api/workouts`, `workout-plans`, `workout-exercises` (schema), `components/workouts/*` | Modelo de dados separa `workouts` (modelo reutilizável), `workout_exercises`, `workout_plans` (por aluno) e `workout_plan_items` (dia da semana). `userRole` hardcoded como `"trainer"` em `components/workouts/WorkoutsList.tsx` (TODOs). |
| **Execução de treino (aluno)** | ✅ | `app/(dashboard)/dashboard/my-workouts/*`, `app/api/my-workouts`, `app/api/workout-progress/*`, `app/api/workout-history`, `components/my-workouts/*` | Interface de execução com tracking de séries. Bem desenvolvida. |
| **Dietas (IA)** | 🟡 | `app/(dashboard)/dashboard/diets/*`, `app/api/diets`, `app/api/diets/[id]/routes.ts` 🔴, `app/api/ai/generate-diet`, `hooks/use-diets.ts` | Geração por Gemini + cálculos TMB/TDEE/macros locais. **`diets/[id]/routes.ts` está quebrado**: o App Router exige `route.ts`; esse endpoint nunca é registrado (GET/PUT/DELETE de uma dieta específica não funcionam). |
| **IA** | 🟡 | `app/api/ai/*` (generate-diet, generate-audio, exercise-suggestions), `app/api/physical-assessments/analyze` | Google Gemini. Ver §4 — sem Zod, sem rate limit, sem logs, sem anti-injection. |
| **Achievements / gamificação** | 🟡 | `app/(dashboard)/dashboard/achievements/*`, `my-achievements`, `app/api/achievements/*`, `app/api/user/achievements`, `app/api/user/stats` | Tabela `achievements` + `user_achievements` (migration `20250604175907_silent_salad.sql`); `profiles.total_points` e `last_workout_date`. |
| **WhatsApp** | 🔴/🟡 | `app/api/whatsapp/send`, `app/api/whatsapp/webhook`, `webhooks/notification-service` | Webhook **sem verificação de assinatura** (comentada) e o insert em `whatsapp_messages` está **comentado** — recebe mas não persiste. Integração meia-feita. |
| **Webhooks (saída)** | 🟡 | `app/(dashboard)/dashboard/webhooks/*`, `app/api/webhook/*`, `webhooks/service`, `webhooks/helper` | Sistema de disparo com HMAC SHA-256, retry e métricas. Tabelas de webhook não aparecem claramente nas migrations (possível dívida de schema). |
| **Agenda / calendário** | 🟡 | `app/(dashboard)/dashboard/calendar`, tabela `appointments` (migration base) | Tabela existe com RLS; não há rota de API dedicada a `appointments` em `app/api/` (a tela pode acessar via client Supabase). |
| **Perfil** | ✅ | `app/(dashboard)/dashboard/profile`, `app/api/profile` | — |
| **Mobile (Capacitor)** | 🟡 | `android/`, `ios/`, `capacitor.config.json`, `lib/api-config.ts`, `hooks/useCapacitor.ts`, `app/capacitor-provider.tsx` | Ver §8. |

---

## 3. Banco de dados

### 3.1 Schema implícito (tabelas e relacionamentos)

Fundação multi-tenant na migration base `supabase/migrations/20250531160855_ivory_summit.sql`:

- **`tenants`** — conta do personal (plano, limites de alunos/treinadores, `owner_id → auth.users`).
- **`profiles`** — 1 linha por usuário (`user_id → auth.users`), com `role` (`'trainer'`/`'student'`), `trainer_id` (auto-referência para alunos), `tenant_id`. É o eixo de todo o RLS. Colunas de aluno (`birth_date`, `gender`, `height`, `weight`, `goals`, `status`, `experience_level`, etc.) foram acrescidas depois via migrations/SQL avulsos (o código de `app/api/students/route.ts` grava esses campos).
- **`exercises`** — biblioteca por tenant (`muscle_group[]`, `equipment[]`, `video_url`, `tips[]`, `common_errors[]`).
- **`workouts`** (modelo) → **`workout_exercises`** (itens: séries/reps/descanso/ordem) → usados em **`workout_plans`** (por aluno) → **`workout_plan_items`** (dia da semana).
- **`physical_assessments`** — ver conflito abaixo.
- **`posture_assessments`** — imagens (front/side/back) + `ai_analysis jsonb`.
- **`appointments`** — agenda trainer↔aluno.
- **`diets`** → **`diet_meals`** → **`diet_meal_foods`**, mais **`diet_shopping_lists`** e **`diet_history`** (em `dieta.sql`/`novo-dieta.sql`).
- **`achievements`** + **`user_achievements`** (migration `silent_salad`), e colunas de gamificação em `profiles`.

Não há **enums nativos** (`CREATE TYPE`): papéis, status, objetivos e níveis são `text` com `CHECK (... IN (...))` ou texto livre. Isso é frágil (typos não são barrados no nível de tipo) e espalha os valores válidos entre SQL e TypeScript.

### 3.2 RLS, triggers e funções

- **RLS habilitado** em ~20 tabelas (`ENABLE ROW LEVEL SECURITY`). Policies usam duas funções `SECURITY DEFINER`: `public.get_tenant_id()` e `public.get_user_role()`, ambas lendo de `profiles` por `auth.uid()`.
- Padrão de policy: SELECT liberado para quem está no mesmo `tenant_id` (treinadores) ou para o próprio aluno; escrita (`FOR ALL`) restrita a `role = 'trainer'` no tenant. Conceitualmente sólido para o isolamento professor↔alunos.
- **Triggers**: `update_updated_at_column()` aplicado via `set_timestamp`; `handle_new_user()` cria um `profiles` **sempre com `role = 'trainer'`** no sign-up (alunos são criados por outro caminho, via `service_role` em `app/api/students`).
- **Storage**: 4 buckets criados — `exercise-videos`, `posture-images`, `exercise-audio` — **todos `public = true`** e **sem nenhuma policy em `storage.objects`** (grep por `storage.objects` nas migrations retorna 0). Dados sensíveis (fotos de avaliação postural) ficam acessíveis por URL pública.

### 3.3 Inconsistências versionado × não-versionado (dívida crítica)

- **`physical_assessments` definido duas vezes com esquemas divergentes**:
  - Migration base (`ivory_summit`): colunas `body_fat`, `muscle_mass`, `measurements jsonb`, **sem** `age`/`gender`/`protocol`.
  - `avaliacao.sql` (não-versionado): recria `IF NOT EXISTS` com `age`, `gender`, `protocol`, `fat_percentage`, `lean_mass`, dezenas de circunferências/dobras, `ai_analysis`, `ai_recommendations`. É este o esquema que o código (`analyze/route.ts`, telas) espera.
  - Como é `CREATE TABLE IF NOT EXISTS`, a ordem de aplicação **muda o resultado**: quem rodou a base primeiro ficou com a tabela "pobre"; o banco real só funciona porque `avaliacao.sql` foi aplicado manualmente em um ambiente onde a tabela ainda não existia, ou colunas foram adicionadas à mão. **Não é reproduzível.**
- **`dieta.sql` e `novo-dieta.sql`** cobrem o mesmo domínio: `novo-dieta.sql` começa dropando constraints (`diets_student_user_id_fkey`, `diets_created_by_fkey`) e recriando tudo — sinal clássico de correção aplicada direto em produção e depois "congelada" em arquivo.
- **`deletar-estruturas.sql`** dropa todas as tabelas em cascata — um script destrutivo guardado junto das migrations (perigoso se rodado por engano pelo runner de migrations).
- **Policies RLS inconsistentes entre as duas fontes**: a base usa `get_user_role()`/`get_tenant_id()`; `avaliacao.sql`/`novo-dieta.sql` reimplementam as mesmas verificações com subqueries inline em `profiles`. Dois estilos para a mesma regra = risco de divergência.
- **Sem `seed.sql`**: não há catálogo inicial de exercícios (a v2 pede isso explicitamente).

### 3.4 Cobertura vs. visão do produto

O schema **cobre** o essencial da visão (professor↔alunos multi-tenant, avaliações com histórico, exercícios, treinos modelo+por-aluno, dietas com refeições/alimentos/lista de compras, área do aluno, gamificação). **Faltam/estão frágeis**: consentimento LGPD e export/delete de dados do aluno (inexistentes), log de uso de IA, versionamento de prompts, buckets privados com URLs assinadas, e enums de verdade. A reescrita v2 do banco (já decidida no PROGRESSO.md) é justificada.

---

## 4. IA (estado atual)

**Provedor:** Google Gemini. Libs: `@google/generative-ai` (`^0.24.1`) e `@google/genai` (`^1.5.1`) — **duas libs do Google ao mesmo tempo**.

**Onde é chamado (tudo server-side, em route handlers):**
- `app/api/ai/generate-diet/route.ts` — modelo `gemini-1.5-flash`; cálculos de TMB/TDEE/macros locais + prompt; base nutricional hardcoded em memória (`nutritionDB`).
- `app/api/ai/exercise-suggestions/route.ts` — modelo `gemini-2.0-flash`.
- `app/api/ai/generate-audio/route.ts` — `@google/genai`, tenta modelos TTS `gemini-2.5-flash-preview-tts`, `gemini-2.0-flash-thinking-exp`, `gemini-exp-1206` em loop.
- `app/api/physical-assessments/analyze/route.ts` — modelo `gemini-pro`, com `generateFallbackAnalysis()` quando a chave falta.

**Chave exposta no cliente?** Não. A chave é lida de `process.env.GEMINI_API_KEY` **apenas no servidor**; nenhuma referência `NEXT_PUBLIC_...GEMINI`. ✅ (único ponto realmente bom da camada de IA.)

**Problemas:**
- **Modelo como string fixa, espalhado** por 4 arquivos e em 3 valores diferentes — impossível trocar por env var sem editar código.
- **Sem validação de schema de saída.** O parsing é "regex pega o primeiro `{...}` + `JSON.parse`" em todos os arquivos. Nada de Zod. Saída malformada vira erro genérico ou dado sujo gravado no banco.
- **Sem rate limit** (grep por `rate.?limit` em `app/`, `lib/`, `hooks/` = 0 resultados) e **sem log de uso/custo** (nenhuma tabela de tokens).
- **Prompt injection não tratado.** Em `analyze` e `generate-diet`, dados do aluno (`studentInfo.name`, `goal_description`, `custom_restrictions`, etc.) são **interpolados diretamente** no texto do prompt. Um aluno/treinador pode injetar instruções.
- **Timeout inconsistente.** Em `exercise-suggestions` cria-se um `AbortController` com 30s, mas o sinal **não é passado** para `generateContent` — o timeout não tem efeito.
- **Dietas/treinos gerados não têm fluxo explícito de rascunho→aprovação** no nível de schema (a tabela `diets` tem `status`, mas não um estado "pending_review" ligado à liberação para o aluno).

Isso casa exatamente com o que a v2 exige (Anthropic via Edge Functions, `ANTHROPIC_MODEL` configurável, Zod, rate limit, log de uso, prompts versionados anti-injection, rascunho obrigatório).

---

## 5. Autenticação e RLS (acesso)

**Fluxo:** Supabase Auth via `@supabase/auth-helpers-nextjs`. `middleware.ts` libera rotas de auth e magic links, protege `/dashboard` exigindo sessão, e redireciona usuários logados para fora de `/login`/`/register`.

**Papéis:** `profiles.role` = `'trainer'`/`'student'`. Novo sign-up vira `trainer` (trigger `handle_new_user`); alunos são criados por treinadores via `app/api/students` usando `service_role`.

**Pontos de atenção:**
- **`middleware.ts` só verifica *se existe sessão*, não o papel.** A separação professor/aluno dentro de `/dashboard` depende do RLS e de checagens em cada route handler — não há gate de rota por role. Há `console.log` de debug (com emojis) deixados em produção.
- **`app/api/physical-assessments/analyze/route.ts` não tem nenhuma checagem de autenticação** (não cria client Supabase, não lê sessão). Qualquer requisição POST aciona a IA — risco de abuso/custo. As outras rotas de IA checam `getSession()`.
- **Uso de `service_role` no servidor** em `app/api/auth/register`, `app/api/students`, `app/api/students/[id]`, `.../invite`, `app/api/cron/workout-reminders`, `app/api/whatsapp/webhook`, e nos `webhooks/*`. Em si é legítimo (operações admin), **mas o `service_role` ignora RLS**, então toda a segurança dessas rotas depende das checagens manuais de `role`/`tenant_id` no código. `students` faz essa checagem (bom); `whatsapp/webhook` e `cron` dependem só de token/assinatura.
- **Isolamento entre professores:** o modelo RLS por `tenant_id` previne acesso cruzado **no caminho que usa o client autenticado**. Porém rotas com `service_role` precisam reforçar `tenant_id` manualmente em cada query — auditável caso a caso (ex.: `students` PUT filtra por `tenant_id`; outras precisam ser revisadas uma a uma na v2).

**Conclusão:** o desenho de RLS é bom, mas a aplicação é desigual (uma rota de IA aberta, gates por role ausentes no middleware, segurança concentrada em checagens manuais nas rotas `service_role`). A v2 deve testar as policies (requisito explícito) e mover a IA para Edge Functions que validam JWT + role.

---

## 6. Segurança / segredos

- **Nenhum segredo commitado encontrado.** Sem `.env`/`.env*.local` em disco ou rastreado no git; todos os segredos vêm de `process.env`. O `.gitignore` cobre `.env` e `.env*.local`.
- **Falta `.env.example`** (confirmado: arquivo ausente). A v2 precisa criá-lo listando: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` (→ `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL`), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `CRON_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `NEXTAUTH_URL`.
- **Buckets de Storage públicos + sem policies** — exposição de fotos de avaliação (dado de saúde, LGPD). Ver §3.2. É o risco de segurança mais grave do estado atual.
- **Webhook WhatsApp sem verificação de assinatura** (`x-hub-signature-256` comentado em `app/api/whatsapp/webhook/route.ts`) — aceita payloads forjados.
- **`capacitor.config.json`** usa `server.url = https://flvxus.com.br` com `cleartext: true` (permite HTTP em claro no app nativo) — revisar.
- **Logs ruidosos com dados** em produção (muitos `console.log` com e-mail, IDs, trechos de resposta da IA). Deve ser removido/estruturado.
- **`NEXTAUTH_URL` com fallback `http://localhost:3000`** em chamadas internas server-to-server (`generate-audio`, `exercises`) — em produção sem a env isso quebra silenciosamente.

---

## 7. Dívida técnica

- **SQL não-versionado e conflitante** (§3.3) — o maior item.
- **Rota quebrada:** `app/api/diets/[id]/routes.ts` deveria ser `route.ts`. Como está, o endpoint de dieta individual **não é registrado pelo Next**. Código morto/efetivamente ausente.
- **Dependências inúteis/perigosas no `package.json`:**
  - `i` (`^0.3.7`) e `npm` (`^11.4.1`) — pacotes **sem uso no código** (grep não encontra imports). `npm` como dependency de runtime é um erro (provável `npm i` acidental); ambos devem sair.
  - `node-wav` (`^0.0.2`) — **não importado** em nenhum lugar de `app/`, `lib/`, `hooks/`, `components/`. Resíduo de tentativa de TTS. Remover.
- **Next em versão canary:** `next` e `eslint-config-next` em `^14.2.0-canary.29` — instável para produção. Fixar em release estável.
- **Duas libs de IA do Google** simultâneas (`@google/generative-ai` + `@google/genai`) — serão removidas na migração para Anthropic.
- **TODOs soltos:** `components/workouts/WorkoutsList.tsx` tem `userRole="trainer" // TODO: Get from context/props` (2x) — o papel está **hardcoded**, então a tela de treinos assume treinador independentemente de quem acessa.
- **Features meia-feitas:** persistência de `whatsapp_messages` comentada; análise de IA da avaliação **postural** sem rota; timeout de IA sem efeito (§4).
- **`tsconfig.json`:** `target: es2015` com `downlevelIteration` — antiquado para um app Next 14; `strict: true` é um ponto positivo.
- **Arquivo `anotações`** (13 KB, sem extensão) na raiz — documentação informal do design system; deveria virar `docs/` versionado ou sair da raiz.
- **`next.config.js`:** `swcMinify: false` (minificação desligada) e `output: 'standalone'` convivendo com comentários sobre "export estático" e `images.unoptimized` — configuração confusa, provavelmente ajustada para o Capacitor; precisa ser reavaliada.

---

## 8. Qualidade (testes, lint, typecheck, build)

- **Testes: nenhum.** Sem arquivos `*.test.*`/`*.spec.*`, sem `jest.config`/`vitest.config`/`playwright.config`. O requisito v2 (testes de RLS e lógica crítica) parte do zero.
- **Lint:** existe `.eslintrc.json` (`next/core-web-vitals`) e script `npm run lint`. Regras relaxadas (`react/no-unescaped-entities: off`, `no-img-element: off`).
- **Typecheck:** não há script dedicado (`tsc --noEmit`) nem CI. `strict: true` ajuda, mas nada força a verificação. **Não executei build/typecheck** (conforme instrução de não rodar processos pesados); dado o estado (canary, SQL manual, rota com nome errado), é provável que haja avisos, mas não foi verificado.
- **CI/CD:** nenhum workflow (`.github/workflows` ausente).
- **README:** praticamente vazio (conteúdo = `flvxus`).

---

## 9. Mobile / PWA

- **Capacitor 7** configurado (`capacitor.config.json`, pastas `android/`, `ios/`, script `scripts/init-capacitor.sh`, `hooks/useCapacitor.ts`, `app/capacitor-provider.tsx`). Plugins: App, Filesystem, Haptics, Keyboard, Network, Preferences, Share, SplashScreen, StatusBar, Toast.
- **Estratégia atual:** o app nativo aponta para `server.url = https://flvxus.com.br` (carrega o site remoto dentro do WebView) em vez de empacotar o build estático — por isso `webDir: "out"` e `output: 'standalone'`/`images.unoptimized` no `next.config.js` estão em tensão. `cleartext: true` deveria ser `false` em produção.
- **`lib/api-config.ts`** resolve URLs absolutas no ambiente nativo via `NEXT_PUBLIC_API_URL` (default `https://flvxus.com.br`).
- **PWA:** **não há** `manifest.json`/`manifest.webmanifest` nem service worker no projeto. Não é um PWA hoje (o requisito de "modo offline/PWA" da v2 ainda não começou).

---

## 10. Dependências (destaques)

**IA:** `@google/genai ^1.5.1`, `@google/generative-ai ^0.24.1` → remover na migração para Anthropic.

**Remover (sem uso / perigosas):** `i`, `npm`, `node-wav`.

**Fixar versão estável:** `next` e `eslint-config-next` (hoje `^14.2.0-canary.29`).

**Saudáveis / a manter:** stack Radix UI completa, `@supabase/supabase-js ^2.39.7` + `@supabase/auth-helpers-nextjs ^0.9.0` (helpers em descontinuação — avaliar `@supabase/ssr` na v2), `react-hook-form` + `zod` + `@hookform/resolvers` (Zod já está no projeto — aproveitar para validar saída de IA), `recharts` (gráficos de evolução), `framer-motion`, `date-fns`, `sonner`, `next-themes` (dark/light), `tailwindcss` + `tailwindcss-animate`.

---

## 11. Conclusões e recomendações (para a v2)

Prioridade decrescente:

1. **Reescrever o banco do zero, versionado por timestamp**, eliminando os 4 SQL avulsos. Consolidar o esquema real de `physical_assessments`/`diets`, criar **enums** para role/status/goal/level, adicionar `seed.sql` com catálogo de exercícios, e gerar os tipos TS. Mover `deletar-estruturas.sql` para fora do diretório de migrations.
2. **Tornar o Storage privado** (`public = false`) com **policies em `storage.objects`** por tenant/aluno e **URLs assinadas**; tratar fotos de avaliação como dado de saúde (LGPD). Adicionar consentimento e export/delete de dados do aluno.
3. **Migrar a IA para Supabase Edge Functions (Anthropic)**: `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` só no servidor, validação de JWT+role, **Zod** na saída, rate limit por usuário, timeout real, **tabela de log de uso/custo**, prompts versionados com dados do aluno isolados como dados (anti-injection), e fluxo **rascunho→aprovação** antes de o aluno ver dieta/treino.
4. **Reforçar auth/RLS**: gate por role no middleware (ou layout server-side), fechar `physical-assessments/analyze` atrás de auth, revisar cada rota `service_role` para garantir `tenant_id` em todas as queries, e **escrever testes de RLS** (sem vazamento entre professores).
5. **Higiene do repositório**: criar `.env.example`, remover `i`/`npm`/`node-wav`, fixar `next` estável, corrigir `diets/[id]/routes.ts → route.ts`, resolver o `userRole` hardcoded, remover `console.log` de produção, escrever `README.md`, decidir a estratégia Capacitor (embed vs. remote) e corrigir `cleartext`.
6. **Qualidade**: adicionar `typecheck` (`tsc --noEmit`), suíte de testes (Vitest/Playwright), e CI rodando lint+typecheck+testes.
7. **Completar meias-features** ou documentá-las em `docs/pendencias.md`: persistência de mensagens WhatsApp + verificação de assinatura, IA de avaliação postural, PWA/offline.

---

### Apêndice — evidências principais (arquivos citados)

- Stack/deps: `package.json`, `tsconfig.json`, `next.config.js`, `.eslintrc.json`, `components.json`.
- Auth/middleware: `middleware.ts`, `app/api/students/route.ts`, `app/api/auth/register/route.ts`.
- IA: `app/api/ai/generate-diet/route.ts`, `app/api/ai/exercise-suggestions/route.ts`, `app/api/ai/generate-audio/route.ts`, `app/api/physical-assessments/analyze/route.ts`.
- Banco: `supabase/migrations/20250531160855_ivory_summit.sql` (base + RLS + funções + triggers), `supabase/migrations/avaliacao.sql`, `dieta.sql`, `novo-dieta.sql`, `deletar-estruturas.sql`, `20250604175907_silent_salad.sql` (achievements), buckets em `20250531221005_bitter_swamp.sql`/`20250601020032_pale_brook.sql`/`20250601020520_nameless_sunset.sql`/`20250604171141_maroon_brook.sql`.
- WhatsApp/Webhooks: `app/api/whatsapp/webhook/route.ts`, `webhooks/service/index.ts`, `webhooks/notification-service/index.ts`.
- Mobile: `capacitor.config.json`, `lib/api-config.ts`, `hooks/useCapacitor.ts`.
- Dívida: `app/api/diets/[id]/routes.ts` (nome errado), `components/workouts/WorkoutsList.tsx` (TODO userRole), `anotações` (raiz).

*Observação: o conteúdo de fontes foi reescrito/resumido a partir da leitura direta dos arquivos do repositório; nenhum arquivo foi modificado durante a auditoria.*
