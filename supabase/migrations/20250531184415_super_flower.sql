-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function to handle new user sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_tenant_id uuid;
    is_student boolean;
BEGIN
    -- Check if this is a student creation
    is_student := (NEW.raw_user_meta_data->>'is_student_creation')::boolean;
    
    -- Only proceed with tenant and trainer profile creation if NOT a student
    IF NOT is_student THEN
        -- Create a tenant for the new user
        INSERT INTO public.tenants (
            name,
            plan,
            plan_type,
            max_students,
            max_trainers,
            owner_id
        ) VALUES (
            COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Fitness Business'),
            'free',
            'monthly',
            5, -- Free plan limits
            0,
            NEW.id
        ) RETURNING id INTO new_tenant_id;

        -- Create the trainer profile
        INSERT INTO public.profiles (
            user_id,
            email,
            full_name,
            role,
            tenant_id
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            'trainer',
            new_tenant_id
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();