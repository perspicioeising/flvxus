# Pendências — Flvxus v2

Este arquivo registra o que ficou pendente e **por quê**, distinguindo claramente o que está
bloqueado por **ambiente** (infra ausente) do que está pendente por **código**.

## Fase 2 — Banco de dados

### Bloqueio de ambiente (NÃO é falta de código)

O ambiente de desenvolvimento atual (Windows) **não tem Docker**
(`docker --version` → `command not found`). O Supabase CLI local (`supabase` 2.117.0 está
instalado) depende de Docker para subir o stack, então **nenhuma** das etapas abaixo pôde ser
executada aqui. O **código SQL/TS está completo**; falta apenas aplicá-lo num ambiente com
Docker ou contra um projeto Supabase hospedado.

Pendente por ambiente:

- Aplicar as migrations e o seed de forma determinística (`supabase db reset`).
- Subir o stack local (`supabase start`).
- Executar o harness de RLS contra o banco real (`npm run test:rls`).
- Gerar os tipos TypeScript via CLI (`supabase gen types typescript --local`).
  Enquanto isso, `types/database.types.ts` está **escrito à mão** (com nota no topo) e deve ser
  **regenerado** assim que o CLI puder rodar.

### Comandos a rodar quando houver Docker / projeto Supabase (na ordem)

```bash
# A partir da raiz do worktree:
npx supabase start                 # sobe Postgres/Auth/Storage locais
npx supabase db reset              # aplica migrations + seed.sql do zero (determinístico)

# Verificar que o reset ocorreu sem erro e recriar os tipos a partir do banco:
npx supabase gen types typescript --local > types/database.types.ts

# Rodar a suíte de RLS (exporte as chaves locais impressas por `supabase status`):
export SUPABASE_URL="http://127.0.0.1:54321"
export SUPABASE_ANON_KEY="<anon key local>"
export SUPABASE_SERVICE_ROLE_KEY="<service_role key local>"
npm run test:rls                   # troque describe.skip -> describe em tests/rls/*.test.ts
```

> Ao habilitar o Docker, trocar `describe.skip` por `describe` em
> `tests/rls/rls.invariants.test.ts` para que a suíte execute de verdade contra o banco local.
> As chaves locais **nunca** devem ser commitadas.

### Verificação feita neste ambiente (sem Docker)

- Revisão manual cuidadosa de cada migration contra o contrato (`architecture.md` §5/§6/§7 e
  ADRs 0003/0004/0005), conferindo: 12 enums nativos; `physical_assessments` como superset
  único; RLS habilitado em todas as 23 tabelas de negócio; isolamento por `tenant_id` em toda
  policy; aluno só vê `workout_plans`/`diets` com `status='released'`; buckets `public=false`;
  índices exigidos (incl. GIN em `exercises.muscle_groups` e `created_at` em `ai_usage_logs`).
- Checagem de ordem/sintaxe dos arquivos de migration (ordem determinística por timestamp;
  dependências de FK respeitadas entre arquivos; policies por último, após todas as tabelas).
- Os checks executáveis que dependem de `vitest`/`tsc` instalados (`npm run test:rls`,
  `tsc --noEmit`) **não** foram rodados porque as devDependencies (`vitest`, `supabase`) foram
  apenas declaradas no `package.json`, não instaladas (evitando mexer em `node_modules` fora do
  escopo desta fase). Rodar após `npm install`.

## Fase 3 — Clientes @supabase/ssr (FEAT-002)

### Rotas v1 movidas para `app/_legacy-api/` (fora do roteamento)

Ao adotar o `@supabase/ssr` e remover `@supabase/auth-helpers-nextjs` e as libs de IA do
Google, **todas** as rotas de `app/api/*` da v1 passaram a quebrar o `next build` (usavam
`createRouteHandlerClient({ cookies })` do auth-helpers, `@google/generative-ai`, ou helpers
de `@/webhooks/*`). Em vez de reescrevê-las agora (isso é trabalho das Fases 4–6: áreas
professor/aluno e IA Anthropic), o diretório inteiro foi **movido para `app/_legacy-api/`**,
que fica **fora do App Router** (o Next não serve rotas sob uma pasta que não seja `app/api`).

- **Código morto preservado só como referência.** Nada em `app/_legacy-api/` é roteável nem
  entra no grafo de build das páginas. Serve de consulta ao reconstruir os endpoints na v2.
- **NÃO reativar.** Essas rotas usam Gemini (removido) e o `@supabase/auth-helpers-nextjs`
  (removido). Reativá-las quebra o build. Elas serão reescritas como Server Actions / Route
  Handlers novos (com `lib/supabase/{server,admin}.ts`) ou Edge Functions nas Fases 4–6.
- Diretório movido como unidade via `git mv app/api app/_legacy-api` (44 arquivos). Ver
  `app/_legacy-api/README.md`.

### Páginas client v1 migradas para o novo browser client

Três páginas client da v1 importavam `createClientComponentClient` do auth-helpers e teriam
quebrado o build; o import foi trocado por `createClient` de `lib/supabase/browser.ts`
(mesma API `auth`/`from`), sem mudar comportamento visível:

- `app/(auth)/set-password/page.tsx` (rota de auth ativa — fluxo de convite/magic link).
- `app/(dashboard)/dashboard/webhooks/new/page.tsx` (referência v1).
- `app/(dashboard)/dashboard/webhooks/[id]/edit/page.tsx` (referência v1; também ajustada para
  `params: Promise<...>` do Next 15, resolvido com `use()`).

### Fontes self-hospedadas (build determinístico, sem rede)

O `app/layout.tsx` da v1 usava `next/font/google` (Inter), que faz fetch ao Google Fonts no
build — isso quebra em ambientes atrás de proxy TLS (certificado self-signed) e deixa o build
dependente de rede. A Inter foi **self-hospedada** via `next/font/local` (decisão do usuário):
woff2 (latin 400/500/600/700) versionados em `app/fonts/` com `OFL.txt` (SIL OFL 1.1), origem
`@fontsource/inter` (devDependency). Ganhos: build determinístico/offline, melhor LCP e mais
aderência à LGPD (sem expor o IP do usuário ao Google). A variável `--font-sans` foi exposta
no `<html>` para o design system (FEAT-003) consolidar os tokens de tipografia sem re-tocar o
layout.

### Ainda pendente para as próximas FEATs (typecheck/build da cadeia)

Ajustes de tipo em componentes v1 já detectados pela FEAT-001 (fora do escopo da FEAT-002, que
cobre só os clientes Supabase e o middleware): `components/ui/calendar.tsx` (react-day-picker
v8→v9), `components/students/hooks/useSwipeGestures.ts` (RefObject dos @types/react 19),
`components/my-workouts/components/details/AllUserWorkoutsSection.tsx` (React.AwaitedReactNode
removido). Demais páginas v1 em `app/(dashboard)/.../page.tsx` podem exigir `params`/
`searchParams` como `Promise` (PageProps do Next 15) quando forem religadas.

