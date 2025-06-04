-- Add audio_url column to exercises table
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS audio_url text;

-- Create storage bucket for exercise audio if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-audio', 'exercise-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload exercise audio
CREATE POLICY "Authenticated users can upload exercise audio"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'exercise-audio' AND
  (storage.foldername(name))[1] = 'audio'
);

-- Allow users to read audio from their tenant
CREATE POLICY "Users can view exercise audio from their tenant"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'exercise-audio'
);

-- Allow users to update their own audio
CREATE POLICY "Users can update their own exercise audio"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'exercise-audio' AND
  owner = auth.uid()
);

-- Allow users to delete their own audio
CREATE POLICY "Users can delete their own exercise audio"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'exercise-audio' AND
  owner = auth.uid()
);