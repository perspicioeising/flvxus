-- Add total_points and last_workout_date columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_workout_date timestamp with time zone;

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Add unique constraint to prevent duplicate achievements
ALTER TABLE public.user_achievements
ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);

-- Enable Row Level Security (RLS) for user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_achievements
CREATE POLICY "User achievements can be viewed by the user or trainers in the same tenant"
ON public.user_achievements FOR SELECT USING (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    tenant_id = public.get_tenant_id() AND public.get_user_role() = 'trainer'
);

CREATE POLICY "Trainers can manage user achievements in their tenant"
ON public.user_achievements FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Add updated_at trigger
CREATE TRIGGER set_timestamp 
    BEFORE UPDATE ON public.user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();