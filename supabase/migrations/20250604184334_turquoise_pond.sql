-- Add set_weights column to exercise_progress table
ALTER TABLE public.exercise_progress
ADD COLUMN IF NOT EXISTS set_weights numeric[] DEFAULT '{}';