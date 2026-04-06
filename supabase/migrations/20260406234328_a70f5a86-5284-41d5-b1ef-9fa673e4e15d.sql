
INSERT INTO storage.buckets (id, name, public) VALUES ('form-images', 'form-images', true);

CREATE POLICY "Anyone can view form images"
ON storage.objects FOR SELECT
USING (bucket_id = 'form-images');

CREATE POLICY "Authenticated users can upload form images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'form-images');

CREATE POLICY "Users can delete their own form images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'form-images' AND auth.uid()::text = (storage.foldername(name))[1]);
