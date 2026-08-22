ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS company_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false;