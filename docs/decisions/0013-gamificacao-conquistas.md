# ADR 0013 — Gamificação: conquistas, seed por tenant e concessão no banco

- **Status:** aceito
- **Data:** 2026-10-21
- **Relacionado:** `docs/architecture.md` (§6.3 gamificação); **FEAT-004**;
  `supabase/migrations/20261020090500_agenda_gamificacao.sql` (tabelas
  `achievements`, `user_achievements` e trigger `award_points_on_session_finish`),
  `supabase/migrations/20261020090800_rls_policies.sql` (policies),
  `supabase/migrations/20261020120000_fix_handle_new_user_convite_aluno.sql`
  (`handle_new_user`); `app/(aluno)/aluno/conquistas/`,
  `components/aluno/conquistas/`, `lib/gamificacao/conquistas.ts`

## Contexto

A base de gamificação já existia: as tabelas `achievements` (conquistas
configuráveis por tenant, com `rule jsonb`) e `user_achievements` (conquistas
concedidas, com índice único `(student_id, achievement_id)`), mais o trigger
`award_points_on_session_finish`, que ao finalizar uma sessão soma +10 pontos em
`profiles.total_points` e grava `profiles.last_workout_date`.

Faltava: (1) um conjunto inicial de conquistas semeado **por tenant**; (2) a
concessão automática das conquistas elegíveis quando o aluno conclui uma sessão;
e (3) a tela do aluno de conquistas/progresso.

Restrição central de segurança (RLS, migration `20261020090800`):
`user_achievements` tem **apenas** policy de `SELECT` (aluno vê as próprias;
trainer as do tenant). **Não há** policy de `INSERT` para `authenticated`, e
`achievements_insert` exige `trainer`. Além disso, a invariante do projeto proíbe
`service_role` no fluxo do aluno. Logo, tanto o seed quanto a concessão precisam
rodar no banco via função/trigger `SECURITY DEFINER`.

## Decisão

### Conjunto inicial de conquistas (por tenant)

Semeamos quatro conquistas iniciais em todo tenant de trainer, identificadas por
um `code` estável dentro de `rule` (para idempotência e para o trigger casar a
regra sem depender do texto do nome):

| Código             | Nome                 | Regra (`rule.type`)        | Pontos |
| ------------------ | -------------------- | -------------------------- | ------ |
| `first_session`    | Primeiro treino      | `first_session`            | 20     |
| `week_complete`    | Semana cheia         | `sessions_in_week` (n=3)   | 30     |
| `streak_7`         | Sequência de 7 dias  | `streak_days` (days=7)     | 50     |
| `points_100`       | 100 pontos           | `points_total` (total=100) | 0      |

> Observação: `points_100` tem `points = 0` para não realimentar o próprio marco
> de pontos (a conquista não concede pontos que disparariam outro marco).

### Representação da regra em `achievements.rule` (jsonb)

`rule` é um objeto JSON com um campo `type` e os parâmetros da regra. O trigger
interpreta os tipos:

- `{"type":"first_session","code":"first_session"}` — concedida quando a sessão
  recém-finalizada é a primeira sessão concluída do aluno.
- `{"type":"sessions_in_week","code":"week_complete","count":3}` — concedida
  quando o aluno atinge `count` sessões concluídas na semana ISO (segunda a
  domingo) da data da sessão.
- `{"type":"streak_days","code":"streak_7","days":7}` — concedida quando a
  sequência de dias consecutivos de treino (terminando na data da sessão) atinge
  `days`.
- `{"type":"points_total","code":"points_100","total":100}` — concedida quando
  `profiles.total_points` (já incrementado) atinge `total`.

Tipos desconhecidos são ignorados pelo trigger (tolerância a conquistas
customizadas criadas pelo trainer no futuro).

### Concessão via trigger `SECURITY DEFINER`

Estendemos `award_points_on_session_finish` (mantendo `SECURITY DEFINER` e
`set search_path = ''`). Além de somar pontos e gravar `last_workout_date`, o
trigger, para cada conquista do tenant do aluno, avalia a `rule` e concede as
elegíveis com `insert ... on conflict (student_id, achievement_id) do nothing`,
usando o índice único existente `user_achievements_student_achievement_uidx`.
A concessão roda inteiramente no banco — nenhuma `Server Action` do aluno insere
em `user_achievements`, e nada usa `service_role`.

### Seed por tenant idempotente

Uma função `seed_achievements_for_tenant(uuid)` `SECURITY DEFINER` insere o
conjunto inicial usando `where not exists` por `rule->>'code'` dentro do tenant,
tornando-a idempotente (reexecutar não duplica). A migration:

1. cria a função de seed;
2. aplica a todos os tenants já existentes;
3. estende `handle_new_user` para chamar o seed logo após criar o tenant do
   trainer, cobrindo tenants novos.

## Justificativa

Concentrar a concessão no banco é a única forma coerente com a RLS vigente
(`user_achievements` sem `INSERT` para `authenticated`) e com a invariante de não
usar `service_role` no fluxo do aluno. Reusar o trigger já existente mantém um só
ponto de verdade para "o que acontece ao concluir uma sessão". O `code` dentro de
`rule` desacopla a regra do texto exibido e garante seed/concessão idempotentes.

## Consequências

- O custo por sessão concluída cresce um pouco (o trigger passa a varrer as
  conquistas do tenant e contar sessões/streak), mas roda uma vez por conclusão e
  usa índices já existentes.
- A lógica pura de **apresentação** (streak e agregação obtidas vs disponíveis)
  vive em `lib/gamificacao/conquistas.ts` e é testada por Vitest; ela NÃO decide a
  concessão (isso é do banco), apenas resume o estado para a tela.
- Conquistas customizadas que o trainer venha a criar precisam de um `rule.type`
  conhecido para serem concedidas automaticamente; caso contrário ficam apenas
  "disponíveis" até um tipo ser suportado.
- Sem Docker no ambiente, a migration é verificada por revisão estática e
  consistência com `types/database.types.ts`; será aplicada no projeto Supabase
  pelo usuário.
