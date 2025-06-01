-- Add new columns to physical_assessments table
ALTER TABLE public.physical_assessments
ADD COLUMN IF NOT EXISTS protocol text NOT NULL,
ADD COLUMN IF NOT EXISTS date date NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS gender text NOT NULL,
ADD COLUMN IF NOT EXISTS age integer NOT NULL,

-- Perimetry measurements
ADD COLUMN IF NOT EXISTS neck numeric,
ADD COLUMN IF NOT EXISTS shoulders numeric,
ADD COLUMN IF NOT EXISTS chest numeric,
ADD COLUMN IF NOT EXISTS abdomen numeric,
ADD COLUMN IF NOT EXISTS waist numeric,
ADD COLUMN IF NOT EXISTS hips numeric,
ADD COLUMN IF NOT EXISTS left_arm numeric,
ADD COLUMN IF NOT EXISTS right_arm numeric,
ADD COLUMN IF NOT EXISTS left_thigh numeric,
ADD COLUMN IF NOT EXISTS right_thigh numeric,
ADD COLUMN IF NOT EXISTS left_calf numeric,
ADD COLUMN IF NOT EXISTS right_calf numeric,

-- Skinfold measurements
ADD COLUMN IF NOT EXISTS triceps numeric,
ADD COLUMN IF NOT EXISTS abdominal numeric,
ADD COLUMN IF NOT EXISTS suprailiac numeric,

-- Calculated results
ADD COLUMN IF NOT EXISTS body_density numeric,
ADD COLUMN IF NOT EXISTS fat_percentage numeric,
ADD COLUMN IF NOT EXISTS fat_mass numeric,
ADD COLUMN IF NOT EXISTS lean_mass numeric,

-- Additional fields
ADD COLUMN IF NOT EXISTS notes text;