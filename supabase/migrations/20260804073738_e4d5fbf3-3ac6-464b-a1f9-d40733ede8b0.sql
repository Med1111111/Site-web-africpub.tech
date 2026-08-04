CREATE TABLE public.lead_throttle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX lead_throttle_lookup_idx ON public.lead_throttle (fingerprint, kind, created_at DESC);

GRANT ALL ON public.lead_throttle TO service_role;

ALTER TABLE public.lead_throttle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view throttle log"
  ON public.lead_throttle FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.register_lead_attempt(
  _fingerprint text,
  _kind text,
  _max_attempts integer,
  _window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  IF _fingerprint IS NULL OR length(_fingerprint) = 0 THEN
    RETURN true;
  END IF;

  _max_attempts := greatest(1, least(coalesce(_max_attempts, 3), 50));
  _window_seconds := greatest(10, least(coalesce(_window_seconds, 3600), 86400));

  DELETE FROM public.lead_throttle WHERE created_at < now() - interval '24 hours';

  SELECT count(*) INTO recent_count
  FROM public.lead_throttle
  WHERE fingerprint = _fingerprint
    AND kind = _kind
    AND created_at > now() - make_interval(secs => _window_seconds);

  IF recent_count >= _max_attempts THEN
    RETURN false;
  END IF;

  INSERT INTO public.lead_throttle (fingerprint, kind) VALUES (_fingerprint, _kind);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.register_lead_attempt(text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_lead_attempt(text, text, integer, integer) TO anon, authenticated, service_role;