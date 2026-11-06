# Billing (Stripe) + multi-trainer — Fase 3

> **Atualização (trial + checkout pela landing):** o **trial de 14 dias é controlado pelo app**
> (sem cartão, sem `trial_period_days` da Stripe) e, após o prazo, a conta fica em **SOMENTE
> LEITURA** (consulta, sem criar/editar/executar) até assinar. Veja a seção **"Trial, somente
> leitura e checkout pela landing"** no fim deste documento, com o **checklist do que você faz no
> ambiente** e o **roteiro de teste end-to-end**. Onde esta página disser que a fonte de verdade do
> price é `plans.stripe_price_id`, leia `plans.stripe_price_id_monthly` / `stripe_price_id_yearly`
> (uma linha por tier; a coluna legada `stripe_price_id` não é mais usada pelo checkout).

> **Atualização (reta final):** o modelo comercial atual é de três planos voltados ao público
> final — **Individual**, **Personal** e **Assessoria** — com **trial de 14 dias** e **franquia de
> uso de IA** por plano (ver `docs/roadmap-reta-final.md` §B2–B3 e `docs/visao-geral-funcionalidades.md`).
> O naming interno `solo`/`team`/`gym` e o limite `max_affiliates` descritos abaixo seguem
> descrevendo a **mecânica interna** introduzida na Fase 3 (por número de filiados) e a integração
> com Stripe/webhook continua **válida**. Esta nota só esclarece o mapeamento comercial; a mecânica
> de checkout/webhook/enforcement abaixo não muda.

Este documento cobre a configuração de billing via Stripe (modo TEST/sandbox) e a hierarquia
master/filiado introduzidas na Fase 3. Chaves de produção, preços comerciais e os produtos/preços
reais no painel do Stripe **ficam a cargo do usuário** — o código entra pronto com placeholders.

## Visão geral

- Um personal **MASTER** (dono do tenant, com assinatura paga) cadastra personais **FILIADOS**
  sob o MESMO tenant. O filiado continua `role='trainer'` (distinção por `profiles.is_tenant_master`).
- A **cobrança é só do master**; filiados não pagam. A assinatura é **por tenant**
  (`subscriptions`, PK = `tenant_id`).
- Os **planos (tiers)** são definidos por NÚMERO DE FILIADOS (`plans.max_affiliates`).
- O **limite de filiados** é reforçado no BACKEND pela RPC `can_add_affiliate()` — nunca só na UI.
- A **visibilidade por módulo** (Alunos, Treinos, Avaliações, Dietas, Exercícios) é controlada
  pelo master em Configurações; a RLS é condicional a essa config (ver `tests/rls/README.md`).

## Variáveis de ambiente (Stripe)

Defina em `.env.local` (NUNCA commitado). Veja placeholders em `.env.example`.

| Variável | Descrição | Exemplo (TEST) |
|---|---|---|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (modo TEST). Server-only. | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Segredo de assinatura do endpoint de webhook. | `whsec_...` |
| `NEXT_PUBLIC_SITE_URL` | Já existente; usada em `success_url`/`cancel_url` do checkout. | `http://localhost:3000` |

Nenhuma dessas chaves tem prefixo `NEXT_PUBLIC_` (exceto a URL do site) — segredos nunca vão ao
bundle do cliente. As chaves de **produção** (live mode) e os valores reais são definidos pelo
usuário; a Fase 3 opera em modo TEST.

Os **price IDs** NÃO ficam em env: a fonte de verdade é a tabela `plans`
(`stripe_price_id_monthly` / `stripe_price_id_yearly`), semeada pela migration
`20261105090100_plans_stripe_price_ids_seed.sql` e editável em runtime sem redeploy.

## Configurar planos, limites e price IDs

A migration `20261022090500_billing_plans_subscriptions.sql` cria a tabela `plans` com seed de
PLACEHOLDERS (com `TODO(comercial)`):

| tier | name | max_affiliates | stripe_price_id |
|---|---|---|---|
| `solo` | Solo | `0` (só o master) | `null` |
| `team` | Equipe | `5` (placeholder) | `null` |
| `gym` | Academia | `null` (ilimitado, placeholder) | `null` |

Semântica de `max_affiliates`: `NULL` = **ilimitado**; `0` = **Solo** (nenhum filiado); `N` = até N.

Para colocar em produção (depois de criar os produtos/preços no painel do Stripe, modo TEST):

```sql
-- Ajuste os limites comerciais e cole os price IDs do painel do Stripe.
update public.plans set max_affiliates = 5,    stripe_price_id = 'price_...' where tier = 'team';
update public.plans set max_affiliates = null, stripe_price_id = 'price_...' where tier = 'gym';
-- Solo normalmente não tem price (0 filiados); defina se quiser cobrar o plano base.
```

Mudar esses valores **não exige alteração de código**.

