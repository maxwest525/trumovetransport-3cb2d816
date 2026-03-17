
CREATE TABLE public.move_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  property_type text NOT NULL DEFAULT 'house',
  bedrooms integer NOT NULL DEFAULT 2,
  floors integer NOT NULL DEFAULT 1,
  has_stairs boolean NOT NULL DEFAULT false,
  stair_flights integer NOT NULL DEFAULT 0,
  has_elevator boolean NOT NULL DEFAULT false,
  long_carry_ft integer NOT NULL DEFAULT 0,
  is_apartment boolean NOT NULL DEFAULT false,
  special_packaging boolean NOT NULL DEFAULT false,
  fragile_items boolean NOT NULL DEFAULT false,
  special_treatment_notes text,
  packing_service boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lead_id)
);

ALTER TABLE public.move_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view move details" ON public.move_details
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = move_details.lead_id
    AND (l.assigned_agent_id = auth.uid() OR l.assigned_agent_id IS NULL OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
  ));

CREATE POLICY "Agents can insert move details" ON public.move_details
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = move_details.lead_id
    AND (l.assigned_agent_id = auth.uid() OR l.assigned_agent_id IS NULL OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
  ));

CREATE POLICY "Agents can update move details" ON public.move_details
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = move_details.lead_id
    AND (l.assigned_agent_id = auth.uid() OR l.assigned_agent_id IS NULL OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
  ));

CREATE POLICY "Agents can delete move details" ON public.move_details
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = move_details.lead_id
    AND (l.assigned_agent_id = auth.uid() OR l.assigned_agent_id IS NULL OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
  ));
