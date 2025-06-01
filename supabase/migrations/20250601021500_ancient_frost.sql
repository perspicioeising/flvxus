-- Drop existing columns from physical_assessments
ALTER TABLE public.physical_assessments
DROP COLUMN IF EXISTS body_fat,
DROP COLUMN IF EXISTS muscle_mass,
DROP COLUMN IF EXISTS bmi,
DROP COLUMN IF EXISTS measurements;

-- Add new columns to physical_assessments
ALTER TABLE public.physical_assessments
ADD COLUMN IF NOT EXISTS body_density numeric,
ADD COLUMN IF NOT EXISTS fat_percentage numeric,
ADD COLUMN IF NOT EXISTS fat_mass numeric,
ADD COLUMN IF NOT EXISTS lean_mass numeric;

-- Add updated_at trigger if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp' AND tgrelid = 'public.physical_assessments'::regclass) THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE ON public.physical_assessments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;