
CREATE TABLE public.lead_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  fbclid text,
  msclkid text,
  referrer_url text,
  landing_page text,
  device_type text,
  browser text,
  os text,
  screen_resolution text,
  ip_geolocation text,
  session_duration_seconds integer,
  pages_visited integer,
  page_path_history text[],
  form_started_at timestamptz,
  form_completed_at timestamptz,
  lead_source_self_reported text,
  preferred_contact_method text,
  move_urgency text,
  sms_consent boolean DEFAULT false,
  sms_consent_timestamp timestamptz,
  sms_consent_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view lead attribution"
ON public.lead_attribution FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role, 'marketing'::app_role]));

CREATE POLICY "Staff can insert lead attribution"
ON public.lead_attribution FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));
