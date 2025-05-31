-- Add new columns to profiles table for student-specific information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS height numeric,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS goals text[],
ADD COLUMN IF NOT EXISTS medical_conditions text,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS preferred_training_time text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS notes text;