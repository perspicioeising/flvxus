# SQL legado (referência histórica)

Esta pasta guarda scripts SQL da v1 que **não** fazem parte do runner de migrations da v2.
Eles ficam aqui apenas como referência histórica e **nunca** devem ser aplicados ao banco v2.

- `deletar-estruturas.sql` — script **destrutivo** (`DROP TABLE ... CASCADE`) usado manualmente
  na v1 para limpar estruturas. Foi retirado de `supabase/migrations/` porque um runner de
  migrations jamais deve conter um script que apaga tabelas de produção. Mantido aqui só para
  consulta do que a v1 derrubava.

O schema v2 é reconstruído do zero e de forma determinística pelas migrations versionadas em
`supabase/migrations/` + `supabase/seed.sql`. Ver `docs/database.md` e `docs/architecture.md` §6.