## Fase 6 — IA Anthropic (FEAT-001: fundação)

### Bloqueio de ambiente — `deno check` / runtime Deno (NÃO é falta de código)

Os helpers compartilhados das Edge Functions (`supabase/functions/_shared/*.ts`) e os prompts
(`supabase/functions/_prompts/*.ts`) rodam em **Deno**, que **não está no PATH** deste ambiente
(e não há Docker para o `supabase functions serve`). Logo, `deno check` e o deploy das funções
são **bloqueio de ambiente**, não de código. O lado Next (schemas Zod + lógica pura) foi
totalmente verificado aqui.

Verificação executada neste ambiente (tudo verde):

- `npm run typecheck` — OK. O diretório `supabase/functions` foi **excluído** do `tsconfig.json`
  (como já era `app/_legacy-api`), pois é código Deno (imports com extensão `.ts`, `globalThis.Deno`)
  typechecado por `deno check`, não pelo `tsc` do Next.
- `npm run lint` — OK (só warnings pré-existentes de `react-hooks/exhaustive-deps`).
- `npm run build` — OK. Prova que **nada só-Deno vazou** para o bundle Next: os schemas Zod
  (`schemas/ia/`) são puros e a lógica pura importada pelos testes (`structured-output`,
  `rate-limit`, `logging`) não arrasta `Deno.*`.
- `npm run test` — 39 passam / 7 skipped (RLS). Novos testes de schema (bom/ruim) e de lógica
  pura (parsing+validação Zod com Anthropic FAKE, janela de rate limit, estimativa de custo)
  verdes; testes existentes seguem verdes.

Revisão estática dos helpers Deno (no lugar do `deno check`):

- `anthropic.ts`: `fetch` e leitor de env injetáveis; `tool_choice` força a saída estruturada;
  o `signal` do `AbortController` é **sempre** passado ao `fetch` (corrige o bug da v1); a chave
  **nunca** é logada; modelo vem de `ANTHROPIC_MODEL` (sem string fixa); retry limitado (2) +
  fallback amigável.
- `auth-guard.ts`: valida o JWT primeiro; só **depois** resolve papel/tenant via service_role;
  403 se não for `trainer`.
- `structured-output.ts` / `rate-limit.ts` / `logging.ts`: parte **pura** (parsing/validação,
  janela de rate limit, custo) separada dos efeitos (fetch/DB injetáveis) e coberta por Vitest.

Rodar quando houver Deno no PATH:

```bash
# A partir da raiz do worktree:
deno check supabase/functions/_shared/*.ts supabase/functions/_prompts/*.ts
```

### FEAT-002 — Edge Functions de rota (generate-diet / suggest-workout / analyze-assessment)

As três Edge Functions de rota e o runtime compartilhado foram adicionados:
`supabase/functions/{generate-diet,suggest-workout,analyze-assessment}/index.ts`
e `supabase/functions/_shared/handler.ts` (efeitos Supabase: client service_role,
verificação de JWT, consulta de perfil/consentimento, rate-limit, inserts/updates
em `ai_generations`, log de uso e preço por modelo). O `config.toml` ganhou as
seções `[functions.generate-diet|suggest-workout|analyze-assessment]` com
`verify_jwt = true`. Contratos, deploy e o ponto de integração com a UI estão em
`docs/ia.md`.

Verificação executada neste ambiente (tudo verde):

- `npm run typecheck` — OK (as rotas Deno seguem excluídas do `tsc`; são código
  Deno com imports `.ts`, `Deno.serve`/`Deno.env` e `npm:@supabase/supabase-js`).
- `npm run lint` — OK (só warnings pré-existentes de `react-hooks/exhaustive-deps`).
- `npm run build` — OK. Prova que **nada só-Deno vazou** para o bundle Next: as
  rotas de `professor/*` compilam normalmente e `handler.ts` (que importa
  `@supabase/supabase-js` no estilo Deno) não é arrastado para o grafo do Next.
- `npm run test` — 39 passam / 7 skipped (RLS). A lógica pura reaproveitada
  (parsing/validação Zod, janela de rate limit, custo) segue coberta e verde.

Revisão estática das rotas (no lugar do `deno check`, Deno fora do PATH):

- Ordem dos guarda-corpos idêntica nas três (CORS → auth-guard JWT+trainer →
  Zod de entrada → consentimento `ai_processing` → rate-limit/teto/timeout →
  `ai_generations` pending → Anthropic com dados como DADOS → Zod de saída →
  `ai_usage_logs` (sucesso OU falha) + `ai_generations` succeeded/failed → retorno).
- Nenhuma função materializa em `diets`/`workout_plans` (só rascunho em
  `ai_generations`). `weekly_adherence` NÃO foi implementado (adiado).
- `service_role` só é usado após o auth-guard validar JWT+papel; toda query
  carimba `tenant_id`. As colunas usadas conferem com `types/database.types.ts`
  (`ai_generations`, `ai_usage_logs`, `profiles`, `consent_records`,
  `physical_assessments`).

Bloqueio de ambiente (depende de Docker/Deno/projeto Supabase):

```bash
# Checagem de tipos Deno das rotas (quando houver Deno no PATH):
deno check supabase/functions/**/index.ts

# Subir/servir e testar end-to-end (quando houver Docker + projeto Supabase):
supabase functions serve generate-diet
supabase secrets set ANTHROPIC_API_KEY="..."       # nunca commitado
supabase secrets set ANTHROPIC_MODEL="claude-sonnet-<snapshot>"
supabase functions deploy generate-diet suggest-workout analyze-assessment
```

> O teste end-to-end real da IA depende de `ANTHROPIC_API_KEY` + deploy das
> funções — bloqueio de ambiente, não de código. Ver `docs/ia.md` para o passo a
> passo de deploy e o ponto de integração com a UI.

## Itens fora do escopo da Fase 2 (serão tratados nas fases seguintes)

- Renomear o pacote de `fitconnect-pro` para `flvxus` e subir Next 15/React 19 (ADR 0002) —
  Fase 3, para não misturar mudança de build com a reconstrução do banco.
- Edge Functions de IA (Anthropic), prompts versionados e schemas Zod (ADR 0001) — Fase 6.
- Front-end, design system e gate por papel nos layouts (§5.2) — Fases 3 a 5.

## Fase 3 — FEAT-004 (route groups, navegação, PWA, Capacitor)

### Service worker / offline (PWA) — pendente por escopo (ADR 0009)