## Fluxo de billing

1. **Checkout** — o master abre `/professor/plano` e clica em assinar/trocar. A Server Action
   `iniciarCheckout` (gate master-only) resolve o plano, garante o `stripe_customer_id` do tenant
   e cria uma `checkout.session` com `metadata.tenant_id`. O navegador é redirecionado para a URL
   da sessão.
2. **Webhook** — o endpoint `POST /api/stripe/webhook` valida a assinatura do evento com
   `STRIPE_WEBHOOK_SECRET` (400 se inválida) e sincroniza `subscriptions` via `service_role`
   (idempotente por `tenant_id`). Autoridade por evento:
   - `checkout.session.completed` → só **vincula** `stripe_customer_id`/`stripe_subscription_id`
     pelo `metadata.tenant_id` (não decide status/plano).
   - `customer.subscription.created`/`.updated` → **autoritativo** para `status`, `plan_id`
     (via `price → plans.stripe_price_id`), período e `cancel_at_period_end`.
   - `customer.subscription.deleted` → `status = 'canceled'`.
   - `invoice.payment_failed` → `status = 'past_due'`.
   - `invoice.payment_succeeded` → `status = 'active'`.
3. **Enforcement de limite** — ao convidar um filiado, `convidarFiliado` chama a RPC
   `can_add_affiliate()` ANTES de inserir. Statuses "com direito" = `active`/`trialing`; Solo (0)
   sempre bloqueia; `plan_id` nulo (price ainda não resolvido) bloqueia (lado seguro).

### Testar o webhook localmente (sandbox)

```bash
# Encaminha os eventos do Stripe (modo TEST) para o endpoint local.
stripe listen --forward-to localhost:3000/api/stripe/webhook
# O comando imprime o whsec_... a usar em STRIPE_WEBHOOK_SECRET.
```

Faça um checkout no sandbox; ao concluir, o webhook atualiza `subscriptions` do tenant para
`active` com o plano correto.

## Papéis master/filiado

- Trainers existentes viram **master/owner** do seu tenant no backfill (retrocompat).
- O convite de filiado passa `is_affiliate:'true'`, que faz o trigger `handle_new_user`
  **curto-circuitar** e NÃO criar um tenant próprio — o filiado entra no tenant do master.
- O filiado **não vê** billing/assinatura, gestão de filiados nem a config de visibilidade
  (gate server-side `requireMaster()`; o módulo Financeiro/Billing é sempre oculto a ele).
- Desativar um filiado marca `profiles.deactivated_at`; o acesso é cortado em `getSessionUser`
  (que retorna `null`), cobrindo layouts e Server Actions. Os registros dele são preservados.
- O filiado VÊ a linha de `profiles` do master (nome/e-mail) por design — necessário para os
  joins de UI e a gestão de filiados; é uma exposição de identidade intencional.

## Tipos (`types/database.types.ts`)

Os tipos das novas tabelas/enums foram adicionados **à mão**. **NÃO** rode `npm run db:types`
antes de aplicar as migrations `20261022090100..090500` no projeto hospedado — a regeneração
contra um banco sem essas migrations **apaga** os tipos novos. Só regenere DEPOIS de aplicá-las.

## Migrations (aplicar à mão, sem Docker)

Aplique na ordem (cada uma é idempotente e tem `_rollback.sql`):

1. `20261022090100_profiles_master_affiliate.sql`
2. `20261022090200_tenant_module_visibility.sql`
3. `20261022090300_created_by_backfill.sql`
4. `20261022090400_rls_conditional_visibility.sql`
5. `20261022090500_billing_plans_subscriptions.sql`
6. `20261105090000_billing_trial_core.sql` (trial de 14 dias, `billing_tenant_state()`, `can_add_affiliate()`
   ciente do trial, `handle_new_user()` com trial, backfill) e
   `20261105090100_plans_stripe_price_ids_seed.sql` (6 price IDs). **Aplique estas duas ANTES do deploy
   do código novo** (o app chama a RPC `billing_tenant_state`; sem ela, o gate bloqueia todas as escritas).

## Trial, somente leitura e checkout pela landing

### Modelo de acesso

- **Cadastro** (personal ou aluno autônomo): o trigger `handle_new_user()` cria a linha de
  `subscriptions` com `status='trialing'` e `trial_ends_at = agora + 14 dias` (plano `personal` para o
  profissional, `individual` para o autônomo). Sem cartão. Se a criação do trial falhar, o cadastro **não**
  é derrubado (a conta nasce sem trial e o backfill da migration pode ser reexecutado).
