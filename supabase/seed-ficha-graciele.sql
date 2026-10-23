-- =============================================================================
-- Flvxus — Ficha ABCDE da aluna Graciele Graebin (LIBERADA)
-- =============================================================================
-- Rode no SQL Editor DEPOIS do catálogo de exercícios do tenant.
-- Cria uma ficha "Treino ABCDE — Graciele" status 'released', com divisão por
-- DIA DA SEMANA (weekday): seg=1, ter=2, qua=3, qui=4, sex=5.
-- Itens referenciados por UUID (à prova de erro). Sem begin/commit (autocommit).
--
-- Tenant:  ae4e4d12-7d48-4e23-8ef1-ccab78144d5d  (Treinador Eising)
-- Prof.:   04da75ff-9966-408c-942e-461acca2537d  (trainer_id)
-- Aluna:   07ecb2df-c740-4785-a293-c977180ab2b8  (Graciele Graebin)
--
-- Idempotente: remove a ficha com este nome para a aluna antes de recriar.
-- =============================================================================

delete from public.workout_plans
where tenant_id = 'ae4e4d12-7d48-4e23-8ef1-ccab78144d5d'
  and student_id = '07ecb2df-c740-4785-a293-c977180ab2b8'
  and name = 'Treino ABCDE — Graciele';

with ficha as (
  insert into public.workout_plans
    (tenant_id, student_id, trainer_id, name, status, released_at)
  values ('ae4e4d12-7d48-4e23-8ef1-ccab78144d5d',
          '07ecb2df-c740-4785-a293-c977180ab2b8',
          '04da75ff-9966-408c-942e-461acca2537d',
          'Treino ABCDE — Graciele', 'released', now())
  returning id
)
insert into public.workout_plan_items
  (plan_id, exercise_id, weekday, order_index, sets, reps, rest_seconds, notes)
