ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS attachment_path text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS attachment_name text NOT NULL DEFAULT '';