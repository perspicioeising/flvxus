# Plano — Gamificação & Torneio entre Alunos (futuro)

> Status: **planejamento** (não iniciado). Implementar **somente após** concluídas as fases em andamento:
> fluxo de treino do aluno, Fase 3 (billing + multi-trainer), fix de scroll das telas de detalhe e interação com fotos da avaliação.
> Posicionado como **Fase 5**, após a Fase 4 (performance/segurança) do roadmap original.

## Visão
Transformar o engajamento do aluno num sistema estilo Duolingo: pontos (XP), ranking mensal por tenant,
missões diárias com streak, e premiações configuráveis pelo personal. Objetivo: retenção e constância.

## Princípio central — JUSTIÇA entre treinos diferentes (decisão do usuário)
A pontuação **NÃO** pode favorecer quem tem mais dias de treino ou mais volume. Um aluno com rotina AB (2x/semana)
e outro com ABCDE (5x/semana) devem poder competir em igualdade.

**Regra:** pontua-se por **ADERÊNCIA AO PLANO PRESCRITO**, não por esforço absoluto.
- O aluno ganha pontos por **cumprir o que o professor prescreveu para aquele dia**.
- **Streak = dias de aderência ao plano**, não "dias treinando".
  - Dia de **descanso programado** → **mantém** a streak (descansar é aderir ao plano). Não dá nem tira vantagem.
  - A streak só **quebra** quando o aluno falta a um dia que **era de treino** no plano dele.
- Normalização: a pontuação de um ciclo deve ser proporcional à aderência (ex.: % de dias prescritos cumpridos),
  de modo que 100% de aderência num plano AB vale o mesmo que 100% num plano ABCDE.

> Decisão de design pendente: tratar feriados/pausas/liberação programada da ficha (quando o aluno fica sem treino
> ativo por decisão do professor) como "neutro" na streak, igual ao descanso.

## Escopo do ranking (decisão do usuário)
- **Somente alunos** competem entre si. Professores/filiados **não** entram no ranking (eles gerenciam).
- Ranking **por tenant**: num tenant com filiados, **todos os alunos do tenant competem juntos**,
  independentemente de qual personal os cadastrou.
- **Todos os alunos do tenant visualizam** o ranking do seu tenant.

## Premiações (decisão do usuário)
- **Configuráveis pelo personal** (master). O personal define o(s) prêmio(s) da temporada
  (ex.: "1º lugar ganha uma avaliação grátis", ou prêmios customizados por posição/faixa).
- Precisa de uma tela de configuração de premiação (master-only) e exibição do prêmio vigente para os alunos.

## Missões diárias (decisão do usuário)
- **Conjunto FIXO** de missões diárias (mais simples; não configurável pelo personal nesta versão).
- Exemplos candidatos (a calibrar): "cumpra o treino de hoje", "registre o peso/medida", "complete todas as séries
  do treino do dia". Missões respeitam o princípio de aderência (num dia de descanso, a missão do dia é o próprio descanso).
- Reset diário com fuso horário definido (decisão pendente: fuso do tenant? do aluno? America/Sao_Paulo como padrão?).

## Base existente a reaproveitar
- Sistema de **conquistas/achievements** (`user_achievements`, `seed_achievements_for_tenant`, trigger de concessão).
- **Resumo pós-treino** (em implementação) já calcula duração, volume (Σ reps×carga) e séries por sessão.
- **Sessões de execução** (workout_sessions / set logs) como fonte de "cumpriu o treino".
- **Plano/ficha por divisão** (workout_plans + workout_plan_items.division) como fonte do "o que era prescrito hoje".

## Arquitetura proposta (alto nível — detalhar no design da fase)
- **Ledger de pontos**: tabela de eventos de pontuação por aluno (append-only), para ranking auditável e recalculável.
  Cada evento: aluno, tenant, tipo (treino cumprido / missão / streak / etc.), pontos, timestamp, referência à sessão/missão.
- **Temporadas**: ranking mensal = agregação do ledger por (tenant, mês). Guardar snapshots de temporadas encerradas
  para histórico e para registrar vencedores/premiação.
- **Streak**: estado por aluno derivado da aderência diária ao plano prescrito (job/trigger diário ou cálculo on-read).
- **Missões diárias**: catálogo fixo + estado de conclusão por aluno por dia.
- **RLS**: leitura do ranking restrita ao tenant do aluno; escrita de pontos só pelo backend (service_role/trigger);
  config de premiação só pelo master. Isolamento de tenant em tudo.

## Ondas sugeridas (fatiar para entregar valor incremental)
- **Onda 1 — Pontos + Ranking mensal**: ledger de pontos por aderência, agregação mensal por tenant, tela de leaderboard
  (todos os alunos do tenant veem), reset/temporada mensal. Entrega o "torneio" básico.
- **Onda 2 — Missões diárias + Streak**: catálogo fixo de missões, streak por aderência (com descanso neutro),
  UI de missões do dia.
- **Onda 3 — Premiações + Polish**: configuração de prêmios pelo personal, registro de vencedores por temporada,
  animações/celebração (tom Duolingo), integração com a tela de resumo pós-treino e conquistas.

## Decisões em aberto (resolver no design da fase)
1. Pesos exatos de pontuação por tipo de evento (calibrar com o usuário).
2. Fórmula de normalização por aderência (garantir fairness AB vs ABCDE).
3. Fuso horário do reset diário e da virada de temporada.
4. Tratamento de pausas/liberação programada/feriados na streak.
5. Formato das premiações configuráveis (por posição, por faixa, texto livre?) e se há registro/entrega manual pelo personal.
6. Catálogo fixo definitivo de missões diárias.
7. Antifraude: como garantir que "cumpriu o treino" reflete execução real (ex.: exigir registro de séries, não só abrir a tela).
