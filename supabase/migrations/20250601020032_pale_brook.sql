-- Create storage bucket for posture images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posture-images', 'posture-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload posture images
CREATE POLICY "Authenticated users can upload posture images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'posture-images' AND
  (storage.foldername(name))[1] = 'posture'
);

-- Allow users to read posture images from their tenant
CREATE POLICY "Users can view posture images from their tenant"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'posture-images'
);

-- Allow users to update their own posture images
CREATE POLICY "Users can update their own posture images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'posture-images' AND
  owner = auth.uid()
);

-- Allow users to delete their own posture images
CREATE POLICY "Users can delete their own posture images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'posture-images' AND
  owner = auth.uid()
);

-- Create the posture_assessments table
CREATE TABLE IF NOT EXISTS public.posture_assessments (
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

-- Enable Row Level Security (RLS) for posture_assessments
ALTER TABLE public.posture_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posture_assessments
CREATE POLICY "Posture assessments can be viewed by trainers in their tenant or by the assigned student"
ON public.posture_assessments FOR SELECT USING (
    tenant_id = public.get_tenant_id() AND
    (public.get_user_role() = 'trainer' OR student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Trainers can manage posture assessments in their tenant"
ON public.posture_assessments FOR ALL TO authenticated USING (
    public.get_user_role() = 'trainer' AND
    tenant_id = public.get_tenant_id()
);

-- Add updated_at trigger
CREATE TRIGGER set_timestamp 
    BEFORE UPDATE ON public.posture_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();