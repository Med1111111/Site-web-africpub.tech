CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  site_title text NOT NULL DEFAULT '',
  site_description text NOT NULL DEFAULT '',
  hero_badge text NOT NULL DEFAULT '',
  cta_title text NOT NULL DEFAULT '',
  cta_sub text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL DEFAULT '213540481810',
  stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (site_title, site_description, hero_badge, cta_title, cta_sub, cta_label, whatsapp_number, stats)
VALUES (
  'Afric Pub — Communication globale',
  'Agence de communication globale : enseignes lumineuses, signalétique, impression grand format, habillage de véhicules et branding partout en Algérie.',
  'Communication visuelle premium — Algérie',
  'Donnons vie à votre enseigne',
  'Étude technique et devis détaillé gratuits sous 24 à 48h.',
  'Demander un devis',
  '213540481810',
  '[{"value":"1 200+","label":"Projets livrés"},{"value":"58","label":"Wilayas couvertes"},{"value":"18","label":"Années d''expérience"},{"value":"97%","label":"Clients fidélisés"}]'::jsonb
);