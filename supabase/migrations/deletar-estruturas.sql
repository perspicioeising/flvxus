-- Remove funções auxiliares de RLS
DROP FUNCTION IF EXISTS public.get_tenant_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

-- Remover tabelas na ordem reversa de dependência
DROP TABLE IF EXISTS public.physical_assessments CASCADE;
DROP TABLE IF EXISTS public.workout_plan_items CASCADE;
DROP TABLE IF EXISTS public.workout_plans CASCADE;
DROP TABLE IF EXISTS public.workout_exercises CASCADE;
DROP TABLE IF EXISTS public.workouts CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;