Nesta fase o PWA se limita ao **manifest instalável** (`app/manifest.ts`). O **service worker /
cache offline** fica como esboço documentado, a ser implementado em fase posterior com a
abordagem nativa do Next ou um sucessor mantido (ex.: Serwist) — **não** `next-pwa` (ADR 0009).

Esboço de escopo do SW quando for implementado:

- **Cachear o app shell e assets estáticos** (HTML de rotas públicas, CSS/JS buildados, ícones,
  fontes self-hospedadas em `app/fonts/`) com estratégia _stale-while-revalidate_/_cache-first_
  para assets versionados.
- **NÃO cachear dados sensíveis** (respostas de avaliações, fotos, dietas, qualquer PII/dado de
  saúde) — exigência de **LGPD**. Requisições autenticadas ao Supabase/Edge Functions ficam
  sempre _network-only_.
- Registrar o SW só em produção e tratar atualização de versão (skipWaiting controlado) para não
  servir shell obsoleto.

### Capacitor — tensão `webDir: "out"` × export estático

O `capacitor.config.json` mantém `webDir: "out"` (valor herdado), mas o app **não** é exportado
estaticamente (`next.config.js` não usa `output: 'export'`; a v2 depende de RSC/Server Actions).
A estratégia (ADR 0007/0009) é o Capacitor empacotar o app **hospedado** via `server.url`
(`https://flvxus.com.br`, `cleartext: false`) — ou seja, o webview carrega a URL remota e o
`webDir` não é efetivamente usado para servir a aplicação. Pendências:

- Confirmar a URL hospedada por ambiente via `NEXT_PUBLIC_SITE_URL` (já consumida em
  `lib/api-config.ts`) e, quando houver pipeline de build nativo, decidir entre manter o
  `server.url` remoto (atual) ou gerar um shell mínimo em `out/` para o primeiro paint offline.
- Reavaliar `webDir` quando o SW existir (um shell cacheável pode tornar o `webDir` útil).

### Rotas v1 eventualmente movidas (referência cruzada)

As rotas de API da v1 foram movidas em **FEAT-002** para `app/_legacy-api/` (fora do roteamento),
documentadas acima nesta mesma página. A FEAT-004 não moveu rotas v1 adicionais; o
`app/(dashboard)/` permanece como referência das Fases 4-6. As novas áreas por papel vivem em
`app/(professor)/` e `app/(aluno)/`, com gate server-side em cada `layout.tsx` (§5.2).

## Escopo adiado da v2 (decisão do usuário — 2026-10-20)

Para focar o relançamento no **caminho crítico do produto** (alunos → avaliação física →
treino → área do aluno → geração de dieta com IA) e acelerar a conclusão, o usuário decidiu
**cortar/adiar da v2** os itens abaixo. Eles **não** serão implementados nas fases atuais e
ficam registrados aqui como **próximos passos**, a serem retomados depois (o usuário sinalizou
que avança com essa questão mais tarde). Nenhum deles muda o propósito do app; são incrementos.

| Item | Decisão | Observações para quando for retomado |
|------|---------|--------------------------------------|
| **Gamificação / conquistas** | Adiado | As tabelas `achievements`/`user_achievements` e `profiles.total_points`/`last_workout_date` JÁ existem no banco v2 (Fase 2), então a base de dados está pronta; falta apenas a UI e a função que concede conquistas ao fechar sessão de treino. Não construir telas de conquistas na v2 atual. |
| **Agenda / calendário** | Adiado | A tabela `appointments` (com RLS) JÁ existe no banco v2; falta a UI de agenda e, se desejado, lembretes. Não construir a tela de agenda agora. |
| **Resumo semanal de aderência por IA** | Adiado | Previsto no ADR 0001 como um dos usos de IA (`ai_job_type = weekly_adherence`). As demais funções de IA (gerar dieta, sugerir treino, analisar avaliação) seguem no escopo da Fase 6; apenas o resumo semanal fica para depois. |
| **PWA offline / service worker** | Adiado | Já era pendência por escopo (ADR 0009). O manifest instalável permanece; o service worker/cache offline fica para fase posterior, respeitando a regra LGPD de nunca cachear dado de saúde. |
| **WhatsApp** | Adiado (decisão anterior) | Reconstrução segura (verify token + verificação de assinatura `x-hub-signature-256`) fica para fase própria. O usuário já tem access token e phone number ID; o `WHATSAPP_VERIFY_TOKEN` é um valor que ele mesmo define. Variáveis já estão no `.env.example` em branco. |

**Impacto no plano de fases:** as Fases 5 (área do aluno), 6 (IA — dieta/treino/análise de
avaliação, sem o resumo semanal), 7 (testes/qualidade) e 8 (revisão final) seguem normalmente,
porém **sem** construir telas de gamificação, agenda, resumo semanal nem service worker. Esses
itens entram no `docs/REVISAO-FINAL.md` como "próximos passos sugeridos".

## Fase 4 — FEAT-003 (Avaliação Física)

### Lacunas de coluna em `physical_assessments` (contornadas via `measurements` jsonb)

O schema v2 de `physical_assessments` (migration `20261020090300_avaliacoes.sql`) tem colunas
dedicadas para as dobras `skf_triceps`, `skf_subscapular`, `skf_chest`, `skf_midaxillary`,
`skf_suprailiac`, `skf_abdominal` e `skf_thigh`, mas **não** para a dobra **bíceps**. O
protocolo **Durnin & Womersley** exige a dobra do bíceps (4 dobras: bíceps, tríceps,
subescapular, suprailíaca). Em vez de criar migration nova (fora do escopo desta fase, conforme
`context.json`/`plan.md`), a dobra do bíceps é gravada em `measurements` jsonb sob a chave
`skf_biceps` (gravação em `actions/avaliacoes.ts`, leitura no detalhe e na edição). Se no futuro
a precisão/consulta exigir coluna própria, adicionar `skf_biceps numeric` à tabela e migrar os
valores de `measurements`.

### Fotos de avaliação sem coluna/tabela dedicada

Não há coluna nem tabela para os **paths das fotos** de avaliação (o bucket privado
`assessment-photos` existe em `20261020090900_storage.sql`, mas a linha de
`physical_assessments` não referencia os arquivos). Os paths são persistidos em
`measurements.photos` (array de strings) pela action `uploadFotoAvaliacao`, e exibidos sempre
por **URL assinada** de TTL curto (`lib/storage.signAssessmentPhoto`), respeitando
`photos_consent` (LGPD). Caso se queira indexar/consultar fotos, considerar uma tabela
`assessment_photos` futura; por ora o jsonb atende sem nova migration.

### Upload de fotos ocorre após a criação da avaliação

