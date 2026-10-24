# TODO

## Pendências de ambiente

- [ ] **Aplicar a migration `20261021100000_busca_treinos.sql` no Supabase.**
      A migration (extensão `pg_trgm`, índices GIN trigram e RPC
      `search_workout_plans`) NÃO roda no CI (ambiente sem Docker/Supabase local).
      O código compila porque o tipo da RPC foi adicionado à mão em
      `types/database.types.ts`. Aplicar a migration no projeto Supabase é passo
      manual do usuário antes de a busca de treinos funcionar em produção.
- [ ] **Teste de integração da RPC `search_workout_plans`** (isolamento de tenant,
      OR real nome-ficha/nome-aluno, `total_count`, paginação estável, recorte de
      aluno) quando houver Docker/Supabase local.
