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