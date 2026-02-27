
-- Table for assigning agents to lead vendors with CPA thresholds
CREATE TABLE public.vendor_agent_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.lead_vendors(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  max_cpa numeric DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, agent_id)
);

ALTER TABLE public.vendor_agent_assignments ENABLE ROW LEVEL SECURITY;

-- Admins/owners can manage assignments
CREATE POLICY "Admins and owners can view assignments"
  ON public.vendor_agent_assignments FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Admins and owners can insert assignments"
  ON public.vendor_agent_assignments FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins and owners can update assignments"
  ON public.vendor_agent_assignments FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins and owners can delete assignments"
  ON public.vendor_agent_assignments FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

-- Agents can see their own assignments
CREATE POLICY "Agents can view own assignments"
  ON public.vendor_agent_assignments FOR SELECT
  USING (agent_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_vendor_agent_assignments_updated_at
  BEFORE UPDATE ON public.vendor_agent_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
