# ADR 0010 — Painel do professor: critério de "avaliação vencida" (90 dias)

- **Status:** aceito
- **Data:** 2026-10-20
- **Relacionado:** `docs/architecture.md`; **FEAT-005** (painel do professor);
  `app/(professor)/professor/page.tsx`, `components/professor/dashboard/`,
  `lib/datas.ts`

## Contexto

O painel do professor (visão geral) destaca os alunos que precisam de uma nova avaliação física.
Para isso é necessário um limiar (em dias) a partir do qual a **última** `physical_assessments`
de um aluno é considerada **vencida**. O schema v2 não tem uma coluna que configure esse limiar
por tenant, e a FEAT-005 pede explicitamente que a escolha seja documentada.

## Opções consideradas

- **(A) 30 dias.** Reavaliação mensal; gera muita pendência para quem segue ciclos trimestrais.
- **(B) 60 dias.** Intermediário, mas ainda curto para a prática comum de reavaliar a cada ciclo.
- **(C) 90 dias.** Alinha-se ao ciclo trimestral típico de reavaliação em personal training.
- **(D) Configurável por tenant.** Exigiria nova coluna/migration — fora do escopo desta fase
  (o schema v2 está fechado; mudanças de schema são pendência, não feature).

## Decisão

- **Opção C.** O limiar é **90 dias**, fixado na constante `DIAS_AVALIACAO_VENCIDA` em
  `components/professor/dashboard/index.ts`.
- Apenas alunos com `status = 'active'` entram no cálculo de vencidas (inativos/arquivados/pendentes
  não geram pendência).
- Alunos ativos **sem nenhuma avaliação** são tratados como vencidos (precisam de atenção), coerente
  com `dataVencida(null, ...) === true` em `lib/datas.ts`.

## Justificativa

90 dias reflete o ciclo trimestral mais comum de reavaliação, mantendo o painel acionável sem
inundá-lo de falsos positivos. Centralizar o valor numa única constante deixa a troca trivial e
evita divergência entre o contador e a lista de pendências.

## Consequências

- Tornar o limiar configurável por tenant depende de uma nova coluna no schema v2; fica registrado
  como possível evolução (ver `docs/pendencias.md`), não implementado nesta fase.
- Qualquer bloco futuro que use o conceito de "avaliação vencida" deve reusar
  `DIAS_AVALIACAO_VENCIDA` e `dataVencida`/`diasDesde` de `lib/datas.ts`.
