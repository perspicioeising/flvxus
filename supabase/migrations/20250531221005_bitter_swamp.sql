-- Create storage bucket for exercise videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-videos', 'exercise-videos', true);

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload exercise videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'exercise-videos' AND
  (storage.foldername(name))[1] = 'videos'
);

-- Allow users to read videos from their tenant
CREATE POLICY "Users can view exercise videos from their tenant"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'exercise-videos'
);

-- Allow users to update their own videos
CREATE POLICY "Users can update their own exercise videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'exercise-videos' AND
  owner = auth.uid()
);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own exercise videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'exercise-videos' AND
  owner = auth.uid()
);