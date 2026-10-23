-- =============================================================================
-- Flvxus — Modelos de treino (is_template = true) para o tenant Treinador Eising
-- =============================================================================
-- Rode no SQL Editor DEPOIS de supabase/seed-exercicios-tenant.sql (precisa do
-- catálogo de exercícios já cadastrado). Cada item busca o exercício pelo NOME
-- dentro do tenant (JOIN por nome) — não precisa colar IDs.
--
-- Tenant:  ae4e4d12-7d48-4e23-8ef1-ccab78144d5d   (Treinador Eising)
-- Trainer: 04da75ff-9966-408c-942e-461acca2537d   (created_by)
--
-- ATENÇÃO (integridade por nome): o JOIN `on e.name = i.nome` NÃO falha se o
-- nome não existir; o item simplesmente não é inserido. Por isso, todos os
-- `i.nome` abaixo usam o NOME CANÔNICO EXATO do catálogo (seed-exercicios-tenant).
-- Há uma query de verificação de órfãos comentada no fim deste arquivo.
--
-- Valores de sets/reps/rest: hipertrofia. Compostos ~3-4x8-12 (90-120s);
-- isoladores ~3x12-15 (45-60s); core/panturrilha ~3x15-20 (45s).
-- =============================================================================


delete from public.workouts
where tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d'
  and is_template = true
  and name in (
    'ABCDE Superior — A (Peito, Ombros, Tríceps)',
    'ABCDE Superior — B (Costas, Bíceps)',
    'ABCDE Superior — C (Membros Inferiores)',
    'ABCDE Superior — D (Ombros, Peito, Tríceps)',
    'ABCDE Superior — E (Bíceps, Costas, Abdômen)',
    'ABCD Avançado — A (Peito, Bíceps, Abdômen)',
    'ABCD Avançado — B (Costas, Panturrilha)',
    'ABCD Avançado — C (Ombros, Tríceps, Abdômen)',
    'ABCD Avançado — D (Membros Inferiores, Panturrilha)',
    'PPL ABCDEF — A (Costas, Bíceps, Abdômen)',
    'PPL ABCDEF — B (Peito, Ombros, Tríceps, Panturrilha)',
    'PPL ABCDEF — C (Membros Inferiores)',
    'PPL ABCDEF — D (Costas, Bíceps, Abdômen)',
    'PPL ABCDEF — E (Peito, Ombros, Tríceps, Panturrilha)',
    'PPL ABCDEF — F (Membros Inferiores)',
    'PPL ABC — A (Costas, Bíceps, Abdômen)',
    'PPL ABC — B (Peito, Ombros, Tríceps, Panturrilha)',
    'PPL ABC — C (Membros Inferiores)',
    'Upper-Lower — Upper 1 (Membros Superiores)',
    'Upper-Lower — Lower 1 (Membros Inferiores)',
    'Upper-Lower — Upper 2 (Membros Superiores)',
    'Upper-Lower — Lower 2 (Membros Inferiores)',
    'Push-Pull-Leg-Upper-Lower — Pull (Costas, Bíceps)',
    'Push-Pull-Leg-Upper-Lower — Push (Peito, Ombros, Tríceps)',
    'Push-Pull-Leg-Upper-Lower — Legs (Pernas)',
    'Push-Pull-Leg-Upper-Lower — Upper (Membros Superiores)',
    'Push-Pull-Leg-Upper-Lower — Lower (Membros Inferiores)',
    'Men''s Physique — A (Costas)',
    'Men''s Physique — B (Peito, Ombros, Abdômen)',
    'Men''s Physique — C (Pernas)',
    'Men''s Physique — D (Costas, Panturrilha)',
    'Men''s Physique — E (Ombros, Tríceps, Peito, Abdômen)',
    'ABCDEF Classic Olympia — A (Costas)',
    'ABCDEF Classic Olympia — B (Peito, Ombros)',
    'ABCDEF Classic Olympia — C (Pernas)',
    'ABCDEF Classic Olympia — D (Costas)',
    'ABCDEF Classic Olympia — E (Peito, Ombros, Tríceps)',
    'ABCDEF Classic Olympia — F (Pernas)',
    'Mulheres 2x — A (Misto)',
    'Mulheres 2x — B (Misto)',
    'Mulheres 4x — A (Inferiores, Abdômen)',
    'Mulheres 4x — B (Superiores)',
    'Mulheres Avançada 3x — A (Quadríceps, Glúteos)',
    'Mulheres Avançada 3x — B (Superiores, Abdômen)',
    'Mulheres Avançada 3x — C (Posteriores, Glúteos)',
    'Feminino Upper-Lower — Lower 1 (Inferiores)',
    'Feminino Upper-Lower — Upper 1 (Superiores)',
    'Feminino Upper-Lower — Lower 2 (Inferiores)',
    'Feminino Upper-Lower — Upper 2 (Superiores)',
    'ABCDE Inferior — A (Quadríceps, Posteriores, Glúteos)',
    'ABCDE Inferior — B (Peito, Ombros, Tríceps)',
    'ABCDE Inferior — C (Costas, Bíceps, Panturrilhas)',
    'ABCDE Inferior — D (Posteriores, Glúteos, Quadríceps)',
    'ABCDE Inferior — E (Upper Body, Panturrilhas)',
    'Adaptação Muscular — A/B (Corpo Inteiro)',
    'Iniciantes 2x — A (Membros Superiores)',
    'Iniciantes 2x — B (Membros Inferiores, Abdômen)',
    'Iniciantes 4x — A (Membros Superiores)',
    'Iniciantes 4x — B (Membros Inferiores, Abdômen)',
    'ABCD Intermediário — A (Peito, Bíceps, Abdômen)',
    'ABCD Intermediário — B (Costas, Panturrilha)',
    'ABCD Intermediário — C (Ombros, Tríceps, Abdômen)',
    'ABCD Intermediário — D (Pernas)',
    'PPL ABC Intermediário — A (Costas, Bíceps, Abdômen)',
    'PPL ABC Intermediário — B (Peito, Ombros, Tríceps, Panturrilha)',
    'PPL ABC Intermediário — C (Membros Inferiores)'
  );