- **Estado de acesso** (`lib/billing/acesso.ts`, função pura): `assinatura_ativa` (escreve),
  `trial_vigente` (escreve), `trial_expirado`, `pagamento_pendente` (`past_due`/`unpaid`, **sem graça**),
  `cancelada`, `incompleta`, `sem_assinatura` (somente leitura). Com assinatura real (`stripe_subscription_id`)
  a Stripe é autoritativa e `trial_ends_at` é ignorado. Não há graça após o fim do trial; o banner
  avisa com urgência quando restam 3 dias ou menos.
- **Leitura do estado**: RPC `billing_tenant_state()` (`SECURITY DEFINER`, tenant derivado do `auth.uid()`),
  legível por qualquer membro do tenant. **O aluno vinculado herda o estado do tenant do personal.** A RLS
  de `subscriptions` (só o master lê) **não foi afrouxada**. A RPC nunca devolve IDs da Stripe.
- **Gate (somente leitura)**: `requireEntitlement(feature | null, user?)` em `lib/billing/guard.ts`, chamado
  **no início** das Server Actions de escrita (treinos, execução, dietas, exercícios, avaliações, alunos,
  filiados, hábitos, IA, desafios/duelos). Responde `{ ok:false, message }` em pt-BR por perfil (master,
  autônomo, filiado, aluno vinculado). **Não usa RLS.** Falha na leitura do estado = **fail-closed**.
  O teste `tests/unit/actions-write-guard.test.ts` impede esquecer o guard em ações novas.
- **Isentas** (por decisão): `cancelarSessao`, `rejeitarGeracao`, `removerFiliado`, `atualizarVisibilidade`,
  handle e amizades, perfil/auth/legal, billing. O **cron** de liberação agendada continua sem gate.
- **Rebaixamento de plano**: filiados e dados são preservados; só bloqueia **novos** filiados.
- **Risco residual**: o legado `app/(dashboard)/dashboard` (v1) escreve direto pela RLS e não passa pelo gate.
  Está fora do caminho feliz; mitigação futura: remover/redirecionar essa área.

### Checkout (3 tiers × 2 ciclos)

- `lib/billing/checkout.ts` (`criarSessaoCheckout`): só master; tier compatível com o tipo de conta
  (autônomo ⇒ `individual`; profissional ⇒ `personal`/`assessoria`); price vem de `plans`
  (`stripe_price_id_monthly|yearly`); recusa nova assinatura se já há `active`/`past_due`/`unpaid`;
  `client_reference_id` e `metadata` (`tenant_id`, `user_id`, `tier`, `cycle`) ligam a sessão ao tenant;
  **sem `trial_period_days`**; `locale: 'pt-BR'`; `success_url`/`cancel_url` =
  `/professor/plano?checkout=sucesso|cancelado`. **Assinar durante o trial encerra os dias restantes**
  (a cobrança começa na hora; o botão avisa).
- **Landing** (`components/marketing/planos-section.tsx`): alternância Mensal/Anual e 2 CTAs por plano:
  **"Testar 14 dias grátis"** (`/register?plano=…&ciclo=…`) e **"Assinar agora"** (`/assinar?plano=…&ciclo=…`).
  Os price IDs nunca vão ao navegador.
- **`GET /assinar`** (`app/assinar/route.ts`): visitante ⇒ `/register` (preserva plano/ciclo, `acao=assinar`);
  logado master ⇒ cria a sessão e redireciona ao checkout; prefetch do Next responde `204` sem efeito;
  nenhum destino vem de parâmetro da URL. Pós-login (`login`, `register`, `callback`) com `acao=assinar`
  segue para `/assinar`; sem a intenção, o autônomo continua caindo em `/aluno` (`login`, `callback`,
  `set-password`, `register`).
- **Customer Portal**: botão "Gerenciar assinatura" (action `abrirPortal`) em `/professor/plano` quando há
  assinatura; exige a configuração do portal no Dashboard (checklist abaixo).

### Webhook (`POST /api/stripe/webhook`)

Assinatura verificada com `STRIPE_WEBHOOK_SECRET` (400 se inválida), `service_role` filtrando `tenant_id`.
Eventos tratados: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
`customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`. Idempotência/ordem
(`deveAplicarEvento`): `canceled` é terminal para o mesmo `stripe_subscription_id`; `invoice.*` só vale para a
assinatura da linha; ordem por `event.created` (empate: `subscription.*` vence `invoice.*`); UPDATE otimista
por `stripe_event_at`. Status fora do enum (ex.: `paused`) é ignorado com 200; período lido de
`items.data[0]` quando o raiz não existe (API `basil`). Renovação = `invoice.payment_succeeded` +
`subscription.updated`; falha = `invoice.payment_failed` (`past_due` ⇒ somente leitura); cancelamento no fim do
período mantém o direito até `customer.subscription.deleted`.

### Checklist do que VOCÊ faz no ambiente

