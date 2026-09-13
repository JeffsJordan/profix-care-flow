
CREATE POLICY "os fotos read own" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'os-fotos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "os fotos insert own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'os-fotos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "os fotos delete own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'os-fotos' AND (storage.foldername(name))[1] = auth.uid()::text);
