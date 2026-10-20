# ADR 0008 — Estratégia de testes e CI

- **Status:** aceito
- **Data:** 2026-10-19
- **Relacionado:** `docs/architecture.md` §12; `docs/audit.md` §8

## Contexto

A v1 tem **zero testes**, sem `typecheck` dedicado e sem CI. A regra de negócio mais sensível —
**isolamento entre professores (RLS)** — nunca foi verificada automaticamente. A visão v2 exige
testar RLS (sem vazamento entre professores), a lógica crítica de cálculo (avaliação/macros) e a
validação Zod da saída da IA, com lint/typecheck/testes passando.

## Decisão

1. **O que testar (prioridade):**
   - **RLS sem vazamento entre professores (OBRIGATÓRIO):** harness em `tests/rls/` sobe o
     **Supabase local** (CLI), cria dois tenants/professores + alunos e verifica que nenhum
     professor lê/escreve dados do outro, que o aluno só vê os próprios dados e que rascunhos de
     dieta/treino **não** aparecem ao aluno antes de liberados.
   - **Lógica crítica de cálculo (Vitest, puro):** IMC, %gordura por protocolo de dobras
     (`lib/assessment/`), TMB/TDEE/macros (`lib/nutrition/`).
   - **Validação Zod da IA:** cada schema de `schemas/ia/` testado contra saídas válidas e
     malformadas, garantindo que saída inválida nunca grave no banco.
2. **Ferramentas:** **Vitest** (unit + componentes via Testing Library/jsdom) e um **harness de
   RLS** contra o Supabase local (CLI). Integração (Actions ↔ banco) reusa o banco local.
3. **CI (GitHub Actions), esboço:** `lint` → `typecheck` (`tsc --noEmit`) → `test` (Vitest) →
   `test:rls` (sobe Supabase local, aplica migrations + seed, roda a suíte de RLS). Falha em
   qualquer etapa barra o merge. Segredos vêm de variáveis de ambiente do CI.
4. **Fora da automação:** teste manual com tecnologias assistivas (acessibilidade) fica
   documentado como etapa separada.

## Justificativa

A trava de segurança do produto é o RLS; por isso ele é teste obrigatório e roda contra um banco
real local (o único jeito de provar policies). Vitest cobre o cálculo puro e a validação Zod com
baixo custo e boa velocidade. O pipeline em quatro etapas dá o mínimo de garantia (lint,
tipos, unidade, segurança) sem sobrecarregar o fluxo.

## Consequências

- A reprodutibilidade do banco (ADR 0003) é pré-requisito do `test:rls` — migrations + seed
  determinísticos.
- O CI precisa de ambiente com Docker/Supabase CLI para o banco local; mais lento que só unit,
  aceitável pela importância da invariante.
- Novas tabelas/policies exigem casos de RLS correspondentes antes do merge.
