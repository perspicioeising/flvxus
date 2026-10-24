# Changelog

## Não lançado

### Fase 2.2 — Biblioteca global de exercícios (professor)

- **Importação em lote do catálogo global** na tela de Exercícios
  (`/professor/exercicios`): botão "Importar da biblioteca" no header abre um
  drawer (shadcn Sheet) para buscar, filtrar (grupo muscular/equipamento),
  selecionar exercícios do catálogo global (`tenant_id IS NULL`) e copiá-los ao
  acervo do tenant. A seleção persiste entre páginas e filtros; "selecionar
  todos (respeitando filtros)" marca até 200 por vez em ordem alfabética.
- **Route Handler `GET /professor/exercicios/biblioteca`** (sob RLS via
  `createClient`): modo lista paginado por 50 (`{ itens, total, page, pageSize }`,
  ordenado por `name`, filtros `q`/`muscle_group`/`equipment`, só `tenant_id`
  nulo) e modo `?idsOnly=1` (`{ ids, truncado }`, teto de 500) para o
  "selecionar todos".
- **Importação idempotente** via Server Action `importarExercicios` (RPC
  `importar_exercicios_globais`), com toast de resultado em pt-BR e
  `router.refresh()` da listagem do tenant no sucesso.

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
