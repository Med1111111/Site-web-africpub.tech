-- Restrict access to the private lead-attachments bucket at the database level.
CREATE POLICY "Admins can read lead attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'lead-attachments' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload lead attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'lead-attachments' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lead attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'lead-attachments' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'lead-attachments' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lead attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'lead-attachments' AND public.has_role(auth.uid(), 'admin'));