-- ABCDE Superior — A (Peito, Ombros, Tríceps)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Superior — A (Peito, Ombros, Tríceps)',
          'Peito, ombros e tríceps. Divisão ABCDE 5x/semana (ênfase em superiores).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Supino declinado com barra', 3, '10-12', 90),
  (3, 'Voador (Peck Deck)', 3, '12-15', 60),
  (4, 'Elevação frontal com halteres', 3, '12-15', 60),
  (5, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (6, 'Tríceps francês na corda', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDE Superior — B (Costas, Bíceps)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Superior — B (Costas, Bíceps)',
          'Costas e bíceps. Divisão ABCDE 5x/semana (ênfase em superiores).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa triângulo', 3, '10-12', 90),
  (2, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Meio Terra', 3, '10-12', 90),
  (5, 'Hiper extensão no banco romano', 3, '12-15', 60),
  (6, 'Rosca scott máquina ou cabo', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDE Superior — C (Membros Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Superior — C (Membros Inferiores)',
          'Membros inferiores. Divisão ABCDE 5x/semana (ênfase em superiores).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Agachamento livre', 3, '10-12', 90),
  (1, 'Leg 45', 3, '10-12', 90),
  (2, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (3, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (4, 'Stiff', 3, '10-12', 90),
  (5, 'Elevação de quadril', 3, '10-12', 90),
  (6, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDE Superior — D (Ombros, Peito, Tríceps)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Superior — D (Ombros, Peito, Tríceps)',
          'Ombros com estímulo em peito e tríceps. Divisão ABCDE 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (1, 'Elevação frontal com halteres', 3, '12-15', 60),
  (2, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (3, 'Elevação lateral máquina ou unilateral no cabo', 3, '12-15', 60),
  (4, 'Voador (Peck Deck)', 3, '12-15', 60),
  (5, 'Tríceps corda', 3, '12-15', 60),
  (6, 'Tríceps testa corda banco 35 graus', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDE Superior — E (Bíceps, Costas, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Superior — E (Bíceps, Costas, Abdômen)',
          'Bíceps, costas e abdômen. Divisão ABCDE 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Rosca direta cabo', 3, '12-15', 60),
  (1, 'Rosca direta corda', 3, '12-15', 60),
  (2, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (3, 'Pulley frente aberto', 3, '10-12', 90),
  (4, 'Pulley frente triângulo', 3, '10-12', 90),
  (5, 'Serrote', 3, '10-12', 90),
  (6, 'Abdominal infra na torre', 3, '15-20', 45),
  (7, 'Abdominal supra na prancha declinada', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCD Avançado — A (Peito, Bíceps, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCD Avançado — A (Peito, Bíceps, Abdômen)',
          'Peito, bíceps e abdômen. Divisão ABCD 4x/semana (avançado, séries até a falha).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Supino declinado com barra', 3, '10-12', 90),
  (3, 'Voador (Peck Deck)', 3, '12-15', 60),
  (4, 'Rosca direta barra livre ou cabo com barra', 3, '12-15', 60),
  (5, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (6, 'Rosca direta corda', 3, '12-15', 60),
  (7, 'Abdominal supra na prancha declinada', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCD Avançado — B (Costas, Panturrilha)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCD Avançado — B (Costas, Panturrilha)',
          'Costas e panturrilha. Divisão ABCD 4x/semana (avançado).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa triângulo', 3, '10-12', 90),
  (2, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Meio Terra', 3, '10-12', 90),
  (5, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCD Avançado — C (Ombros, Tríceps, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCD Avançado — C (Ombros, Tríceps, Abdômen)',
          'Ombros, tríceps e abdômen. Divisão ABCD 4x/semana (avançado).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (1, 'Elevação frontal corda ou halteres', 3, '12-15', 60),
  (2, 'Elevação lateral com halteres', 3, '12-15', 60),
  (3, 'Elevação unilateral cabo', 3, '12-15', 60),
  (4, 'Tríceps testa corda', 3, '12-15', 60),
  (5, 'Tríceps corda', 3, '12-15', 60),
  (6, 'Tríceps francês com halter (sentado)', 3, '12-15', 60),
  (7, 'Abdominal infra na torre', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCD Avançado — D (Membros Inferiores, Panturrilha)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCD Avançado — D (Membros Inferiores, Panturrilha)',
          'Membros inferiores e panturrilha. Divisão ABCD 4x/semana (avançado).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Panturrilha sentada', 4, '15-20', 45),
  (1, 'Agachamento livre', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (4, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (5, 'Stiff', 3, '10-12', 90),
  (6, 'Elevação de quadril', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABCDEF — A (Costas, Bíceps, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABCDEF — A (Costas, Bíceps, Abdômen)',
          'Pull: costas, bíceps e abdômen. PPL 6x/semana (ABC descanso DEF).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa triângulo', 3, '10-12', 90),
  (2, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Meio Terra', 3, '10-12', 90),
  (5, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (6, 'Abdominal infra na torre', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABCDEF — B (Peito, Ombros, Tríceps, Panturrilha)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABCDEF — B (Peito, Ombros, Tríceps, Panturrilha)',
          'Push: peito, ombros, tríceps e panturrilha. PPL 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Supino declinado com barra', 3, '10-12', 90),
  (3, 'Voador (Peck Deck)', 3, '12-15', 60),
  (4, 'Elevação frontal com halteres', 3, '12-15', 60),
  (5, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (6, 'Tríceps corda', 3, '12-15', 60),
  (7, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABCDEF — C (Membros Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABCDEF — C (Membros Inferiores)',
          'Legs 1: membros inferiores. PPL 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (1, 'Hack machine', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (4, 'Stiff', 3, '10-12', 90),
  (5, 'Elevação de quadril', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABCDEF — D (Costas, Bíceps, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABCDEF — D (Costas, Bíceps, Abdômen)',
          'Pull 2: costas, bíceps e abdômen. PPL 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (2, 'Pulley frente aberto', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Hiper extensão no banco romano', 3, '12-15', 60),
  (5, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (6, 'Abdominal supra na prancha declinada', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABCDEF — E (Peito, Ombros, Tríceps, Panturrilha)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABCDEF — E (Peito, Ombros, Tríceps, Panturrilha)',
          'Push 2: peito, ombros, tríceps e panturrilha. PPL 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Cross over', 3, '12-15', 60),
  (3, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (4, 'Elevação frontal com halteres', 3, '12-15', 60),
  (5, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (6, 'Tríceps francês com halter (sentado)', 3, '12-15', 60),
  (7, 'Panturrilha sentada', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABCDEF — F (Membros Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABCDEF — F (Membros Inferiores)',
          'Legs 2: membros inferiores. PPL 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (1, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (2, 'Stiff', 3, '10-12', 90),
  (3, 'Elevação de quadril', 3, '10-12', 90),
  (4, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (5, 'Extensor (Cadeira Extensora)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABC — A (Costas, Bíceps, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABC — A (Costas, Bíceps, Abdômen)',
          'Pull: costas, bíceps e abdômen. PPL 3x/semana (ABC).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa triângulo', 3, '10-12', 90),
  (2, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Meio Terra', 3, '10-12', 90),
  (5, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (6, 'Abdominal infra na torre', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABC — B (Peito, Ombros, Tríceps, Panturrilha)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABC — B (Peito, Ombros, Tríceps, Panturrilha)',
          'Push: peito, ombros, tríceps e panturrilha. PPL 3x/semana (ABC).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Supino declinado com barra', 3, '10-12', 90),
  (3, 'Voador (Peck Deck)', 3, '12-15', 60),
  (4, 'Elevação frontal com halteres', 3, '12-15', 60),
  (5, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (6, 'Tríceps corda', 3, '12-15', 60),
  (7, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABC — C (Membros Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABC — C (Membros Inferiores)',
          'Legs: membros inferiores. PPL 3x/semana (ABC).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (1, 'Hack machine', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (4, 'Stiff', 3, '10-12', 90),
  (5, 'Elevação de quadril', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Upper-Lower — Upper 1 (Membros Superiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Upper-Lower — Upper 1 (Membros Superiores)',
          'Membros superiores (sessão 1). Upper-Lower 4x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Voador (Peck Deck)', 3, '12-15', 60),
  (2, 'Pulley frente aberto', 3, '10-12', 90),
  (3, 'Remada baixa triângulo', 3, '10-12', 90),
  (4, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (5, 'Rosca direta banco 45 graus', 3, '12-15', 60),
  (6, 'Tríceps francês na corda', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Upper-Lower — Lower 1 (Membros Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Upper-Lower — Lower 1 (Membros Inferiores)',
          'Membros inferiores (sessão 1). Upper-Lower 4x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (1, 'Hack machine', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (4, 'Stiff', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Upper-Lower — Upper 2 (Membros Superiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Upper-Lower — Upper 2 (Membros Superiores)',
          'Membros superiores (sessão 2). Upper-Lower 4x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino reto com halteres', 3, '10-12', 90),
  (1, 'Cross over', 3, '12-15', 60),
  (2, 'Remada curvada com barra', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (5, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (6, 'Tríceps corda', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Upper-Lower — Lower 2 (Membros Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Upper-Lower — Lower 2 (Membros Inferiores)',
          'Membros inferiores (sessão 2). Upper-Lower 4x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (1, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (2, 'Elevação de quadril', 3, '10-12', 90),
  (3, 'Hack machine', 3, '10-12', 90),
  (4, 'Leg 45', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Push-Pull-Leg-Upper-Lower — Pull (Costas, Bíceps)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Push-Pull-Leg-Upper-Lower — Pull (Costas, Bíceps)',
          'Puxar: costas e bíceps. Divisão PPL + Upper/Lower 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (2, 'Serrote', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Rosca direta cabo', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Push-Pull-Leg-Upper-Lower — Push (Peito, Ombros, Tríceps)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Push-Pull-Leg-Upper-Lower — Push (Peito, Ombros, Tríceps)',
          'Empurrar: peito, ombros e tríceps. Divisão PPL + Upper/Lower 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Voador (Peck Deck)', 3, '12-15', 60),
  (3, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (4, 'Elevação lateral máquina ou unilateral no cabo', 3, '12-15', 60),
  (5, 'Tríceps pulley (puxada na polia alta)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Push-Pull-Leg-Upper-Lower — Legs (Pernas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Push-Pull-Leg-Upper-Lower — Legs (Pernas)',
          'Pernas. Divisão PPL + Upper/Lower 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (1, 'Hack machine', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (4, 'Stiff', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Push-Pull-Leg-Upper-Lower — Upper (Membros Superiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Push-Pull-Leg-Upper-Lower — Upper (Membros Superiores)',
          'Membros superiores. Divisão PPL + Upper/Lower 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino reto com halteres', 3, '10-12', 90),
  (1, 'Crucifixo inclinado cabo', 3, '12-15', 60),
  (2, 'Pulley frente aberto', 3, '10-12', 90),
  (3, 'Remada baixa triângulo', 3, '10-12', 90),
  (4, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (5, 'Rosca direta banco 45 graus', 3, '12-15', 60),
  (6, 'Tríceps francês na corda', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Push-Pull-Leg-Upper-Lower — Lower (Membros Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Push-Pull-Leg-Upper-Lower — Lower (Membros Inferiores)',
          'Membros inferiores. Divisão PPL + Upper/Lower 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (1, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (2, 'Elevação de quadril', 3, '10-12', 90),
  (3, 'Hack machine', 3, '10-12', 90),
  (4, 'Leg 45', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Men's Physique — A (Costas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Men''s Physique — A (Costas)',
          'Costas. Divisão Men''s Physique 5x/semana (volume em costas, ombros e peito superior).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa triângulo', 3, '10-12', 90),
  (2, 'Serrote', 3, '10-12', 90),
  (3, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (4, 'Pulley frente aberto', 3, '10-12', 90),
  (5, 'Hiper extensão no banco romano', 3, '12-15', 60),
  (6, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Men's Physique — B (Peito, Ombros, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Men''s Physique — B (Peito, Ombros, Abdômen)',
          'Peito, ombros e abdômen. Divisão Men''s Physique 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Voador (Peck Deck)', 3, '12-15', 60),
  (3, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (4, 'Abdominal supra na prancha declinada', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Men's Physique — C (Pernas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Men''s Physique — C (Pernas)',
          'Pernas. Divisão Men''s Physique 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (1, 'Hack machine', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (4, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (5, 'Adutor (Cadeira Adutora)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Men's Physique — D (Costas, Panturrilha)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Men''s Physique — D (Costas, Panturrilha)',
          'Costas e panturrilhas. Divisão Men''s Physique 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Pulley frente aberto', 3, '10-12', 90),
  (1, 'Pulley frente triângulo', 3, '10-12', 90),
  (2, 'Serrote', 3, '10-12', 90),
  (3, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (4, 'Voador inverso (Peck Deck Inverso)', 3, '12-15', 60),
  (5, 'Panturrilha sentada', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Men's Physique — E (Ombros, Tríceps, Peito, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Men''s Physique — E (Ombros, Tríceps, Peito, Abdômen)',
          'Ombros, tríceps, peito e abdômen. Divisão Men''s Physique 5x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (1, 'Elevação frontal com halteres', 3, '12-15', 60),
  (2, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (3, 'Tríceps francês na corda', 3, '12-15', 60),
  (4, 'Voador (Peck Deck)', 3, '12-15', 60),
  (5, 'Abdominal infra na torre', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDEF Classic Olympia — A (Costas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDEF Classic Olympia — A (Costas)',
          'Costas. Divisão Classic Olympia ABCDEF 6x/semana (volume alto, elite).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa triângulo', 3, '10-12', 90),
  (2, 'Serrote', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Hiper extensão no banco romano', 3, '12-15', 60),
  (5, 'Rosca scott máquina ou cabo', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDEF Classic Olympia — B (Peito, Ombros)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDEF Classic Olympia — B (Peito, Ombros)',
          'Peito e ombros. Divisão Classic Olympia ABCDEF 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Supino declinado com barra', 3, '10-12', 90),
  (3, 'Voador (Peck Deck)', 3, '12-15', 60),
  (4, 'Elevação frontal corda ou halteres', 3, '12-15', 60),
  (5, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (6, 'Tríceps corda', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDEF Classic Olympia — C (Pernas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDEF Classic Olympia — C (Pernas)',
          'Pernas. Divisão Classic Olympia ABCDEF 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Panturrilha sentada', 4, '15-20', 45),
  (1, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (2, 'Hack machine', 3, '10-12', 90),
  (3, 'Leg 45', 3, '10-12', 90),
  (4, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (5, 'Adutor (Cadeira Adutora)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDEF Classic Olympia — D (Costas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDEF Classic Olympia — D (Costas)',
          'Costas (2ª sessão). Divisão Classic Olympia ABCDEF 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Pull down com corda', 3, '12-15', 60),
  (1, 'Pulley frente aberto', 3, '10-12', 90),
  (2, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (3, 'Serrote', 3, '10-12', 90),
  (4, 'Hiper extensão no banco romano', 3, '12-15', 60),
  (5, 'Rosca direta cabo', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDEF Classic Olympia — E (Peito, Ombros, Tríceps)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDEF Classic Olympia — E (Peito, Ombros, Tríceps)',
          'Peito, ombros e tríceps. Divisão Classic Olympia ABCDEF 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Voador (Peck Deck)', 3, '12-15', 60),
  (3, 'Elevação frontal corda ou halteres', 3, '12-15', 60),
  (4, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (5, 'Elevação unilateral cabo', 3, '12-15', 60),
  (6, 'Paralela (peso do corpo)', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDEF Classic Olympia — F (Pernas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDEF Classic Olympia — F (Pernas)',
          'Pernas (2ª sessão). Divisão Classic Olympia ABCDEF 6x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45),
  (1, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (2, 'Stiff', 3, '10-12', 90),
  (3, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (4, 'Elevação de quadril', 3, '10-12', 90),
  (5, 'Extensor (Cadeira Extensora)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Mulheres 2x — A (Misto)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Mulheres 2x — A (Misto)',
          'Corpo inteiro (misto). Treino feminino 2x/semana (AB).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Leg 45', 3, '10-12', 90),
  (1, 'Supino reto com barra', 3, '10-12', 90),
  (2, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Adutor (Cadeira Adutora)', 3, '12-15', 60),
  (5, 'Elevação lateral com halteres', 3, '12-15', 60),
  (6, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (7, 'Tríceps corda', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Mulheres 2x — B (Misto)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Mulheres 2x — B (Misto)',
          'Corpo inteiro (misto). Treino feminino 2x/semana (AB).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (1, 'Voador (Peck Deck)', 3, '12-15', 60),
  (2, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (3, 'Remada baixa triângulo', 3, '10-12', 90),
  (4, 'Adutor (Cadeira Adutora)', 3, '12-15', 60),
  (5, 'Elevação frontal com halteres', 3, '12-15', 60),
  (6, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (7, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Mulheres 4x — A (Inferiores, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Mulheres 4x — A (Inferiores, Abdômen)',
          'Membros inferiores e abdômen. Treino feminino 4x/semana (AB 2x).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Leg 45', 3, '10-12', 90),
  (1, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (2, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (3, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (4, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (5, 'Adutor (Cadeira Adutora)', 3, '12-15', 60),
  (6, 'Abdominal supra no solo', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Mulheres 4x — B (Superiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Mulheres 4x — B (Superiores)',
          'Membros superiores. Treino feminino 4x/semana (AB 2x).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Pulley frente aberto', 3, '10-12', 90),
  (2, 'Remada baixa triângulo', 3, '10-12', 90),
  (3, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (4, 'Elevação lateral com halteres', 3, '12-15', 60),
  (5, 'Tríceps corda', 3, '12-15', 60),
  (6, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Mulheres Avançada 3x — A (Quadríceps, Glúteos)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Mulheres Avançada 3x — A (Quadríceps, Glúteos)',
          'Membros inferiores (foco quadríceps/glúteos). Treino feminino avançado 3x/semana (ABC).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Agachamento livre', 3, '10-12', 90),
  (1, 'Hack machine', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Elevação de quadril', 3, '10-12', 90),
  (4, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (5, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Mulheres Avançada 3x — B (Superiores, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Mulheres Avançada 3x — B (Superiores, Abdômen)',
          'Membros superiores e abdômen. Treino feminino avançado 3x/semana (ABC).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Abdominal supra na prancha declinada', 3, '15-20', 45),
  (1, 'Pulley frente aberto', 3, '10-12', 90),
  (2, 'Remada baixa triângulo', 3, '10-12', 90),
  (3, 'Supino inclinado com halteres', 3, '10-12', 90),
  (4, 'Elevação frontal com halteres', 3, '12-15', 60),
  (5, 'Elevação lateral com halteres', 3, '12-15', 60),
  (6, 'Tríceps corda', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Mulheres Avançada 3x — C (Posteriores, Glúteos)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Mulheres Avançada 3x — C (Posteriores, Glúteos)',
          'Membros inferiores (foco posteriores/glúteos). Treino feminino avançado 3x/semana (ABC).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (1, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (2, 'Stiff', 3, '10-12', 90),
  (3, 'Afundo no Smith com step', 3, '10-12', 90),
  (4, 'Elevação de quadril', 3, '10-12', 90),
  (5, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Feminino Upper-Lower — Lower 1 (Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Feminino Upper-Lower — Lower 1 (Inferiores)',
          'Membros inferiores (sessão 1). Treino feminino 4x/semana (Upper-Lower).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (1, 'Agachamento livre', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (4, 'Stiff', 3, '10-12', 90),
  (5, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Feminino Upper-Lower — Upper 1 (Superiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Feminino Upper-Lower — Upper 1 (Superiores)',
          'Membros superiores (sessão 1). Treino feminino 4x/semana (Upper-Lower).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Pulley frente aberto', 3, '10-12', 90),
  (2, 'Remada baixa triângulo', 3, '10-12', 90),
  (3, 'Elevação lateral com halteres', 3, '12-15', 60),
  (4, 'Tríceps francês na corda', 3, '12-15', 60),
  (5, 'Abdominal supra no solo', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Feminino Upper-Lower — Lower 2 (Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Feminino Upper-Lower — Lower 2 (Inferiores)',
          'Membros inferiores (sessão 2). Treino feminino 4x/semana (Upper-Lower).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (1, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (2, 'Elevação de quadril', 3, '10-12', 90),
  (3, 'Hack machine', 3, '10-12', 90),
  (4, 'Leg 45', 3, '10-12', 90),
  (5, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Feminino Upper-Lower — Upper 2 (Superiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Feminino Upper-Lower — Upper 2 (Superiores)',
          'Membros superiores (sessão 2). Treino feminino 4x/semana (Upper-Lower).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino reto com halteres', 3, '10-12', 90),
  (1, 'Remada curvada com barra', 3, '10-12', 90),
  (2, 'Pulley frente triângulo', 3, '10-12', 90),
  (3, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (4, 'Tríceps corda unilateral', 3, '12-15', 60),
  (5, 'Abdominal infra na torre', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDE Inferior — A (Quadríceps, Posteriores, Glúteos)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Inferior — A (Quadríceps, Posteriores, Glúteos)',
          'Quadríceps, posteriores e glúteos. Divisão ABCDE 5x/semana (ênfase em inferiores).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Agachamento livre', 3, '10-12', 90),
  (1, 'Hack machine', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (4, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (5, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDE Inferior — B (Peito, Ombros, Tríceps)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Inferior — B (Peito, Ombros, Tríceps)',
          'Peito, ombros e tríceps. Divisão ABCDE 5x/semana (ênfase em inferiores).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Supino declinado com barra', 3, '10-12', 90),
  (3, 'Voador (Peck Deck)', 3, '12-15', 60),
  (4, 'Elevação frontal com halteres', 3, '12-15', 60),
  (5, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (6, 'Tríceps corda', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDE Inferior — C (Costas, Bíceps, Panturrilhas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Inferior — C (Costas, Bíceps, Panturrilhas)',
          'Costas, bíceps e panturrilhas. Divisão ABCDE 5x/semana (ênfase em inferiores).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa triângulo', 3, '10-12', 90),
  (2, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Meio Terra', 3, '10-12', 90),
  (5, 'Hiper extensão no banco romano', 3, '12-15', 60),
  (6, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (7, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDE Inferior — D (Posteriores, Glúteos, Quadríceps)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Inferior — D (Posteriores, Glúteos, Quadríceps)',
          'Posteriores, glúteos e quadríceps. Divisão ABCDE 5x/semana (ênfase em inferiores).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (1, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (2, 'Stiff', 3, '10-12', 90),
  (3, 'Elevação de quadril', 3, '10-12', 90),
  (4, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (5, 'Extensor (Cadeira Extensora)', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCDE Inferior — E (Upper Body, Panturrilhas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCDE Inferior — E (Upper Body, Panturrilhas)',
          'Upper body e panturrilhas. Divisão ABCDE 5x/semana (ênfase em inferiores).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (5, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (6, 'Tríceps francês na corda', 3, '12-15', 60),
  (7, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Adaptação Muscular — A/B (Corpo Inteiro)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Adaptação Muscular — A/B (Corpo Inteiro)',
          'Corpo inteiro (full body). Iniciação e adaptação motora, 2x/semana.', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino reto com halteres', 3, '10-12', 90),
  (1, 'Leg 45', 3, '10-12', 90),
  (2, 'Pulley frente triângulo', 3, '10-12', 90),
  (3, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (4, 'Elevação lateral com halteres', 3, '12-15', 60),
  (5, 'Tríceps corda', 3, '12-15', 60),
  (6, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45),
  (7, 'Rosca direta sentado com halteres', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Iniciantes 2x — A (Membros Superiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Iniciantes 2x — A (Membros Superiores)',
          'Membros superiores. Iniciantes 2x/semana (AB).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Pulley frente aberto', 3, '10-12', 90),
  (3, 'Remada baixa triângulo', 3, '10-12', 90),
  (4, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (5, 'Elevação lateral com halteres', 3, '12-15', 60),
  (6, 'Tríceps corda', 3, '12-15', 60),
  (7, 'Rosca direta com barra reta', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Iniciantes 2x — B (Membros Inferiores, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Iniciantes 2x — B (Membros Inferiores, Abdômen)',
          'Membros inferiores e abdômen. Iniciantes 2x/semana (AB).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Leg 45', 3, '10-12', 90),
  (1, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (2, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (3, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (4, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (5, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45),
  (6, 'Abdominal supra no solo', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Iniciantes 4x — A (Membros Superiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Iniciantes 4x — A (Membros Superiores)',
          'Membros superiores. Iniciantes 4x/semana (AB 2x).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Pulley frente aberto', 3, '10-12', 90),
  (3, 'Remada baixa triângulo', 3, '10-12', 90),
  (4, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (5, 'Elevação lateral com halteres', 3, '12-15', 60),
  (6, 'Tríceps corda', 3, '12-15', 60),
  (7, 'Rosca direta com barra reta', 3, '12-15', 60)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- Iniciantes 4x — B (Membros Inferiores, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'Iniciantes 4x — B (Membros Inferiores, Abdômen)',
          'Membros inferiores e abdômen. Iniciantes 4x/semana (AB 2x).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Leg 45', 3, '10-12', 90),
  (1, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (2, 'Flexor sentado (Cadeira Flexora)', 3, '12-15', 60),
  (3, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (4, 'Abdutor (Cadeira Abdutora)', 3, '12-15', 60),
  (5, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45),
  (6, 'Abdominal supra no solo', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCD Intermediário — A (Peito, Bíceps, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCD Intermediário — A (Peito, Bíceps, Abdômen)',
          'Peito, bíceps e abdômen. Divisão ABCD 4x/semana (intermediário).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Supino declinado com barra', 3, '10-12', 90),
  (3, 'Voador (Peck Deck)', 3, '12-15', 60),
  (4, 'Rosca direta barra livre ou cabo com barra', 3, '12-15', 60),
  (5, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (6, 'Rosca direta corda', 3, '12-15', 60),
  (7, 'Abdominal supra na prancha declinada', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCD Intermediário — B (Costas, Panturrilha)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCD Intermediário — B (Costas, Panturrilha)',
          'Costas e panturrilha. Divisão ABCD 4x/semana (intermediário).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa triângulo', 3, '10-12', 90),
  (2, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Meio Terra', 3, '10-12', 90),
  (5, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCD Intermediário — C (Ombros, Tríceps, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCD Intermediário — C (Ombros, Tríceps, Abdômen)',
          'Ombros, tríceps e abdômen. Divisão ABCD 4x/semana (intermediário).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Desenvolvimento com halteres', 3, '10-12', 90),
  (1, 'Elevação frontal com halteres', 3, '12-15', 60),
  (2, 'Elevação lateral com halteres', 3, '12-15', 60),
  (3, 'Elevação unilateral cabo', 3, '12-15', 60),
  (4, 'Tríceps testa corda', 3, '12-15', 60),
  (5, 'Tríceps corda', 3, '12-15', 60),
  (6, 'Tríceps francês com halter (sentado)', 3, '12-15', 60),
  (7, 'Abdominal infra na torre', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- ABCD Intermediário — D (Pernas)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'ABCD Intermediário — D (Pernas)',
          'Pernas. Divisão ABCD 4x/semana (intermediário).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Panturrilha sentada', 4, '15-20', 45),
  (1, 'Agachamento livre', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (4, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (5, 'Stiff', 3, '10-12', 90),
  (6, 'Elevação de quadril', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABC Intermediário — A (Costas, Bíceps, Abdômen)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABC Intermediário — A (Costas, Bíceps, Abdômen)',
          'Pull: costas, bíceps e abdômen. PPL ABC 3x/semana (intermediário).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Remada curvada com barra', 3, '10-12', 90),
  (1, 'Remada baixa triângulo', 3, '10-12', 90),
  (2, 'Remada baixa pegada aberta', 3, '10-12', 90),
  (3, 'Pulley frente triângulo', 3, '10-12', 90),
  (4, 'Meio Terra', 3, '10-12', 90),
  (5, 'Rosca scott máquina ou cabo', 3, '12-15', 60),
  (6, 'Abdominal infra na torre', 3, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABC Intermediário — B (Peito, Ombros, Tríceps, Panturrilha)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABC Intermediário — B (Peito, Ombros, Tríceps, Panturrilha)',
          'Push: peito, ombros, tríceps e panturrilha. PPL ABC 3x/semana (intermediário).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Supino inclinado com halteres', 3, '10-12', 90),
  (1, 'Supino reto com halteres', 3, '10-12', 90),
  (2, 'Supino declinado com barra', 3, '10-12', 90),
  (3, 'Voador (Peck Deck)', 3, '12-15', 60),
  (4, 'Elevação frontal com halteres', 3, '12-15', 60),
  (5, 'Elevação lateral sentado com halteres', 3, '12-15', 60),
  (6, 'Tríceps corda', 3, '12-15', 60),
  (7, 'Panturrilha em pé na máquina ou no smith', 4, '15-20', 45)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;

-- PPL ABC Intermediário — C (Membros Inferiores)
with novo as (
  insert into public.workouts (tenant_id, name, description, is_template, created_by)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d', 'PPL ABC Intermediário — C (Membros Inferiores)',
          'Legs: membros inferiores. PPL ABC 3x/semana (intermediário).', true,
          '04da75ff-9966-408c-942e-461acca2537d')
  returning id
),
itens (ordem, nome, sets, reps, descanso) as (values
  (0, 'Extensor (Cadeira Extensora)', 3, '12-15', 60),
  (1, 'Hack machine', 3, '10-12', 90),
  (2, 'Leg 45', 3, '10-12', 90),
  (3, 'Flexor deitado (Mesa Flexora)', 3, '12-15', 60),
  (4, 'Stiff', 3, '10-12', 90),
  (5, 'Elevação de quadril', 3, '10-12', 90)
)
insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_seconds)
select novo.id, e.id, i.ordem, i.sets, i.reps, i.descanso
from novo join itens i on true
join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;


-- =============================================================================
-- VERIFICAÇÃO (opcional) — rode os SELECT abaixo depois dos inserts acima.
-- =============================================================================
-- Conta, por modelo, quantos exercícios foram EFETIVAMENTE inseridos. Se algum
-- nome de item não existir no catálogo, o item some silenciosamente (o JOIN por
-- nome não falha) e a contagem fica menor que o esperado.
--
-- select w.name as modelo, count(we.id) as itens
-- from public.workouts w
-- left join public.workout_exercises we on we.workout_id = w.id
-- where w.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d'
--   and w.is_template = true
-- group by w.name
-- order by w.name;
--
-- Referência dos nomes exatos do catálogo:
--
-- select name from public.exercises
-- where tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d'
-- order by name;

-- =============================================================================
-- EXEMPLO (comentado) — criar uma ficha LIBERADA para um aluno. Só rode DEPOIS
-- de ter um aluno cadastrado; troque <STUDENT_USER_ID> pelo user_id do aluno
-- (profiles.user_id). Monta uma divisão A/B/C por dia (seg/qua/sex). Os nomes
-- dos itens são os NOMES EXATOS do catálogo (JOIN por nome).
-- weekday: 0=domingo .. 6=sábado.
-- =============================================================================
--
-- with ficha as (
--   insert into public.workout_plans
--     (tenant_id, student_id, trainer_id, name, status, released_at)
--   values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d',
--           '<STUDENT_USER_ID>',
--           '04da75ff-9966-408c-942e-461acca2537d',
--           'Treino ABC', 'released', now())
--   returning id
-- ),
-- itens (weekday, ordem, nome, sets, reps, descanso, obs) as (values
--   -- SEGUNDA (A) - Push
--   (1, 0, 'Supino inclinado com halteres',          3, '10-12', 90, 'Dia A'),
--   (1, 1, 'Supino reto com halteres',               3, '10-12', 90, NULL),
--   (1, 2, 'Voador (Peck Deck)',                      3, '12-15', 60, NULL),
--   (1, 3, 'Elevação lateral sentado com halteres',  3, '12-15', 45, NULL),
--   (1, 4, 'Tríceps corda',                          3, '12-15', 60, NULL),
--   -- QUARTA (B) - Pull
--   (3, 0, 'Remada curvada com barra',               3, '10-12', 90, 'Dia B'),
--   (3, 1, 'Pulley frente triângulo',                3, '10-12', 90, NULL),
--   (3, 2, 'Remada baixa triângulo',                 3, '10-12', 90, NULL),
--   (3, 3, 'Rosca scott máquina ou cabo',            3, '12-15', 60, NULL),
--   (3, 4, 'Abdominal infra na torre',               3, '15-20', 45, NULL),
--   -- SEXTA (C) - Legs
--   (5, 0, 'Agachamento livre',                      3, '10-12', 90, 'Dia C'),
--   (5, 1, 'Leg 45',                                 3, '10-12', 90, NULL),
--   (5, 2, 'Extensor (Cadeira Extensora)',           3, '12-15', 60, NULL),
--   (5, 3, 'Flexor deitado (Mesa Flexora)',          3, '12-15', 60, NULL),
--   (5, 4, 'Elevação de quadril',                    3, '10-12', 90, NULL),
--   (5, 5, 'Panturrilha em pé na máquina ou no smith', 3, '15-20', 45, NULL)
-- )
-- insert into public.workout_plan_items
--   (plan_id, exercise_id, weekday, order_index, sets, reps, rest_seconds, notes)
-- select ficha.id, e.id, i.weekday, i.ordem, i.sets, i.reps, i.descanso, i.obs
-- from ficha join itens i on true
-- join public.exercises e on e.tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d' and e.name = i.nome;
