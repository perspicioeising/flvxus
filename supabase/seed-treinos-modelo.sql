-- =============================================================================
-- Flvxus — Modelos de treino para o tenant do Bruno
-- =============================================================================
-- Rode no SQL Editor DEPOIS de rodar supabase/seed-exercicios-tenant.sql
-- (precisa dos 40 exercícios já cadastrados). Os itens buscam o exercício
-- pelo NOME dentro do tenant — não precisa colar IDs.
--
-- Tenant: c007ef49-db42-4598-80a6-41cb41df5a4f
-- Usuário (created_by): b3033cc4-868b-48c9-b01d-1f8f81a5f94e
--
-- Cria 5 modelos reutilizáveis (is_template = true):
--   1) Treino A — Peito e Tríceps
--   2) Treino B — Costas e Bíceps
--   3) Treino C — Pernas e Glúteos
--   4) Treino D — Ombros e Abdômen
--   5) Full Body — Iniciante
--
-- Cada item resolve o exercise_id por subquery pelo nome. Se algum nome não
-- casar com o catálogo, aquele item é pulado (exercise_id NULL não é inserido,
-- pois a coluna é NOT NULL — veja a cláusula WHERE no SELECT).
-- =============================================================================

-- Idempotência: remove os modelos com estes nomes (itens somem via cascade).
delete from public.workouts
where tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f'
  and is_template = true
  and name in (
    'Treino A — Peito e Tríceps',
    'Treino B — Costas e Bíceps',
    'Treino C — Pernas e Glúteos',
    'Treino D — Ombros e Abdômen',
    'Full Body — Iniciante'
  );

-- ===================== 1) Treino A — Peito e Tríceps =======================
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('c007ef49-db42-4598-80a6-41cb41df5a4f', 'Treino A — Peito e Tríceps',
          'Treino de empurrar: foco em peito e tríceps.', true,
          'b3033cc4-868b-48c9-b01d-1f8f81a5f94e')
  returning id
),
itens (ordem, nome, sets, reps, descanso, obs) as (values
  (0, 'Supino reto com barra',            4, '8-12',  90, 'Exercício principal, carga progressiva'),
  (1, 'Supino inclinado com halteres',    3, '10-12', 75, NULL),
  (2, 'Crucifixo na máquina (peck deck)', 3, '12-15', 60, 'Foco na contração'),
  (3, 'Cross-over (polia alta)',          3, '12-15', 60, NULL),
  (4, 'Tríceps pulley (puxada na polia alta)', 4, '10-12', 60, NULL),
  (5, 'Tríceps testa com barra W',        3, '10-12', 60, NULL)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso, i.obs
from novo
join itens i on true
join public.exercises e
  on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;

-- ===================== 2) Treino B — Costas e Bíceps =======================
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('c007ef49-db42-4598-80a6-41cb41df5a4f', 'Treino B — Costas e Bíceps',
          'Treino de puxar: foco em costas e bíceps.', true,
          'b3033cc4-868b-48c9-b01d-1f8f81a5f94e')
  returning id
),
itens (ordem, nome, sets, reps, descanso, obs) as (values
  (0, 'Puxada frontal na polia (pegada aberta)', 4, '8-12',  90, 'Aperte as escápulas'),
  (1, 'Remada curvada com barra',                4, '8-10',  90, 'Costas neutras'),
  (2, 'Remada sentada na polia (cabo)',          3, '10-12', 75, NULL),
  (3, 'Pullover na polia',                       3, '12-15', 60, NULL),
  (4, 'Rosca direta com barra W (EZ)',           4, '10-12', 60, NULL),
  (5, 'Rosca martelo com halteres',              3, '10-12', 60, NULL)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso, i.obs
from novo
join itens i on true
join public.exercises e
  on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;

-- ===================== 3) Treino C — Pernas e Glúteos ======================
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('c007ef49-db42-4598-80a6-41cb41df5a4f', 'Treino C — Pernas e Glúteos',
          'Treino de membros inferiores completo.', true,
          'b3033cc4-868b-48c9-b01d-1f8f81a5f94e')
  returning id
),
itens (ordem, nome, sets, reps, descanso, obs) as (values
  (0, 'Agachamento livre com barra',       4, '8-10',  120, 'Exercício principal'),
  (1, 'Leg press 45°',                     4, '10-12', 90,  NULL),
  (2, 'Cadeira extensora',                 3, '12-15', 60,  NULL),
  (3, 'Stiff (levantamento terra romeno)', 3, '10-12', 90,  'Foco em posterior e glúteos'),
  (4, 'Mesa flexora (cadeira flexora)',    3, '12-15', 60,  NULL),
  (5, 'Hip thrust (elevação pélvica) com barra', 3, '10-12', 75, 'Aperte os glúteos no topo'),
  (6, 'Panturrilha no leg press (ou em pé na máquina)', 4, '15-20', 45, NULL)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso, i.obs
from novo
join itens i on true
join public.exercises e
  on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;

-- ===================== 4) Treino D — Ombros e Abdômen ======================
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('c007ef49-db42-4598-80a6-41cb41df5a4f', 'Treino D — Ombros e Abdômen',
          'Ombros completos e core.', true,
          'b3033cc4-868b-48c9-b01d-1f8f81a5f94e')
  returning id
),
itens (ordem, nome, sets, reps, descanso, obs) as (values
  (0, 'Desenvolvimento com halteres (sentado)', 4, '8-12',  90, NULL),
  (1, 'Elevação lateral com halteres',          4, '12-15', 60, 'Não subir acima dos ombros'),
  (2, 'Elevação frontal com halteres',          3, '12-15', 60, NULL),
  (3, 'Crucifixo inverso (posterior de ombro)', 3, '12-15', 60, NULL),
  (4, 'Prancha (plank) isométrica',             3, '30-45s', 45, 'Tempo em segundos'),
  (5, 'Abdominal crunch (tradicional)',         3, '15-20', 45, NULL),
  (6, 'Elevação de pernas (deitado)',           3, '12-15', 45, NULL)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso, i.obs
from novo
join itens i on true
join public.exercises e
  on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;

-- ===================== 5) Full Body — Iniciante ============================
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('c007ef49-db42-4598-80a6-41cb41df5a4f', 'Full Body — Iniciante',
          'Corpo inteiro para iniciantes, 3x por semana.', true,
          'b3033cc4-868b-48c9-b01d-1f8f81a5f94e')
  returning id
),
itens (ordem, nome, sets, reps, descanso, obs) as (values
  (0, 'Leg press 45°',                          3, '12-15', 75, 'Comece com carga leve'),
  (1, 'Supino reto com halteres',               3, '10-12', 75, NULL),
  (2, 'Puxada frontal na polia (pegada aberta)',3, '10-12', 75, NULL),
  (3, 'Desenvolvimento com halteres (sentado)', 3, '10-12', 60, NULL),
  (4, 'Rosca alternada com halteres',           2, '12-15', 60, NULL),
  (5, 'Tríceps pulley (puxada na polia alta)',  2, '12-15', 60, NULL),
  (6, 'Prancha (plank) isométrica',             3, '20-30s', 45, 'Tempo em segundos')
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso, i.obs
from novo
join itens i on true
join public.exercises e
  on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;
