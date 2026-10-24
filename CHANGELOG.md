# Changelog

## Não lançado

### Fase 2.1 — Busca de treinos (professor)

- **Busca server-side na tela de Treinos** (`/professor/treinos`): campo de busca
  por nome da ficha OU nome do aluno, com paginação e estado refletido na URL
  (`?q=&page=&pageSize=`). A busca aplica no submit (Enter), sem debounce.
- **RPC `search_workout_plans`** (`SECURITY INVOKER`) com JOIN `workout_plans` ↔
  `profiles` por `student_id`, OR `ILIKE` em nome da ficha/aluno, paginação
  `limit/offset`, `count(*) over ()::int` e `order by created_at desc, id desc`
  (tie-break determinístico). RLS de tenant/trainer preservada.
- **Índices GIN trigram** (`pg_trgm`) em `workout_plans.name` e
  `profiles.full_name` para acelerar o `ILIKE %q%`.
- Migration aditiva `supabase/migrations/20261021100000_busca_treinos.sql` e
  tipo da RPC em `types/database.types.ts`.
