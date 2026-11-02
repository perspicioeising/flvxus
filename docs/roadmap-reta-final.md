# Roadmap — Reta Final do Flvxus

> Consolida as ideias finais: melhorias de execução, novo modelo de billing (com aluno autônomo),
> e o módulo de gamificação "Flvxus Arena". Ordem e faseamento definidos pelo orquestrador a partir
> das dependências. Cada fase é disparada como workflow próprio, em worktree isolado, mergeada quando
> aprovada. Migrations são aplicadas à mão no Supabase (sem Docker local).

## Princípios transversais (valem para tudo)
- Multi-tenant com RLS e isolamento de tenant em TODA tabela nova.
- Gamificação premia CONSISTÊNCIA/ADERÊNCIA AO PLANO, não esforço absoluto (treino AB vale como ABCDE;
  descanso programado mantém a streak). Antifraude: XP só com execução/registro real, uma vez por evento,
  com limites por categoria.
- Histórico e evolução do aluno PRESERVADOS ao trocar de plano ou encerrar vínculo com profissional.
- Textos pt-BR; código em inglês; migrations idempotentes com rollback; tipos à mão em database.types.ts.

---

## FASE E1 — Melhorias rápidas de execução (ganhos baratos, independentes)
1. **Peso/reps pré-preenchidos da última vez**: na execução, sugerir carga/reps que o aluno fez na
   última sessão daquele exercício (ler workout_set_logs). Reduz atrito. Apenas leitura; sem schema novo.
2. **Exercício de backup ("máquina ocupada")**: um toque troca o exercício por um alternativo mantendo
   séries/reps do slot. Pequeno; pode exigir um campo de "alternativo" no item ou escolha ad-hoc na execução
   (decidir no design — preferir o mais simples).
> Detecção de PR e progressão/1RM NÃO entram aqui — vão com a gamificação (dependem de histórico e geram XP/conquista).

## FASE B — Billing completo + Aluno Autônomo (DESBLOQUEADOR — antes da gamificação)
Pré-requisito de boa parte do resto (o Plano Individual = aluno autônomo, que a gamificação assume existir).

### B1 — Aluno autônomo (mudança estrutural)
- No registro: escolher "Sou personal" ou "Treino por conta própria".
- Aluno autônomo = dono do próprio tenant (tenant de 1), com papel que cria treino/dieta/avaliação PARA SI
  (curto-circuita a etapa de "liberar" que existe no fluxo personal→aluno).
- RLS revisada para o papel misto SEM quebrar o fluxo personal↔aluno existente (parte mais delicada).
- Aluno vinculado a um profissional continua executando o que o professor define, SEM precisar de assinatura
  individual (coberto pela assinatura do profissional). Migração de conta (autônomo <-> vinculado) preserva histórico.

### B2 — Planos, preços e trial no Stripe + gating
Três modalidades (mapear/ajustar os tiers atuais solo/team/gym):
- **Individual** (aluno independente): Mensal R$ 19,90 · Anual R$ 118,80 (~R$ 9,90/mês). Cria/gerencia os
  próprios treinos e dietas, IA, avaliações, evolução, hidratação, rankings e desafios.
- **Personal** (profissional): Mensal R$ 129,90 · Anual R$ 1.188,00 (~R$ 99,00/mês). Gerencia alunos, treinos,
  dietas, IA, avaliações, evolução, treino presencial, metas e desafios.
- **Assessoria** (equipes/academias): Mensal R$ 249,90 · Anual R$ 2.388,00 (~R$ 199,00/mês). Vários profissionais
  (já coberto pelo multi-trainer da Fase 3); alunos vinculados executam sem assinatura própria.
- **Trial de 14 dias** com acesso a TODAS as funcionalidades.
- Preços/price IDs reais no Stripe ficam a cargo do usuário; o código usa os tiers + price IDs configuráveis.
- Gating de features e LIMITES por plano, enforced no backend.

### B3 — Franquia de uso de IA (controle de custo)
- Medir consumo de IA por usuário/plano (contador por período) e aplicar FRANQUIA (limite) por plano;
  bloquear/avisar ao exceder. Tabela de uso + enforcement no backend das rotas de IA.

### B4 — Preservação de histórico
- Garantir que trocar de plano, fazer downgrade ou encerrar vínculo com profissional NÃO apaga histórico/evolução.

## FASE G — Gamificação "Flvxus Arena" (o maior módulo; em ondas)
Motor central baseado em EVENTOS, não rankings isolados.

