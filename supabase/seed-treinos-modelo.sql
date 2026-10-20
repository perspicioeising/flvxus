-- =============================================================================
-- Flvxus — Modelos de treino + ficha liberada para o aluno (tenant do Bruno)
-- =============================================================================
-- Rode no SQL Editor DEPOIS de rodar supabase/seed-exercicios-tenant.sql
-- (precisa dos 40 exercícios já cadastrados). Os itens buscam o exercício
-- pelo NOME dentro do tenant — não precisa colar IDs.
--
-- Tenant:  c007ef49-db42-4598-80a6-41cb41df5a4f
-- Prof.:   b3033cc4-868b-48c9-b01d-1f8f81a5f94e  (created_by / trainer_id)
-- Aluno:   7cbfea9f-e820-4e56-a540-341ee57593ce  (brunosantoseising@gmail.com)
--
-- Parte 1: 5 MODELOS reutilizáveis (is_template = true).
-- Parte 2: 1 FICHA do aluno (workout_plans) status 'released', com divisão
--          A/B/C por dia da semana (seg/qua/sex) para testar a execução.
-- =============================================================================

-- ============================ PARTE 1 — MODELOS =============================

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

-- 1) Treino A — Peito e Tríceps
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
from novo join itens i on true
join public.exercises e on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;

-- 2) Treino B — Costas e Bíceps
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
from novo join itens i on true
join public.exercises e on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;

-- 3) Treino C — Pernas e Glúteos
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
from novo join itens i on true
join public.exercises e on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;

-- 4) Treino D — Ombros e Abdômen
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
from novo join itens i on true
join public.exercises e on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;

-- 5) Full Body — Iniciante
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
from novo join itens i on true
join public.exercises e on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;

-- ====================== PARTE 2 — FICHA DO ALUNO (LIBERADA) =================
-- Cria uma ficha "Treino ABC" para o aluno brunosantoseising@gmail.com, já
-- LIBERADA (status 'released'), com divisão por dia da semana:
--   weekday 1 (segunda) = A Peito/Tríceps
--   weekday 3 (quarta)  = B Costas/Bíceps
--   weekday 5 (sexta)   = C Pernas/Glúteos
-- (weekday: 0=domingo .. 6=sábado)

-- Idempotência: remove a ficha de teste anterior, se existir.
delete from public.workout_plans
where tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f'
  and student_id = '7cbfea9f-e820-4e56-a540-341ee57593ce'
  and name = 'Treino ABC';

with ficha as (
  insert into public.workout_plans
    (tenant_id, student_id, trainer_id, name, status, released_at)
  values ('c007ef49-db42-4598-80a6-41cb41df5a4f',
          '7cbfea9f-e820-4e56-a540-341ee57593ce',
          'b3033cc4-868b-48c9-b01d-1f8f81a5f94e',
          'Treino ABC', 'released', now())
  returning id
),
itens (weekday, ordem, nome, sets, reps, descanso, obs) as (values
  -- SEGUNDA (A) — Peito e Tríceps
  (1, 0, 'Supino reto com barra',            4, '8-12',  90, 'Dia A — Peito/Tríceps'),
  (1, 1, 'Supino inclinado com halteres',    3, '10-12', 75, NULL),
  (1, 2, 'Crucifixo na máquina (peck deck)', 3, '12-15', 60, NULL),
  (1, 3, 'Tríceps pulley (puxada na polia alta)', 3, '10-12', 60, NULL),
  (1, 4, 'Tríceps testa com barra W',        3, '10-12', 60, NULL),
  -- QUARTA (B) — Costas e Bíceps
  (3, 0, 'Puxada frontal na polia (pegada aberta)', 4, '8-12',  90, 'Dia B — Costas/Bíceps'),
  (3, 1, 'Remada curvada com barra',                4, '8-10',  90, NULL),
  (3, 2, 'Remada sentada na polia (cabo)',          3, '10-12', 75, NULL),
  (3, 3, 'Rosca direta com barra W (EZ)',           4, '10-12', 60, NULL),
  (3, 4, 'Rosca martelo com halteres',              3, '10-12', 60, NULL),
  -- SEXTA (C) — Pernas e Glúteos
  (5, 0, 'Agachamento livre com barra',       4, '8-10',  120, 'Dia C — Pernas/Glúteos'),
  (5, 1, 'Leg press 45°',                     4, '10-12', 90,  NULL),
  (5, 2, 'Cadeira extensora',                 3, '12-15', 60,  NULL),
  (5, 3, 'Mesa flexora (cadeira flexora)',    3, '12-15', 60,  NULL),
  (5, 4, 'Hip thrust (elevação pélvica) com barra', 3, '10-12', 75, NULL),
  (5, 5, 'Panturrilha no leg press (ou em pé na máquina)', 4, '15-20', 45, NULL)
)
insert into public.workout_plan_items
  (plan_id, exercise_id, weekday, order_index, sets, reps, rest_seconds, notes)
select ficha.id, e.id, i.weekday, i.ordem, i.sets, i.reps, i.descanso, i.obs
from ficha join itens i on true
join public.exercises e on e.tenant_id = 'c007ef49-db42-4598-80a6-41cb41df5a4f' and e.name = i.nome;
