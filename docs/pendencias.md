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
