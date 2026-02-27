
-- Lead vendors table for managing 3rd party lead sources
CREATE TABLE public.lead_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  website text,
  vendor_type text NOT NULL DEFAULT 'lead_provider',
  status text NOT NULL DEFAULT 'active',
  cost_per_lead numeric DEFAULT 0,
  monthly_budget numeric DEFAULT 0,
  contract_start date,
  contract_end date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_vendors ENABLE ROW LEVEL SECURITY;

-- Only admin/owner can manage vendors
CREATE POLICY "Admins and owners can view vendors"
  ON public.lead_vendors FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'marketing'::app_role]));

CREATE POLICY "Admins and owners can insert vendors"
  ON public.lead_vendors FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins and owners can update vendors"
  ON public.lead_vendors FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins and owners can delete vendors"
  ON public.lead_vendors FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

-- Add vendor_id to leads table to track which vendor sourced the lead
ALTER TABLE public.leads ADD COLUMN vendor_id uuid REFERENCES public.lead_vendors(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_lead_vendors_updated_at
  BEFORE UPDATE ON public.lead_vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
