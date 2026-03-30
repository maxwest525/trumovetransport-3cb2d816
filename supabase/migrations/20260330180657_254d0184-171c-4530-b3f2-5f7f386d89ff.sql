
ALTER TABLE public.lead_attribution
  ADD COLUMN IF NOT EXISTS click_events jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hover_events jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_interactions jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS form_field_interactions jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rage_clicks integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_clicks integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_time_on_page jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS exit_intent_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scroll_milestones jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now();

-- Allow anon to update lead_attribution for behavior sync
CREATE POLICY "Anon can update lead_attribution"
  ON public.lead_attribution FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anon to insert lead_attribution
CREATE POLICY "Anon can insert lead_attribution"
  ON public.lead_attribution FOR INSERT
  TO anon
  WITH CHECK (true);