select ficha.id, v.ex, v.wd, v.ord, v.s, v.r, v.rest, v.n
from ficha, (values
  -- ===== SEGUNDA (A) — Quadríceps e Glúteo =====
  ('5e484932-77e1-4b89-8c27-47c286de1c12'::uuid, 1, 0, 4, '8-12',  120, 'Treino A — Quadríceps e Glúteo'),
  ('bd359b27-b6e4-44d1-b0ad-215a87acab6e'::uuid, 1, 1, 4, '10-12', 90,  NULL),  -- Leg press 45°
  ('d774ed1c-ac54-45f0-86e5-bfe90c490261'::uuid, 1, 2, 3, '10-12', 90,  NULL),  -- Hack machine
  ('03ed8a4c-757e-4b6e-bde4-c9a37f809d1c'::uuid, 1, 3, 3, '12-15', 60,  NULL),  -- Cadeira extensora
  ('a50c4625-5eb3-4586-80c9-3b4aefef48d0'::uuid, 1, 4, 4, '15-20', 45,  'Panturrilha em pé'),

  -- ===== TERÇA (B) — Costas e Bíceps =====
  ('ea73b38c-9adb-4945-ae34-2c3bdd294a9d'::uuid, 2, 0, 4, '10-12', 90, 'Treino B — Costas e Bíceps'),  -- Pulley frente aberto
  ('b9b6d34a-bf20-439a-8953-7de28d898fe9'::uuid, 2, 1, 4, '10-12', 75, NULL),  -- Remada baixa triângulo
  ('63d367ad-1757-485d-8ee5-858829169d24'::uuid, 2, 2, 3, '10-12', 75, 'Serrote / remada unilateral'),
  ('05dfc2cc-259c-4040-9c07-3901b53cab43'::uuid, 2, 3, 3, '12-15', 60, NULL),  -- Pull down com corda
  ('65e213cd-7a42-4ff2-88e1-8fdf648c773b'::uuid, 2, 4, 3, '10-12', 60, NULL),  -- Rosca direta barra W
  ('80a7f7b2-2e32-41f4-ad46-015c635135b4'::uuid, 2, 5, 3, '10-12', 60, NULL),  -- Rosca martelo

  -- ===== QUARTA (C) — Posterior de Coxa e Glúteo =====
  ('368d17bf-177f-40c2-8f8c-3df63d977de3'::uuid, 3, 0, 4, '8-12',  90, 'Treino C — Posterior e Glúteo'),  -- Stiff
  ('7d7312da-55d6-4067-bba7-d9e0361eaeba'::uuid, 3, 1, 4, '12-15', 60, NULL),  -- Mesa flexora
  ('b574e039-2b3d-4fc9-aaa4-74406a93530b'::uuid, 3, 2, 3, '12-15', 60, NULL),  -- Flexor sentado
  ('f2ccfb80-122b-4e6c-aba8-527a1cc60ff1'::uuid, 3, 3, 4, '10-12', 90, 'Hip thrust — aperte os glúteos'),
  ('c1c7ff09-722b-48ca-a37c-fa7ef784e398'::uuid, 3, 4, 4, '15-20', 45, NULL),  -- Panturrilha sentada

  -- ===== QUINTA (D) — Peito, Ombro e Tríceps =====
  ('13fcd952-4a7a-4079-8d23-bb336cace314'::uuid, 4, 0, 4, '8-12',  90, 'Treino D — Peito, Ombro e Tríceps'),  -- Supino reto halteres
  ('e8c8c9f3-a02e-48ba-b02a-6e4821ccb534'::uuid, 4, 1, 3, '10-12', 75, NULL),  -- Desenvolvimento halteres
  ('54d22231-1c96-480e-9446-bb2de77efd05'::uuid, 4, 2, 3, '10-12', 75, 'Supino inclinado'),
  ('51c42540-e2aa-40ec-b378-e00d7979aafd'::uuid, 4, 3, 4, '12-15', 60, NULL),  -- Elevação lateral sentado
  ('56e96517-c663-45f9-b92f-3fdf437b5150'::uuid, 4, 4, 3, '10-12', 60, NULL),  -- Tríceps corda
  ('6267fe01-7244-4e30-9f26-ef73233444ce'::uuid, 4, 5, 3, '12-15', 60, NULL),  -- Face pull

  -- ===== SEXTA (E) — Glúteo e Abdômen =====
  ('f2ccfb80-122b-4e6c-aba8-527a1cc60ff1'::uuid, 5, 0, 4, '8-10',  90, 'Treino E — Glúteo e Abdômen · Hip thrust pesado'),
  ('439c3d4a-5e36-4958-b476-6f650f0e8678'::uuid, 5, 1, 3, '12-15', 60, 'Glúteo no cabo/máquina (coice)'),
  ('09bfa911-0110-437b-8929-f71929326f5c'::uuid, 5, 2, 4, '15-20', 45, 'Cadeira abdutora'),
  ('a89c7ee1-b147-41e6-b47e-0c9fe84d40c2'::uuid, 5, 3, 3, '12-15', 60, 'Passada andando com halteres'),
  ('67f336a0-31a5-43bd-9ee6-d1ed0742a0cb'::uuid, 5, 4, 3, '15-20', 45, 'Abdominal na polia'),
  ('541589d7-f5e3-4878-88fb-7358a94f2cd6'::uuid, 5, 5, 3, '30-45s', 45, 'Prancha frontal — tempo em segundos')
) as v(ex, wd, ord, s, r, rest, n);

-- Verificação (rode depois):
-- select p.name, i.weekday, count(*) as itens
-- from public.workout_plans p
-- join public.workout_plan_items i on i.plan_id = p.id
-- where p.student_id = '07ecb2df-c740-4785-a293-c977180ab2b8'
--   and p.name = 'Treino ABCDE — Graciele'
-- group by p.name, i.weekday order by i.weekday;
-- Esperado: weekday 1=5, 2=6, 3=5, 4=6, 5=6 itens.
