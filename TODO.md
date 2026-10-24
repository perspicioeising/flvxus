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
- [ ] **Aplicar as migrations da Fase 2.2 (biblioteca global)** no Supabase
      hospedado. As migrations (coluna/índice de `source_exercise_id`, RPC
      `importar_exercicios_globais`, seed do catálogo global) NÃO rodam no CI
      (ambiente sem Docker/Supabase local); os tipos foram adicionados à mão em
      `types/database.types.ts`. Aplicar é passo manual do usuário.
- [ ] **Popular a biblioteca global** (`exercises` com `tenant_id IS NULL`) no
      Supabase hospedado caso o seed não seja aplicado automaticamente — sem
      itens globais, o drawer "Importar da biblioteca" fica vazio. Preservar o
      catálogo do tenant 'Treinador Eising'
      (`tenant_id = ae4e4d12-7d48-4e23-8ef1-ccab78144d5d`).
