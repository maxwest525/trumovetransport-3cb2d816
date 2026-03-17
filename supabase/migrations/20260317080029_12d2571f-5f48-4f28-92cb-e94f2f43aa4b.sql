
-- Pricing settings: global and per-lead-source controls
CREATE TABLE public.pricing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

-- Only admins/owners can view
CREATE POLICY "Admins can view pricing settings"
  ON public.pricing_settings FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

-- Only admins/owners can insert
CREATE POLICY "Admins can insert pricing settings"
  ON public.pricing_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

-- Only admins/owners can update
CREATE POLICY "Admins can update pricing settings"
  ON public.pricing_settings FOR UPDATE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

-- Only owners can delete
CREATE POLICY "Owners can delete pricing settings"
  ON public.pricing_settings FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role));

-- Seed default pricing settings
INSERT INTO public.pricing_settings (setting_key, setting_value, description) VALUES
  ('base_rate_per_cuft', '{"value": 5.50}', 'Base price per cubic foot'),
  ('base_rate_per_lb', '{"value": 0.65}', 'Base price per pound'),
  ('minimum_deposit_pct', '{"value": 25, "min_amount": 250}', 'Minimum deposit percentage and floor amount'),
  ('deposit_rules_by_source', '{"website": 25, "referral": 20, "ppc": 30, "phone": 25, "walk_in": 20, "other": 25}', 'Minimum deposit % by lead source'),
  ('carrier_rates', '{"default": {"per_mile": 1.85, "fuel_surcharge_pct": 8}, "carriers": []}', 'Carrier rate configuration'),
  ('weight_factors', '{"light_item_avg_lbs": 15, "medium_item_avg_lbs": 45, "heavy_item_avg_lbs": 120, "special_handling_multiplier": 1.5}', 'Weight estimation factors'),
  ('pricing_minimums', '{"minimum_job_value": 500, "minimum_local_rate": 150, "minimum_long_distance_rate": 800}', 'Minimum pricing floors'),
  ('distance_tiers', '{"local_max_miles": 50, "regional_max_miles": 250, "local_multiplier": 1.0, "regional_multiplier": 1.15, "long_distance_multiplier": 1.35}', 'Distance-based pricing tiers');
