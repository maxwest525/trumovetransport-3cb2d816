-- Fix pipeline_stages policy that references profiles.role
DROP POLICY IF EXISTS "Managers can manage stages" ON public.pipeline_stages;
CREATE POLICY "Managers can manage stages"
  ON public.pipeline_stages
  FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- Fix deal_history SELECT policy
DROP POLICY IF EXISTS "Agents see own deal history" ON public.deal_history;
CREATE POLICY "Agents see own deal history"
  ON public.deal_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM deals d
    WHERE d.id = deal_history.deal_id
      AND (d.assigned_agent_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
  ));

-- Fix deal_history INSERT policy
DROP POLICY IF EXISTS "Authenticated inserts deal history" ON public.deal_history;
CREATE POLICY "Authenticated inserts deal history"
  ON public.deal_history
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM deals d
    WHERE d.id = deal_history.deal_id
      AND (d.assigned_agent_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
  ));

-- Now safe to drop the column
ALTER TABLE public.profiles DROP COLUMN role;