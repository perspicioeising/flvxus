# Billing (Stripe) + multi-trainer — Fase 3

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

Os **price IDs** NÃO ficam em env: a fonte de verdade é a tabela `plans` (`plans.stripe_price_id`),
editável em runtime sem redeploy (as vars `STRIPE_PRICE_*` são opcionais, só conveniência de seed).

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
