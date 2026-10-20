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

## Estado atual (bloqueio de ambiente)

O ambiente de desenvolvimento **não tem Docker**, então o Supabase local não sobe aqui e os
casos ficam marcados com `describe.skip` + `it.todo`/`it` sem execução real do banco. O **corpo
dos testes já está escrito**; ao habilitar o Docker e seguir os passos acima, troque o
`describe.skip` por `describe` (ou remova a guarda de ambiente) para executá-los de verdade.
Ver `docs/pendencias.md`.
