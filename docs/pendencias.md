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

## Itens fora do escopo da Fase 2 (serão tratados nas fases seguintes)

- Renomear o pacote de `fitconnect-pro` para `flvxus` e subir Next 15/React 19 (ADR 0002) —
  Fase 3, para não misturar mudança de build com a reconstrução do banco.
- Edge Functions de IA (Anthropic), prompts versionados e schemas Zod (ADR 0001) — Fase 6.
- Front-end, design system e gate por papel nos layouts (§5.2) — Fases 3 a 5.
