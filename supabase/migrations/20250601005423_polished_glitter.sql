-- Create exercise_progress table
CREATE TABLE public.exercise_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    weight numeric,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable RLS for exercise_progress
ALTER TABLE public.exercise_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercise_progress
CREATE POLICY "Users can view their own exercise progress" ON public.exercise_progress
FOR SELECT USING (
    student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their own exercise progress" ON public.exercise_progress
FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create workout_history table
CREATE TABLE public.workout_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    duration integer NOT NULL, -- in seconds
    exercises_completed integer NOT NULL,
    total_weight numeric,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable RLS for workout_history
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for workout_history
CREATE POLICY "Users can view their own workout history" ON public.workout_history
FOR SELECT USING (
    student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their own workout history" ON public.workout_history
FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Add updated_at trigger
CREATE TRIGGER set_timestamp 
    BEFORE UPDATE ON public.exercise_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp 
    BEFORE UPDATE ON public.workout_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();