O formulário multi-etapa cria a avaliação primeiro (precisa do `assessment_id` para montar o
path `{tenant}/{student}/{assessment}/...`) e, em seguida, envia as fotos selecionadas. Se o
upload de uma foto falhar, a avaliação **já foi gravada** — o professor vê um toast de erro e
pode reenviar pela tela de edição. Não há rollback transacional entre a linha e os objetos de
Storage (limitação do Storage do Supabase, fora do controle desta fase).
## Autenticação v2 — cadastro de professor religado ao trigger (FEAT-auth)

### `businessName` coletado no cadastro não vira nome do tenant

A tela `app/(auth)/register/page.tsx` foi religada à arquitetura v2: em vez do
`fetch('/api/auth/register')` (rota morta movida para `app/_legacy-api/` na Fase 3,
causando **404 em produção**), o cadastro agora usa
`supabase.auth.signUp({ email, password, options: { data: { full_name, business_name }, emailRedirectTo } })`
pelo browser client (`lib/supabase/browser.ts`), sem service_role. O trigger
`handle_new_user()` (migration `20261020090100_core_e_funcoes.sql`, `SECURITY DEFINER`)
cria o **tenant + profile(role='trainer')** automaticamente.

Limitação conhecida: o trigger lê **apenas** `full_name` de `raw_user_meta_data` e nomeia
o tenant com esse valor (`coalesce(full_name, 'Meu negócio')`). O campo **`business_name`**,
que a UI coleta, é enviado em `options.data` e fica **preservado em
`auth.users.raw_user_meta_data`**, mas **não** é usado para nomear o tenant hoje.

- **Decisão (sem migration nova):** manter o campo na UI (bom para UX e para dados futuros)
  e gravar `business_name` nos metadados. Não foi criada migration para não mudar o contrato
  do banco fora de escopo.
- **Quando for desejado usar `business_name` como nome do tenant:** alterar o
  `handle_new_user()` em **nova migration versionada** (timestamp `YYYYMMDDHHMMSS`) para ler
  `coalesce(new.raw_user_meta_data ->> 'business_name', new.raw_user_meta_data ->> 'full_name', new.email)`
  ao inserir em `public.tenants(name)`. Como o dado já está nos metadados, nenhuma reescrita de
  usuários existentes é necessária além do ajuste do trigger.

### Confirmação de e-mail (tela "verifique seu e-mail")

O cadastro trata os dois cenários sem depender de `config.toml` (que só vale em dev local):

- Se o `signUp` retorna **sessão** (confirmação de e-mail desligada no projeto hospedado),
  redireciona direto para `/professor`.
- Se retorna usuário **sem sessão** (confirmação habilitada), mostra a tela
  "verifique seu e-mail" com o endereço e um atalho para `/login`. O `emailRedirectTo`
  aponta para `/callback`, que já roteia por papel.

E-mail já cadastrado é tratado com mensagem amigável em pt-BR (sem vazar detalhes do erro).

### Login e demais telas de auth passaram a rotear por papel (fim das rotas mortas)

Login, callback e set-password apontavam para `/dashboard` / `/dashboard/student` (área v1).
Agora leem `profiles.role` e redirecionam para `/professor` (trainer) ou `/aluno` (student).
O gate definitivo continua server-side nos `layout.tsx` de cada área (`lib/auth`). Logout já
existe na navegação v2 (`components/navigation/*`) via `supabase.auth.signOut()` + `/login`;
`actions/auth.ts` também expõe uma Server Action `sair()` equivalente para uso server-side.

### Limiar de "avaliação vencida" fixo em 90 dias (não configurável por tenant)
O painel do professor (FEAT-005) considera vencida a última avaliação de um aluno ativo com mais
de **90 dias** (constante `DIAS_AVALIACAO_VENCIDA` em `components/professor/dashboard/index.ts`,
decisão em `docs/decisions/0010-painel-professor-avaliacao-vencida.md`). Tornar esse limiar
configurável por tenant exigiria uma nova coluna no schema v2 (ex.: `tenants.reassessment_days`),
fora do escopo desta fase. Caso se queira personalizar por personal, adicionar a coluna em
migration futura e ler o valor no RSC do painel.

## Configuração do Supabase Auth para convites

> **Esta seção é para você (dono do projeto).** O onboarding de aluno depende de
> configuração no **painel do Supabase** e do **domínio de produção** — coisas que
> moram fora do código e que **não dá para testar aqui**. O código já foi corrigido;
> falta conferir o painel conforme o passo a passo abaixo.

### Como o fluxo funciona agora (resumo)

1. O professor convida o aluno → o código chama `inviteUserByEmail` **com** `redirectTo`
   apontando para `${NEXT_PUBLIC_SITE_URL}/callback?next=/set-password`
   (`actions/alunos.ts`, via `lib/site-url.ts`).
2. O aluno recebe o e-mail de convite do Supabase e clica no link.
3. O link cai em **`/callback`** (route handler server-side, `app/(auth)/callback/route.ts`),
   que troca o `?code=...` por uma sessão (cookies) com `exchangeCodeForSession`.
4. Como o destino é `set-password`, o aluno é encaminhado para **`/set-password`**, onde a
   sessão já existe e ele apenas define a senha (`updateUser`). O perfil vira `active` e ele
   entra em `/aluno`.

### O que conferir no painel (Authentication > URL Configuration)

No painel do seu projeto Supabase, em **Authentication → URL Configuration**:

1. **Site URL**: defina a URL base do app em produção, por exemplo
   `https://flvxus.vercel.app`. É para onde o Supabase manda o usuário quando um link
   **não** traz `redirectTo`.
2. **Redirect URLs** (lista de URLs permitidas): adicione as URLs de callback usadas pelo
   código. Elas precisam **casar exatamente** com `${NEXT_PUBLIC_SITE_URL}/callback`. Inclua:
   - Produção: `https://flvxus.vercel.app/callback`
   - Desenvolvimento local: `http://localhost:3000/callback`
   - Se preferir liberar os destinos com query, pode usar curingas suportados pelo Supabase,
     ex.: `https://flvxus.vercel.app/callback*` e `http://localhost:3000/callback*`.
   Se a Redirect URL **não** estiver nessa lista, o Supabase **ignora** o `redirectTo` do
   convite e manda o aluno para a Site URL raiz — exatamente o bug que travava o onboarding.

### Variável de ambiente

- `NEXT_PUBLIC_SITE_URL` precisa estar definida **no ambiente de produção** (ex.: Vercel) como
  `https://flvxus.vercel.app`. Em desenvolvimento, o fallback é `http://localhost:3000`
  (`lib/site-url.ts`). O domínio de produção **não** é hardcodado no código: ele vem
  exclusivamente dessa variável.

