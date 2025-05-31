-- RLS Helper Functions
CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _tenant_id uuid;
BEGIN
  SELECT tenant_id INTO _tenant_id FROM public.profiles WHERE user_id = auth.uid();
  RETURN _tenant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _role text;
BEGIN
  SELECT role INTO _role FROM public.profiles WHERE user_id = auth.uid();
  RETURN _role;
END;
$$;

-- Create the 'tenants' table
CREATE TABLE public.tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    plan text NOT NULL, -- 'free', 'platinum', 'gold'
    plan_type text NOT NULL, -- 'monthly', 'annual'
    max_students integer NOT NULL,
    max_trainers integer NOT NULL,
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for 'tenants'
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'tenants'
CREATE POLICY "Tenants can be viewed by their owner and members" ON public.tenants
FOR SELECT USING (
    id = public.get_tenant_id()
);

CREATE POLICY "Owners can create their own tenant" ON public.tenants
FOR INSERT WITH CHECK (
    owner_id = auth.uid()
);

CREATE POLICY "Owners can update their own tenant" ON public.tenants
FOR UPDATE USING (
    owner_id = auth.uid()
);

CREATE POLICY "Owners can delete their own tenant" ON public.tenants
FOR DELETE USING (
    owner_id = auth.uid()
);

-- Create the 'profiles' table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    avatar_url text,
    email text NOT NULL UNIQUE,
    phone text,
    role text NOT NULL, -- 'trainer' or 'student'
    trainer_id uuid REFERENCES public.profiles(id), -- For students linked to a trainer
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create a unique index on user_id for profiles
CREATE UNIQUE INDEX ON public.profiles (user_id);

-- Enable Row Level Security (RLS) for 'profiles'
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'profiles'
CREATE POLICY "Profiles can be viewed by their owner or trainers in the same tenant" ON public.profiles
FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id = public.get_tenant_id() AND public.get_user_role() = 'trainer'
);

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (
    user_id = auth.uid()
);

-- Trainers can insert student profiles within their tenant
CREATE POLICY "Trainers can insert student profiles" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id() AND
    role = 'student'
);

-- Trainers can update profiles of students/trainers in their tenant
CREATE POLICY "Trainers can update profiles in their tenant" ON public.profiles
FOR UPDATE TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Create the 'exercises' table
CREATE TABLE public.exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    video_url text,
    muscle_group text[] NOT NULL,
    equipment text[] NOT NULL,
    variations text[],
    tips text[],
    common_errors text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for 'exercises'
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'exercises'
CREATE POLICY "Exercises can be viewed by users in the same tenant" ON public.exercises
FOR SELECT USING (
    tenant_id = public.get_tenant_id()
);

CREATE POLICY "Trainers can manage exercises in their tenant" ON public.exercises
FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Create the 'workouts' table
CREATE TABLE public.workouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    level text NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    goal text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for 'workouts'
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'workouts'
CREATE POLICY "Workouts can be viewed by users in the same tenant" ON public.workouts
FOR SELECT USING (
    tenant_id = public.get_tenant_id()
);

CREATE POLICY "Trainers can manage workouts in their tenant" ON public.workouts
FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Create the 'workout_exercises' table
CREATE TABLE public.workout_exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    sets integer NOT NULL,
    reps integer,
    duration integer, -- in seconds
    rest integer NOT NULL, -- in seconds
    notes text,
    "order" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for 'workout_exercises'
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'workout_exercises'
CREATE POLICY "Workout exercises can be viewed by users in the same tenant" ON public.workout_exercises
FOR SELECT USING (
    tenant_id = public.get_tenant_id()
);

CREATE POLICY "Trainers can manage workout exercises in their tenant" ON public.workout_exercises
FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Create the 'workout_plans' table
CREATE TABLE public.workout_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for 'workout_plans'
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'workout_plans'
CREATE POLICY "Workout plans can be viewed by trainers in their tenant or by the assigned student" ON public.workout_plans
FOR SELECT USING (
    tenant_id = public.get_tenant_id() AND
    (public.get_user_role() = 'trainer' OR student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Trainers can manage workout plans in their tenant" ON public.workout_plans
FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Create the 'workout_plan_items' table
CREATE TABLE public.workout_plan_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_plan_id uuid NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL, -- 1 for Monday, 7 for Sunday
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for 'workout_plan_items'
ALTER TABLE public.workout_plan_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'workout_plan_items'
CREATE POLICY "Workout plan items can be viewed by users in the same tenant" ON public.workout_plan_items
FOR SELECT USING (
    tenant_id = public.get_tenant_id()
);

CREATE POLICY "Trainers can manage workout plan items in their tenant" ON public.workout_plan_items
FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Create the 'physical_assessments' table
CREATE TABLE public.physical_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    weight numeric NOT NULL,
    height numeric NOT NULL,
    body_fat numeric,
    muscle_mass numeric,
    bmi numeric,
    measurements jsonb, -- e.g., { "chest": 100, "waist": 75 }
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for 'physical_assessments'
ALTER TABLE public.physical_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'physical_assessments'
CREATE POLICY "Physical assessments can be viewed by trainers in their tenant or by the assigned student" ON public.physical_assessments
FOR SELECT USING (
    tenant_id = public.get_tenant_id() AND
    (public.get_user_role() = 'trainer' OR student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Trainers can manage physical assessments in their tenant" ON public.physical_assessments
FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Create the 'posture_assessments' table
CREATE TABLE public.posture_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    front_image_url text,
    side_image_url text,
    back_image_url text,
    ai_analysis jsonb,
    recommendations text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for 'posture_assessments'
ALTER TABLE public.posture_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'posture_assessments'
CREATE POLICY "Posture assessments can be viewed by trainers in their tenant or by the assigned student" ON public.posture_assessments
FOR SELECT USING (
    tenant_id = public.get_tenant_id() AND
    (public.get_user_role() = 'trainer' OR student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Trainers can manage posture assessments in their tenant" ON public.posture_assessments
FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Create the 'appointments' table
CREATE TABLE public.appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text NOT NULL, -- 'scheduled', 'completed', 'cancelled'
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for 'appointments'
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'appointments'
CREATE POLICY "Appointments can be viewed by trainers in their tenant or by the assigned student" ON public.appointments
FOR SELECT USING (
    tenant_id = public.get_tenant_id() AND
    (public.get_user_role() = 'trainer' OR student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Trainers can manage appointments in their tenant" ON public.appointments
FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Students can insert/update/delete their own appointments
CREATE POLICY "Students can manage their own appointments" ON public.appointments
FOR ALL TO authenticated USING (
    public.get_user_role() = 'student' AND
    student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Function to handle new user sign-ups (from auth.users to public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'trainer'); -- Default to 'trainer' role for new sign-ups
  RETURN NEW;
END;
$$;

-- Trigger to call handle_new_user function on new auth.users inserts
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up the `updated_at` column to update automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables that have an `updated_at` column
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('tenants', 'profiles', 'exercises', 'workouts', 'workout_exercises', 'workout_plans', 'workout_plan_items', 'physical_assessments', 'posture_assessments', 'appointments')
    LOOP
        EXECUTE format('CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql;