CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings viewable by everyone"
  ON public.site_settings FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can insert site settings"
  ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update site settings"
  ON public.site_settings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete site settings"
  ON public.site_settings FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();