### Esquema base (motor de eventos)
Tabelas (prefixo gamification_): `gamification_profiles` (XP total, nível, streak, stats),
`gamification_events` (histórico IMUTÁVEL de pontos; user_id, tenant_id, event_type, points, reference_id,
created_at p/ temporada), `gamification_seasons` (mensal/anual), `gamification_achievements` (catálogo),
`gamification_user_achievements`, `gamification_leaderboards` (consolidado). Social vem na Onda 3
(`gamification_friends`, `gamification_challenges`, `gamification_challenge_members`).
Fluxo: ação confirmada → gera evento → calcula XP → atualiza totais → atualiza rankings aplicáveis.
RLS: eventos/perfil do próprio usuário; rankings expõem só XP/posição/nome, nunca dados privados entre tenants.

### Onda G1 — Núcleo (por tenant)
- Motor de eventos imutável + cálculo de XP.
- XP por: concluir treino planejado (+30), cumprir dieta do dia (+20), meta de água (+10), registrar evolução
  (+15), progressão de carga (+10), check-in diário (+5). VALORES ILUSTRATIVOS — ajustáveis. Regras:
  1 evento = 1 XP (sem duplicar o mesmo treino), limites diários por categoria, sem premiar excesso
  (água/treinos extras sem plano/progressões artificiais).
- **Níveis permanentes** (XP acumulado nunca zera): Iniciante 0 · Aprendiz 500 · Dedicado 1.500 · Atleta 3.000
  · Elite 6.000 · Lenda 12.000.
- **Ranking do TENANT** (alunos do mesmo personal/assessoria), ativado só com mínimo de participantes (ex.: 5).
- **Missões diárias/semanais** (conjunto fixo): concluir treino, meta de água, cumprir dieta, registrar refeições,
  3 treinos/semana, 7 dias de consistência, etc.
- **Streak de consistência** respeitando o PLANO (descanso programado mantém; falta a dia de treino quebra).
- **Conquistas** (catálogo): primeiro treino, hidratado (7 metas), imparável (30 dias), disciplina (30 dias dieta),
  evolução (progressão), campeão (1º mensal), etc.
- **Detecção de PR / progressão de carga** entra aqui (gera conquista/XP; baseada no histórico do próprio aluno,
  com validação de execução — não premiar carga absoluta nem progressão artificial).

### Onda G2 — Rankings global e anual (cross-tenant)
- Ranking mensal GLOBAL (todos os usuários, independentemente de tenant) e ranking ANUAL (acumula temporadas).
- RLS cuidadosa: cruza tenants expondo só XP/posição/nome público, sem vazar dados de uma assessoria para outra.
- **Aluno autônomo (self_managed) ENTRA no ranking global** mensal e anual, competindo cross-tenant como
  qualquer outro usuário (decisão confirmada pelo usuário). É o que dá competição real a quem não tem turma.
  O mínimo de 5 participantes continua valendo SÓ para o ranking do tenant (que o autônomo, com tenant de 1,
  nunca verá — comportamento correto, não bug).

### Onda G3 — Social + painel do personal
- `gamification_friends` (amizades/solicitações), ranking de amigos.
- Desafios individuais (desafiar amigo por 7/15/30 dias por mais XP; medalha ao vencedor) e coletivos.
- **Aluno autônomo (self_managed) PODE ter amigos e participar de desafios** com usuários de outros tenants
  (decisão confirmada pelo usuário). Modelagem: canal social **opt-in**, SEPARADO do isolamento B2B por RLS —
  amizade/desafio só existe com consentimento mútuo e expõe apenas XP/posição/nome público, nunca treino/dieta
  entre tenants. Exige review de segurança caprichado (cross-tenant intencional e controlado).
- Painel de desafios do PERSONAL: criar desafio, definir período/alunos/metas/recompensas, acompanhar
  participação. Oportunidade de retenção/comercial.
- Progressão automática / 1RM estimado com curva (regras linear/double/triple) — valioso pro professor;
  pode entrar aqui ou como fase própria conforme o peso.

## Dependências e ordem de execução (decidida)
1. **Fase E1** (execução rápida) — pode ir já, independente.
2. **Fase B** (billing + aluno autônomo + franquia IA + preservação) — ANTES da gamificação.
3. **Gamificação G1 → G2 → G3**, nessa ordem (tenant antes de global antes de social).
Decisões tomadas: aluno autônomo antes da gamificação; franquia de IA dentro do billing (B3);
ranking por tenant na G1 e global só na G2 (segurança primeiro).

## Observações
- Cada fase pesada (B, G*) usa design revisado antes de implementar; RLS/billing passam por review de segurança.
- Migrations acumulam — manter checklist de aplicação no Supabase (ver docs de migrations pendentes).
- Preços e price IDs reais do Stripe, revisão de custos de IA e textos comerciais ficam a cargo do usuário.
