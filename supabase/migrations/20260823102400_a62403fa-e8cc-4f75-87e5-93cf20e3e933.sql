ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS city_country text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'site-web',
  ADD COLUMN IF NOT EXISTS admin_notes text NOT NULL DEFAULT '';

ALTER TABLE public.contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_status_check
  CHECK (status IN ('nouveau','lu','en cours','contacté','qualifié','gagné','perdu','traité','archivé'));

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON public.contact_messages (status);