1. **Aplicar as migrations** no SQL Editor do Supabase, **antes do deploy**, na ordem:
   `20261105090000_billing_trial_core.sql` e `20261105090100_plans_stripe_price_ids_seed.sql`.
   Conferências: `select tier, stripe_price_id_monthly, stripe_price_id_yearly from plans;` (6 price IDs
   preenchidos) e
   `select tenant_id, status, trial_ends_at, stripe_subscription_id from subscriptions where stripe_subscription_id is null and (trial_ends_at is null or trial_ends_at < now());`
   (deve retornar 0 linhas, salvo contas de teste que você queira deixar expiradas). **Atenção:** o backfill dá
   14 dias a partir da aplicação para contas sem assinatura.
2. **Variáveis de ambiente na Vercel** (Production e Preview) e no `.env.local`: `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL` (URL pública), além das do Supabase já existentes
   (`SUPABASE_SERVICE_ROLE_KEY` etc.). Faça redeploy após salvar.
3. **Rotacionar as chaves** que foram coladas em conversa (secreta e restrita, modo teste) no Dashboard da
   Stripe antes de qualquer uso fora do sandbox; use as novas só em env. Nada disso vai ao repositório.
4. **Cadastrar o webhook** (Dashboard > Developers > Webhooks > Add endpoint): URL
   `https://<seu-dominio>/api/stripe/webhook`; versão de API `2025-02-24.acacia`; eventos
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`. Copie o
   "Signing secret" (`whsec_…`) para `STRIPE_WEBHOOK_SECRET`.
5. **Conferir os prices na Stripe**: os 6 existem e estão ativos; o **price anual da Assessoria**
   (`…kULnJvme`) deve ter intervalo **`year`** (o painel o exibiu como "Por mês"; se for mensal, o checkout
   cobraria R$ 2.388 todo mês). Conferir também o Individual anual.
6. **Customer Portal**: Settings > Billing > Customer portal; habilite atualizar forma de pagamento,
   cancelar assinatura e (opcional) trocar de plano; salve a configuração (modo teste e, depois, live).
7. **Dunning**: configure as tentativas de cobrança (Smart Retries) em Settings > Billing > Subscriptions and
   emails; a conta fica em somente leitura assim que a Stripe marca `past_due`.
8. **Edge Functions de IA** (opcional): o gate efetivo é o do Next (bloqueia antes de chamar a função);
   as Edge Functions mantêm a regra antiga até o próximo deploy delas.

### Roteiro de teste end-to-end (modo teste da Stripe)

Cartões: sucesso `4242 4242 4242 4242`; falha de pagamento `4000 0000 0000 0341` (aceita o cadastro e falha
na cobrança); qualquer data futura, CVC e CEP.

1. **Local (opcional)**: `stripe listen --forward-to localhost:3000/api/stripe/webhook` e use o `whsec_…`
   impresso em `STRIPE_WEBHOOK_SECRET` do `.env.local`.
2. **Trial**: crie uma conta nova (personal) e outra autônoma. Em `subscriptions` confira `status='trialing'`,
   `trial_ends_at ≈ agora + 14 dias`, plano `personal`/`individual`. O banner mostra os dias restantes.
3. **Somente leitura**: `update subscriptions set trial_ends_at = now() - interval '1 minute' where tenant_id = '<tenant>';`
   recarregue: aparece o banner de bloqueio, os botões de salvar/registrar ficam desabilitados e as actions
   (criar treino, registrar série, convidar aluno…) retornam a mensagem pt-BR; a consulta continua. Um aluno
   vinculado desse personal também fica sem registrar, sem ver detalhes de cobrança.
4. **Checkout pela landing (visitante)**: abra `/#planos`, escolha Anual e **"Assinar agora"** ⇒ cadastro ⇒
   (confirme o e-mail, se exigido) ⇒ Stripe Checkout. Pague com `4242…`. Volte para `/professor/plano?checkout=sucesso`.
5. **Webhook**: em `subscriptions` confira `status='active'`, `stripe_subscription_id`, `billing_cycle='yearly'`,
   `current_period_end`. A conta volta a escrever sem novo login.
6. **Logado**: em outra conta, clique **"Assinar agora"** na landing ⇒ vai direto ao checkout. Repita para os
   6 tiers×ciclos (autônomo só vê Individual; profissional vê Personal/Assessoria).
7. **Falha de pagamento**: `stripe trigger invoice.payment_failed` (ou cartão `4000 0000 0000 0341` na renovação)
   ⇒ `past_due` ⇒ somente leitura; use **Gerenciar assinatura** para atualizar o cartão.
8. **Cancelamento**: cancele no portal ⇒ `cancel_at_period_end=true` (mantém direito); `stripe trigger
   customer.subscription.deleted` ⇒ `canceled` ⇒ somente leitura; assinar de novo reabre a conta.
9. **Idempotência**: reenvie um evento pelo Dashboard (Resend) e confirme que a linha não muda.
