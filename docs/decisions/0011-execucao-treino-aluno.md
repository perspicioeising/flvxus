# ADR 0011 — Execução de treino do aluno (sessão/série, descanso, progresso)

- **Status:** aceito
- **Data:** 2026-10-20
- **Relacionado:** `docs/architecture.md` (§6.2 treinos, §9 design system);
  **FEAT-003** (execução do treino); `app/(aluno)/aluno/execucao/`,
  `components/aluno/execucao/` (`sessao-execucao.tsx`, `timer-descanso.tsx`),
  `actions/execucao.ts`, `lib/treino/progresso.ts`

## Contexto

A área do aluno precisa de uma tela para executar a ficha liberada DURANTE o treino, na
academia, pelo celular. O schema v2 modela a execução em `workout_sessions` (uma sessão por
treino realizado) e `workout_set_logs` (uma linha por série). Faltava decidir COMO essa execução
acontece na prática: quando a sessão é criada, como o aluno marca cada série, se há apoio para o
descanso e como mostrar o avanço — tudo isso sob a restrição de uso real (mão suada, uma mão,
foco no exercício).

## Opções consideradas

- **(A) Formulário único no fim do treino.** O aluno preenche tudo de uma vez ao terminar. Simples
  de implementar, mas frágil: perde dados se o app fecha, não ajuda durante o treino e não registra
  o progresso em tempo real.
- **(B) Sessão criada ao abrir a tela.** Cria `workout_sessions` assim que a execução é aberta.
  Gera sessões vazias quando o aluno só espia a ficha.
- **(C) Sessão criada no primeiro toque, série a série.** A sessão nasce quando o aluno marca a
  primeira série; cada toque grava um `workout_set_logs` via Server Action; há timer de descanso e
  barra de progresso "X de Y séries".

## Decisão

- **Opção C.** A sessão só é criada no primeiro registro (`iniciarSessao`), evitando sessões vazias.
  Cada série marcada chama `registrarSerie` (Server Action, RLS ativo), e `finalizarSessao` encerra
  com observação opcional.
- O **progresso** é calculado por lógica pura compartilhada (`lib/treino/progresso.ts`,
  `progressoSessao`), reusada na UI e nos testes.
- Há **timer de descanso** por exercício (`timer-descanso.tsx`) quando a prescrição define
  `rest_seconds`.
- **Mobile-first:** alvos ≥ 44px (`min-h-11`), estados claros de salvando/feito, sem depender de
  hover; o scroll vive só no `<main>` do AppShell.

## Justificativa

Criar a sessão no primeiro toque mantém o banco limpo (nada de sessões vazias) e dá feedback
imediato a cada série, que é o que o aluno precisa na academia. Centralizar o cálculo de progresso
numa função pura evita divergência entre o que a barra mostra e o que foi gravado, e deixa a regra
testável sem renderizar a tela.

## Consequências

- A execução depende de conectividade a cada série (cada toque é uma Server Action). Um modo
  offline/otimista fica como evolução futura (pendência), não implementado nesta fase.
- Qualquer tela futura que precise do conceito de "progresso da sessão" deve reusar
  `progressoSessao` de `lib/treino/progresso.ts`, não recalcular à mão.
- A invariante "aluno só executa ficha `released` do próprio aluno" é garantida por RLS; a UI não
  reimplementa o filtro de posse.
