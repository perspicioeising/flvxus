# ADR 0003 — Modelo de dados v2 e enums nativos

- **Status:** aceito
- **Data:** 2026-10-19
- **Relacionado:** `docs/architecture.md` §6; `docs/audit.md` §3

## Contexto

A auditoria revelou dívida crítica de banco: 18 migrations versionadas **e** 4 SQL avulsos
(`avaliacao.sql`, `dieta.sql`, `novo-dieta.sql`, `deletar-estruturas.sql`) aplicados à mão. A
tabela `physical_assessments` é **criada com dois esquemas divergentes e incompatíveis** (um na
migration base `ivory_summit`, outro em `avaliacao.sql`), e como ambos usam
`CREATE TABLE IF NOT EXISTS`, o resultado **depende da ordem de aplicação** — o banco não é
reproduzível. Papéis, status, objetivos e níveis são `text + CHECK` espalhados, frágeis a typos
e com valores válidos duplicados entre SQL e TypeScript. Não há `seed.sql`.

## Decisão

1. **Reescrever o banco do zero**, versionado por timestamp, eliminando os 4 SQL avulsos.
   `deletar-estruturas.sql` (script destrutivo) sai do diretório de migrations.
2. **Consolidar `physical_assessments` num superset coerente:** adotar o conjunto rico de
   `avaliacao.sql` (idade, gênero, `protocol`, circunferências, dobras cutâneas,
   `ai_analysis`/`ai_recommendations`) e **somar** as colunas úteis da base (`body_fat`→
   `body_fat_pct`, `muscle_mass`→`muscle_mass_kg`, `measurements jsonb` como extras livres).
   Uma única definição canônica.
3. **Consolidar o domínio de dietas** (`diets`, `diet_meals`, `diet_meal_foods`,
   `diet_shopping_lists`, `diet_history`) numa definição única, sem os drops/recriações de
   `novo-dieta.sql`.
4. **Enums nativos (`CREATE TYPE`)** no lugar de `text + CHECK`, conforme a lista em
   `docs/architecture.md` §6.1 (`user_role`, `student_status`, `goal_type`,
   `experience_level`, `assessment_protocol`, `plan_status`, `ai_job_type`, `ai_job_status`,
   `appointment_status`, `consent_type`, `data_request_type`, `data_request_status`).
5. **Tabelas novas** para o que a v1 não tinha: `workout_sessions`/`workout_set_logs`
   (execução estruturada), `ai_usage_logs`, `ai_generations` (rascunho→aprovação),
   `consent_records` e `data_requests` (LGPD).
6. **Tipos TypeScript gerados do banco** (`types/database.types.ts`) como fonte única; schemas
   Zod derivam dos enums e tabelas.
7. **`seed.sql`** com catálogo inicial de exercícios por tenant de exemplo.

## Justificativa

Um superset único resolve o conflito sem perder dados que o código já espera. Enums nativos
movem a verdade dos valores válidos para o banco (barram typos no nível de tipo) e alimentam os
tipos TS, eliminando a duplicação SQL↔TS. Migrations determinísticas tornam o banco
reproduzível — pré-requisito dos testes de RLS (ADR 0008).

## Consequências

- Telas e Actions de avaliação/dieta ligam-se ao schema consolidado (campos renomeados).
- Enums exigem migrations de evolução cuidadosas no futuro (adicionar valor é barato; remover
  não). Aceitável.
- O `measurements jsonb` segue como válvula de escape para medidas não previstas, sem poluir o
  schema tipado.