### Template de e-mail de convite

- Em **Authentication → Email Templates → Invite user**, o template deve usar
  `{{ .ConfirmationURL }}`. Essa variável respeita o `redirectTo` passado em
  `inviteUserByEmail`, então o link do e-mail já aponta para o `/callback` correto. Não é
  preciso montar a URL de callback manualmente no template.

### Por que não dá para testar o e-mail aqui

O envio real do e-mail de convite depende do projeto Supabase hospedado, do provedor de SMTP
configurado e do domínio de produção. Nada disso roda no ambiente de build/CI local. Portanto,
a validação de ponta a ponta (receber o e-mail e clicar no link) precisa ser feita por você,
em produção/staging, após conferir os itens acima. As verificações automáticas aqui cobrem
`typecheck`, `lint`, `build` e os testes de unidade.

## Upload de vídeo de exercício — upload direto ao Storage (APLICADO)

O upload de vídeo/thumbnail de exercício (área do professor) passava pela Server Action e
estourava o limite de corpo (na prática ~10 MB no ambiente hospedado, independentemente do
`bodySizeLimit` do Next).

**Correção aplicada — upload DIRETO ao Supabase Storage via *signed upload URL*:** o arquivo não
trafega mais pela Server Action. O fluxo é:

1. O cliente valida tamanho/tipo e pede a URL assinada à Server Action leve
   `criarUploadUrlMidiaExercicio` (`actions/exercicios.ts`), que só recebe metadados
   (nome/tamanho/tipo), revalida no servidor, deriva o `path` DETERMINÍSTICO
   (`{tenant_id}/{exercise_id}/{kind}-{arquivo}`) e emite `createSignedUploadUrl`.
2. O cliente (`components/professor/exercicios/exercise-media-upload.tsx`) envia o arquivo DIRETO
   ao bucket privado `exercise-videos` via `uploadToSignedUrl`.
3. A Server Action `confirmarMidiaExercicio` persiste o `path` em `video_url`/`thumbnail_url`
   (revalidando o prefixo esperado — defesa contra path arbitrário/cross-tenant).

A exibição continua por **URL assinada no RSC** (`signExerciseMedia`), com o path no mesmo
esquema de antes — nada mudou na leitura. O bucket segue **PRIVADO** e o isolamento de tenant é
garantido pela RLS do Storage.

**Limites:** vídeo até **50 MB**; thumbnail/imagem até **5 MB** (constantes centralizadas em
`lib/storage`). Validados no cliente (antes de pedir a URL) **e** no servidor (ao emitir a URL).

**Teto do bucket (aplicar no Supabase):** o teto de tamanho de arquivo é do bucket no Supabase,
não do Next. A migration `supabase/migrations/20261023090000_exercise_videos_file_size_limit.sql`
define `file_size_limit = 52428800` (50 MB) de forma idempotente, sem alterar `public`. **Você
aplica** essa mudança no ambiente Supabase (via `supabase db push`/`db reset` ou pelo painel:
Storage → `exercise-videos` → file size limit). O `bodySizeLimit` do Next foi reduzido para
`4mb` (cobre só os demais FormData pequenos das actions) — o vídeo não depende mais dele.

## Fase 5 (área do aluno) — interrompida por limite de uso

O workflow da Fase 5 foi interrompido no meio (FEAT-002) por "Usage limit reached" — **não** foi
erro de código. A **FEAT-001** (fundação da área do aluno + tela de Início) ficou pronta e
commitada na branch `feat/v2-aluno` (commit `0f22dd0`). Faltam reexecutar: FEAT-002 (Treinos +
Execução), FEAT-003 (Dieta + Evolução + Avaliações) e FEAT-004 (Perfil + LGPD), mais a
convergência e o rebase. O trabalho será retomado a partir da branch existente.

## LGPD adiado por decisão do usuário (v2-execucao-ia — FEAT-003)

Durante a Fase de execução IA↔UI, o usuário decidiu **adiar o LGPD/consentimento**, que estava
atrapalhando o uso do app (erros nas queries de LGPD derrubavam a tela de perfil inteira, e a
dependência de consentimento travava a geração por IA). A FEAT-003 removeu o LGPD da UI do aluno
e da IA. **Esta decisão de escopo diverge do `docs/decisions/0012-lgpd-aluno.md` (LGPD do
aluno)** — o ADR permanece como está (não foi reescrito); esta seção registra a divergência.

### O que foi removido

- **UI do aluno (`app/(aluno)/aluno/perfil/page.tsx`):** o perfil **não** consulta mais
  `consent_records` nem `data_requests`, e **não** renderiza mais os controles de LGPD. A tela
  ficou simples: card de **Dados pessoais** (`PerfilForm` → `atualizarPerfil`) + **logout** (o
  logout vive no `AppShell`/navegação do aluno — `components/navigation/*`). Isso também deixou o
  perfil mais robusto: um erro nas queries de LGPD não derruba mais a página.
- **Componente `components/aluno/perfil/lgpd-controles.tsx`:** removido do repositório (não há
  mais import órfão no app).
- **Actions `registrarConsentimento`/`solicitarDados` em `actions/perfil.ts`:** removidas (não
  eram usadas por mais nada). Os **schemas** `registrarConsentimentoSchema`/`solicitarDadosSchema`
  em `schemas/perfil.ts` permanecem (ainda cobertos por `tests/unit/schemas-perfil.test.ts`),
  sem uso na UI.
- **Edge Functions (IA):** a checagem de consentimento `ai_processing` foi removida das **3
  modulares** (`supabase/functions/{generate-diet,suggest-workout,analyze-assessment}/index.ts`
  e o runtime `supabase/functions/_shared/handler.ts` — tiramos `hasAiConsent` e
  `resolveAssessmentStudent`, que só serviam ao consentimento) e das **3 inline**
  (`supabase/functions-inline/*.ts`). As versões inline e modular ficaram **sincronizadas**. Em
  cada ponto ficou o comentário **"consentimento removido por decisão de escopo; reintroduzir se
  LGPD voltar"**. Todos os demais guarda-corpos permanecem (JWT+trainer, Zod de entrada,
  rate-limit/teto/timeout, `ai_generations` pending, Anthropic, Zod de saída, `ai_usage_logs`,
  rascunho→aprovação). O `supabase/functions-inline/README.md` foi ajustado para refletir que o
  consentimento não é mais exigido.

### O que NÃO foi feito (de propósito)

- As tabelas `consent_records` e `data_requests` **NÃO** foram dropadas — continuam no banco,
  sem uso. Nenhuma migration nova foi criada.

### Como reativar o LGPD (passo a passo)

