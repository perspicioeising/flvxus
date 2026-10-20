# ADR 0004 — Estratégia de RLS multi-tenant

- **Status:** aceito
- **Data:** 2026-10-19
- **Relacionado:** `docs/architecture.md` §4 e §5; `docs/audit.md` §5

## Contexto

Dados de saúde são sensíveis (LGPD) e a regra de negócio é estrita: **professor só acessa seus
alunos; aluno só acessa os próprios dados; zero acesso cruzado entre professores**. A v1 tem um
desenho de RLS por `tenant_id` conceitualmente bom, mas a aplicação é desigual: o `middleware.ts`
**só verifica sessão, não papel**; há `userRole` hardcoded em componentes; uma rota de IA
(`physical-assessments/analyze`) **não valida auth**; e rotas `service_role` dependem de
checagens manuais de `tenant_id` que precisam ser auditadas caso a caso.

## Decisão

1. **RLS habilitado em todas as tabelas de negócio**, cada uma com `tenant_id`. A primitiva de
   isolamento é `tenant_id = app_tenant_id()`, condição necessária em **todas** as policies.
2. **Duas funções `SECURITY DEFINER`** — `app_tenant_id()` e `app_role()` — leem o `profiles`
   do `auth.uid()`. Um só estilo de policy (a v1 tinha dois estilos divergentes; unificar).
3. **Gate por papel em dois níveis:** middleware mantém/exige sessão; **layout server-side por
   área** (`(professor)`/`(aluno)`) aplica o papel de fato, redirecionando quem não pertence.
   Elimina `userRole` hardcoded.
4. **Contrato de policies por tabela** (SELECT/INSERT/UPDATE/DELETE por papel) conforme a
   tabela em `docs/architecture.md` §5.3 — este ADR o referencia como o contrato a implementar
   na Fase 2 (sem SQL ainda).
5. **Invariante "aluno só vê o que foi liberado"** é dona do **RLS**: `workout_plans`/`diets`
   só aparecem ao aluno quando `status` indica liberado; um bug de UI não vaza rascunho.
6. **`service_role` é exceção** (ADR referencia §4.4 da arquitetura): só quando não há usuário
   cujo contexto resolveria a permissão (criação de aluno, Edge Functions de IA, cron/webhooks),
   e **sempre** carimbando `tenant_id` explicitamente. O helper `lib/supabase/admin.ts` obriga
   passar o `tenantId` do contexto.
7. **Testes de RLS obrigatórios** (ADR 0008) validam a invariante de isolamento entre
   professores e a de liberação ao aluno.

## Justificativa

O banco é a única camada que nenhum bug de aplicação contorna, então ele é o dono das
invariantes de isolamento e de liberação. O gate por papel no layout (e não no middleware)
evita consultar o banco em toda requisição de borda e centraliza a decisão num único ponto
server-side. Reforçar `tenant_id` em todo caminho `service_role` fecha a brecha que a auditoria
apontou.

## Consequências

- Fechar `physical-assessments/analyze` atrás de auth (vira Edge Function autenticada, ADR 0001).
- Cada uso de `service_role` passa a ser auditável e coberto por teste.
- Policies e funções `SECURITY DEFINER` exigem revisão cuidadosa (risco de escalonamento se mal
  escritas) — mitigado pelos testes de RLS.
