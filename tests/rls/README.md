# Harness de testes de RLS

Esta suíte prova a invariante **crítica** de segurança do Flvxus (dados de saúde, LGPD):

1. **Zero acesso cruzado entre professores** — o professor A não lê nem altera nenhum dado
   de alunos do professor B (isolamento total de tenant).
2. **Aluno só vê os próprios dados** — nunca dados de outro aluno.
3. **Aluno só vê treino/dieta liberados** — `workout_plans`/`diets` em `draft`/`pending_review`/
   `approved` NÃO aparecem ao aluno; só quando `status = 'released'`.

## Pré-requisitos

A suíte roda contra um **Supabase local** (CLI + Docker). Os testes consultam o banco real
com clientes autenticados como cada usuário, então o RLS é exercitado de verdade (não é mock).

## Como rodar (quando houver Docker)

```bash
# 1. Sobe o stack local (Postgres, Auth, Storage, etc.)
npx supabase start

# 2. Aplica migrations + seed do zero, de forma determinística
npx supabase db reset

# 3. Exporta as variáveis que o harness lê (valores impressos por `supabase start`
#    ou `supabase status`). NUNCA commite estes valores.
export SUPABASE_URL="http://127.0.0.1:54321"
export SUPABASE_ANON_KEY="<anon key local>"
export SUPABASE_SERVICE_ROLE_KEY="<service_role key local>"

# 4. Roda só a suíte de RLS
npm run test:rls
```

## Fase 3 — visibilidade por módulo (master/filiado) + billing

O arquivo `tests/rls/fase3.visibility.test.ts` acrescenta (também em `describe.skip`) as
invariantes da Fase 3, que SÓ podem ser verificadas contra um banco real:

1. **Módulo LIBERADO** (`tenant_module_visibility.is_open = true`) → um filiado enxerga os
   registros criados por outro filiado do mesmo tenant.
2. **Módulo BLOQUEADO** (`is_open = false`) → cada filiado enxerga apenas os registros cuja
   autoria é ele mesmo (`created_by`/`trainer_id` = `auth.uid()`).
3. **Master irrestrito** → sempre enxerga tudo, em qualquer estado.
4. **UPDATE/DELETE por autoria** (opção b): no BLOQUEADO, o filiado também não consegue
   `update`/`delete` de registros de outros.
5. **Aluno preservado** → o aluno do tenant continua lendo exercícios do tenant mesmo com o
   módulo `exercises` BLOQUEADO (não regredir o aluno).
6. **Billing invisível ao filiado** → `tenant_module_visibility` e `subscriptions` não são
   legíveis pelo filiado.
7. **Isolamento entre tenants** preservado.
8. **`can_add_affiliate()`** → Solo (0) sempre bloqueia; Equipe ativo libera enquanto
   `usados < max`; sem assinatura ativa bloqueia.

Para rodar: siga os passos acima (supabase start + db reset + exports) e troque `describe.skip`
por `describe` em `fase3.visibility.test.ts`.

## Estado atual (bloqueio de ambiente)

O ambiente de desenvolvimento **não tem Docker**, então o Supabase local não sobe aqui e os
casos ficam marcados com `describe.skip` + `it.todo`/`it` sem execução real do banco. O **corpo
dos testes já está escrito**; ao habilitar o Docker e seguir os passos acima, troque o
`describe.skip` por `describe` (ou remova a guarda de ambiente) para executá-los de verdade.
Ver `docs/pendencias.md`.

A cobertura **automatizada que ESTE ambiente produz** (sem Docker) vive em `tests/unit/`:
`billing-entitlement.test.ts` (helpers puros de limite/visibilidade), `actions-filiados.test.ts`
e `actions-billing.test.ts` (gate master-only, enforcement de limite, Stripe mockado) e
`stripe-webhook.test.ts` (mapa evento→status e rejeição de assinatura inválida). A RLS real
permanece verificação **manual**.