1. **UI do aluno:** reintroduzir `components/aluno/perfil/lgpd-controles.tsx` (recuperável do
   histórico git) e, em `app/(aluno)/aluno/perfil/page.tsx`, voltar as queries a `consent_records`
   e `data_requests` e a renderização de `<LgpdControles>`.
2. **Actions:** recriar `registrarConsentimento`/`solicitarDados` em `actions/perfil.ts`
   (os schemas já existem em `schemas/perfil.ts`).
3. **Edge Functions:** reintroduzir o bloco de consentimento `ai_processing` nas 3 modulares e
   nas 3 inline (restaurar `hasAiConsent`/`resolveAssessmentStudent` no `_shared/handler.ts`),
   no ponto marcado pelo comentário de reintrodução, mantendo inline↔modular em sincronia.
4. Conferir o restante da pendência de processamento de export/exclusão (abaixo) e o
   `docs/decisions/0012-lgpd-aluno.md`.

## Fase 5 — FEAT-004 (Perfil + LGPD): processamento de export/exclusão

> **Nota (FEAT-003):** o LGPD do aluno foi **adiado** (ver a seção "LGPD adiado por decisão do
> usuário" acima). A descrição abaixo reflete o estado **anterior** da tela e fica como
> referência para quando o LGPD for reativado.

A tela de Perfil do aluno (`app/(aluno)/aluno/perfil/page.tsx`) já permite ao aluno editar os
próprios dados (`atualizarPerfil`), registrar/revogar consentimentos (`consent_records`,
append-only) e **abrir** solicitações de exportação/exclusão (`data_requests`, `status =
'requested'`), além do logout. Decisão em `docs/decisions/0012-lgpd-aluno.md`.

O **processamento efetivo** das solicitações **não** foi implementado nesta fase (é pendência,
não falta de UI): exige uma rotina de backend com **service_role** (fora do contexto do aluno)
que leia `data_requests` com `status = 'requested'` e:

- **Export:** monte o pacote de dados do titular no bucket privado `data-exports`, grave o
  `export_path` e avance o status `requested → processing → completed` (entregando por URL
  assinada de TTL curto).
- **Delete:** execute a exclusão/anonimização (respeitando cascatas e dados de terceiros) e
  avance o status para `completed`/`rejected`.

A policy de `update` de `data_requests` não libera o titular, então só o sistema/service_role
avança o status — coerente com o ADR 0012. Enquanto a rotina não existe, as solicitações ficam
registradas e visíveis ao aluno com status `Solicitado`.

## Testes: excluir `.worktrees/` da suíte (ruído)

O Vitest da `main` está varrendo também `.worktrees/**`, duplicando testes e carregando arquivos
de branches em progresso (causa falsos "0 test"/falhas que não são da main). Ajustar o
`vitest.config.ts` para ignorar `.worktrees/**` na fase de qualidade (Fase 7).

## Domínio oficial e a URL que "volta sozinha" no Supabase

**Domínio oficial escolhido pelo usuário:** `https://flvxus.vercel.app`.

O projeto tem dois domínios na Vercel apontando para o mesmo app:
`https://flvxus.vercel.app` (oficial) e `https://flvxus-perspicioeising.vercel.app` (domínio
canônico gerado pela Vercel para o projeto).

**Sintoma relatado:** ao remover/salvar a Site URL no Supabase, ela **volta sozinha** depois.

**Causa:** a integração oficial **Supabase ↔ Vercel** sincroniza automaticamente as
Auth Redirect URLs / Site URL com o domínio do deploy da Vercel a cada deploy. Por isso a URL
reaparece mesmo após ser removida manualmente — não é bug, é a integração reescrevendo o valor.

**Como fixar `flvxus.vercel.app` como oficial (passos no painel — ação do usuário):**

1. **Desligar a sincronização automática** para parar de brigar com ela. Em uma destas vias:
   - Vercel → Project → **Settings → Integrations** → integração do Supabase → desabilitar a
     sincronização de "Auth Redirect URLs" (ou remover a integração se não for usada para mais
     nada), **ou**
   - Supabase → **Integrations** → integração Vercel → desconectar a parte de Auth URLs.
2. **Vercel → Settings → Environment Variables** (ambiente Production):
   `NEXT_PUBLIC_SITE_URL = https://flvxus.vercel.app` e `NEXT_PUBLIC_API_URL = https://flvxus.vercel.app`.
   Refazer o deploy depois de salvar.
3. **Supabase → Authentication → URL Configuration**:
   - **Site URL**: `https://flvxus.vercel.app`
   - **Redirect URLs**: `https://flvxus.vercel.app/callback*` e `http://localhost:3000/callback*`.
4. (Opcional) Se quiser manter a integração ligada, a alternativa é aceitar o domínio
   `flvxus-perspicioeising.vercel.app` como oficial e setar `NEXT_PUBLIC_SITE_URL` nele — aí a
   integração e o código concordam e a URL não "volta" porque já está correta.

> O código não tem domínio hardcoded: tudo vem de `NEXT_PUBLIC_SITE_URL` (`lib/site-url.ts`).
> Basta alinhar essa variável, as Redirect URLs do Supabase e (se for o caso) desligar a sync.

## Segredo versionado por engano: CRON_SECRET (corrigido)

O `.env.example` continha um `CRON_SECRET` com valor REAL (hash de 64 chars), que foi commitado
no commit `887cc04` e empurrado ao GitHub. Já foi **restaurado para placeholder**. Como as rotas
de cron ainda não foram religadas na v2 (vivem em `app/_legacy-api/`, desativadas), o impacto
prático atual é nulo. **Recomendação:** ao reativar as rotas de cron (fase futura), gerar um
CRON_SECRET novo e usar só no `.env.local`/variáveis da Vercel — nunca no `.env.example`.
O mesmo cuidado vale para a ANTHROPIC_API_KEY (essa foi corrigida antes de qualquer commit).

## Fase 5 — Convergência/Integração da área do aluno (verificação estática)

Na convergência das FEAT-002/003/004 a suíte completa do worktree rodou verde e as costuras
entre as três FEATs foram conferidas estaticamente. **O que ficou garantido** (verificação
estática/compilação, não visual):

- **Gate de papel único:** `requireRole('student')` vive só em `app/(aluno)/layout.tsx`; nenhuma
  página do aluno repete o gate. As páginas que precisam do usuário usam `getSessionUser()`
  (início e perfil), como manda o contrato.
- **Imports compartilhados resolvem** (typecheck + build): `lib/semana`, `lib/datas`,
  `lib/treino/aderencia`, `lib/dieta/totais`, `lib/storage`, `components/patterns`,
  `components/ui/*` e o **reuso cross-área** de `components/professor/avaliacoes/evolucao-series`
  pela tela de Evolução (FEAT-003 consumindo lógica da Fase 4 sem duplicar).
- **Rotas do `app/(aluno)`:** as 9 rotas (`/aluno`, `/aluno/treinos`, `/aluno/treinos/[id]`,
  `/aluno/execucao`, `/aluno/execucao/[planId]`, `/aluno/dieta`, `/aluno/evolucao`,
  `/aluno/avaliacoes`, `/aluno/perfil`) compilam como dinâmicas (`ƒ`) e o menu
  (`studentNav` em `components/navigation/nav-items.ts`) aponta para as 6 rotas de topo.
- **Invariante "só liberado":** `status='released'` é filtrado explicitamente em treinos, dieta e
  execução, e reforçado em `actions/execucao.ts` (recusa plano não liberado) — além do RLS.
- **Sem `service_role` no fluxo do aluno:** leituras por `lib/supabase/server` (RSC, RLS ativo) e
  mutações (`actions/execucao.ts`, `actions/perfil.ts`) sempre no contexto do próprio aluno.
- **Fotos sob consentimento:** a tela de avaliações só assina/exibe fotos quando
  `photos_consent = true`, por URL assinada de TTL curto.
- **Scroll do AppShell preservado:** nenhum wrapper novo do aluno usa `h-screen`/`100vh`/
  `overflow-y`/`overflow-auto` de página; o scroll continua vivendo só no `<main>`
  (`h-[100dvh]` + `min-h-0`). Os poucos `overflow-hidden` são em miniaturas de imagem (recorte),
  não em contêineres de rolagem de página.

**O que NÃO é garantido nesta convergência:**

- **Verificação visual:** não há garantia visual. O build/typecheck/lint/test confirmam que o
  código compila, tipa e passa nos testes, mas **não** renderizam as telas num navegador real
  (não rodamos `next dev`). Layout, contraste e comportamento tátil mobile-first (alvos ≥44px, mão
  suada durante o treino) precisam de inspeção manual em dispositivo.
- **Teste de fluxo real do aluno (iniciar/registrar treino no celular):** depende de **dados
  liberados por um professor** (`workout_plans`/`diets` com `status='released'`,
  `physical_assessments`, etc.) num **Supabase real**, com RLS e sessão de aluno autenticada. Sem
  isso, as telas mostram corretamente o `EmptyState` ("nada liberado"), mas o caminho completo
  — iniciar sessão, registrar série a série, timer de descanso, finalizar — só pode ser exercido
  de ponta a ponta contra um banco com dados reais e o par professor↔aluno configurado.
- Os testes de **RLS** (`tests/rls/*`) continuam **skipados** neste ambiente por falta de
  Docker/projeto Supabase local (ver seções da Fase 2); a garantia de isolamento por RLS
  permanece como pendência de ambiente, não de código.

## Melhoria a implementar: ficha por DIVISÃO (A/B/C), multi-modelo

**Decisão do usuário (2026-10-20):** ao criar uma ficha a partir de modelos, o professor
deve poder **selecionar VÁRIOS modelos** (ex.: Treino A + Treino B + Treino C), e cada modelo
vira uma **DIVISÃO** da ficha (A, B, C...), **sem dia da semana fixo**. O aluno escolhe qual
divisão treina quando vai à academia (mais flexível que amarrar a seg/qua/sex).

Estado atual: `CriarDeModelo` (`components/professor/treinos/criar-de-modelo.tsx`) só aceita
UM modelo via `Select` único; os itens da ficha usam `weekday` (0-6).

Design a implementar (DEPOIS de integrar o workflow de execução/gamificação/IA, para não
conflitar — aquele workflow mexe em treinos/execução):

1. **Modelo de dados:** o conceito de "divisão" (A/B/C) não é dia da semana. Opções:
   (a) adicionar coluna `division text` (ou `division_label`) em `workout_plan_items` via
   migration versionada, mantendo `weekday` como opcional/legado; ou (b) reinterpretar a
   ficha em blocos. Preferir (a): rótulo de divisão explícito (ex.: "A", "B", "C" ou o nome
   do modelo de origem). Decidir e registrar em ADR.
2. **UI de criação:** trocar o `Select` único por seleção MÚLTIPLA de modelos (checkbox/lista),
   definindo a ordem/rótulo de cada divisão. `criarFichaDeModelo` (`actions/treinos.ts`) passa
   a aceitar uma lista de modelos e copiar os itens de cada um carimbando a divisão.
3. **Execução do aluno:** o seletor da tela de execução passa a ser por DIVISÃO (A/B/C), não
   por dia da semana. Alinhar com a FEAT-001 (que corrigiu o "preso ao dia atual").
4. **Seeds:** atualizar `seed-treinos-modelo.sql` (a ficha ABC de teste) para o novo modelo
   de divisão quando ele existir.

Impacto: toca treinos (professor) + execução (aluno) + possível migration. Fazer como fase
própria, com revisão.

## Execução — alunos legados com tenant divergente (FEAT-001)

A correção do trigger `handle_new_user()` (migration `20261020120000_fix_handle_new_user_convite_aluno.sql`)
garante que todo aluno convidado **depois** dela nasce com o **tenant e o trainer corretos do
professor** — a Server Action `convidarAluno` cria o `profile` com `role='student'` e o
`tenant_id` do professor, e o trigger não cria mais um tenant próprio para o aluno. Esses alunos
executam o treino normalmente: o `with check` de `workout_sessions_insert`
(`tenant_id = app_tenant_id() AND student_id = auth.uid()`) passa, porque o `app_tenant_id()` do
aluno é o mesmo tenant da ficha liberada.

**O caso pendente são os alunos LEGADOS** — convidados **antes** daquela migration, quando o
trigger antigo criava um tenant próprio para o aluno (role nascia como `trainer`, colidindo com
o `profile 'student'` da action). Esses alunos podem ter ficado com **tenant divergente** do
professor. Para eles, ao tentar **iniciar uma sessão de treino**, o `with check` de
`workout_sessions_insert` **falha**, porque o `app_tenant_id()` do aluno não bate com o
`tenant_id` carimbado na sessão/ficha. O sintoma é não conseguir iniciar o treino mesmo com ficha
liberada.

**Recomendação (ação do dono do projeto, fora do código):**

- **Recriar os alunos legados afetados**: remover o convite/usuário legado e convidá-lo de novo
  pela tela do professor (que agora usa o trigger corrigido), para que ele nasça com o tenant e o
  trainer corretos. É o caminho mais seguro e sem efeitos colaterais de dados.
- **NÃO aplicar correção automática de dados** no fluxo do aluno e **NÃO usar `service_role`** em
  nenhuma Server Action/RSC do aluno para "consertar" o tenant em runtime — isso violaria o
  isolamento por tenant e o contrato (`service_role` jamais no fluxo do aluno).
- Se no futuro for preciso migrar os legados em massa, fazer via **migration/rotina
  administrativa** dedicada (com `service_role`, fora do app do aluno), realinhando
  `profiles.tenant_id`/`trainer_id` dos alunos ao tenant do professor que os convidou — com
  cuidado para não quebrar FKs de sessões/logs já existentes.

Como não há Docker/projeto Supabase local aqui, a confirmação de quais alunos estão divergentes e
a recriação precisam ser feitas no projeto hospedado pelo dono.

## Convergência v2 (execução + gamificação + IA + remoção do LGPD)

### Estado real da verificação na convergência (corrige notas "tudo verde" das fases anteriores)

As notas antigas de FEAT-001/FEAT-002 acima dizem que `npm run typecheck` e `npm run build`
estavam "OK". Isso **não vale mais** para o branch inteiro na convergência — foram observações
pontuais do momento em que cada fase foi escrita. Sinal de verificação confiável desta fase
(conforme combinado): **`npm run test` verde + nenhum erro NOVO de `tsc` nos arquivos tocados.**

- `npm run test` — **verde**: 219 passam / 7 skipped (RLS). Único sinal confiável aqui.
- `npm run typecheck` — **falha com erros PRÉ-EXISTENTES, fora do escopo desta convergência**:
  - Resolução do Zod 3.25 pelo `tsc` (`moduleResolution: bundler`): todos os `schemas/*.ts`
    acusam `Property 'string'/'object'/... does not exist` e `Namespace ... has no exported
    member 'infer'` apontando para `node_modules/zod/dist/types/v3/external`. É condição de
    **ferramenta/ambiente** (o Vitest resolve o Zod em runtime e por isso os testes passam), não
    um defeito introduzido pelas FEATs. Mexer nisso exigiria tocar `tsconfig.json`/`node_modules`
    — fora do escopo de costura entre FEATs.
  - Código só-Deno (`supabase/functions-inline/*.ts`, `supabase/functions/_shared/structured-output.ts`):
    `Cannot find name 'Deno'`, `Cannot find module 'npm:...'` — esperado (typechecado por
    `deno check`, não pelo `tsc` do Next).
  - Legado: `actions/treinos.ts` (ex.: `item` implícito `any`) e testes `schemas-auth`/
    `schemas-avaliacao`/`ia/anthropic-parsing`.
- `npm run build` — falha em `actions/treinos.ts:134` (`Parameter 'item' implicitly has an 'any'
  type`), legado fora do escopo. Um build 100% limpo depende dessa 1 linha (opcional, não tocado
  nesta convergência para não misturar com a costura entre FEATs).

### Costura corrigida — seletor de dia da execução travava no deep-link `?dia`

A página `app/(aluno)/aluno/execucao/[planId]/page.tsx` pré-filtrava os itens pelo `?dia` da URL
e passava **só os daquele dia** para o Client `SessaoExecucao`. Como o seletor de dia
(`SeletorDia`) se esconde quando há ≤ 1 dia, um aluno que entrava pelo atalho da ficha
(`dia-lista.tsx`/`ficha-card.tsx` geram `/aluno/execucao/{id}?dia=N`) ficava **preso naquele
dia**, sem conseguir trocar de divisão num plano com vários dias.

Correção: a página agora passa **sempre todos os itens** da ficha e encaminha o dia pedido como
`diaInicial` (nova prop opcional de `SessaoExecucao`). O Client abre no dia do deep-link quando
ele tem itens e, caso contrário, no primeiro dia com exercícios — mantendo a troca de dia livre
pelo seletor. Sem mudança de comportamento para quem entra sem `?dia`.

## Liberação programada de treinos (cron diário)

O professor pode **programar a liberação** de uma ficha ao aluno por **data fixa** ou por
**prazo em dias**, além de **liberar agora**. Uma ficha agendada é `status='draft'` +
`scheduled_release_at` preenchida (invisível ao aluno pela RLS atual — nada mudou na RLS). Um
**cron diário** (`/api/cron/liberar-treinos`, 06:00 UTC via `vercel.json`) lê as fichas vencidas
(`scheduled_release_at <= now()` e `status='draft'`), cross-tenant via `service_role`, e as
transiciona para `released` + `released_at`. A UI do professor vive em
`components/professor/treinos/agendar-liberacao.tsx` (inputs nativos, zero dep nova) e o selo
"Agendada para DD/MM" aparece nas listagens.

### Atalho deliberado `draft → released` (fora da máquina de transições)

Tanto "liberar agora" (`programarLiberacao(…,{modo:'agora'})`) quanto o cron escrevem
`status='released'` **direto**, SEM passar por `alterarStatusFicha`/`transicaoPermitida`. Isso é
intencional: `TRANSICOES_STATUS['draft']` **não** inclui `'released'` (o fluxo normal é
`draft → pending_review → approved → released`), então validar a transição faria o cron nunca
liberar nada. Agendar/liberar é a decisão antecipada do professor de dispensar a revisão para
aquela ficha. `TRANSICOES_STATUS` **não** foi alterada (o bypass fica restrito ao caminho de
agendamento). Idempotência: o filtro `status='draft'` garante que uma ficha já liberada nunca é
reprocessada.

### Bloqueio de ambiente (NÃO é falta de código)

- **Migration** `supabase/migrations/20261021098000_liberacao_programada.sql` (aditiva/nullable:
  coluna `workout_plans.scheduled_release_at` + índice parcial; não toca enums/RLS) precisa ser
  **aplicada à mão** (ambiente sem Docker — ver a seção "Fase 2" acima).
- **`types/database.types.ts`** foi editado à mão (coluna `scheduled_release_at` em
  Row/Insert/Update de `workout_plans`) e deve ser **regenerado** quando o CLI puder rodar
  (`supabase gen types`).
- **Cron real** depende do deploy na **Vercel** + variável **`CRON_SECRET`** configurada no
  ambiente; não roda no CI. A rota é **endurecida**: sem `CRON_SECRET` configurado, responde
  **401** (nunca "abre" sem segredo).

### Teste manual do endpoint (quando houver deploy + `CRON_SECRET`)

```bash
# Em produção (Vercel chama com este header derivado do CRON_SECRET do projeto):
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  https://<deploy>/api/cron/liberar-treinos

# Local (com a env setada e `next dev` rodando):
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/liberar-treinos
```

A lógica decisória (elegibilidade, agrupamento por tenant, resolver prazo→data, validação Zod e
`formatarDataBr`) é 100% coberta por testes puros em `tests/unit/liberacao.test.ts` — o que roda
no CI. A aplicação da migration e a execução real do cron são bloqueio de ambiente.
