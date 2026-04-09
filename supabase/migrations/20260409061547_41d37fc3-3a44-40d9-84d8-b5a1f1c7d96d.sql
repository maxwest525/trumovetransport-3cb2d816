
-- Fix 1: Remove overly permissive anon UPDATE on lead_attribution
-- Anonymous users should only insert new attribution records, not update any existing one
DROP POLICY IF EXISTS "Anon can update lead_attribution" ON public.lead_attribution;

-- Fix 2: Restrict call_coaching_events policies from {public} to {authenticated}
DROP POLICY IF EXISTS "Users can insert coaching events for their calls" ON public.call_coaching_events;
DROP POLICY IF EXISTS "Users can view coaching events for their calls" ON public.call_coaching_events;

CREATE POLICY "Users can insert coaching events for their calls"
ON public.call_coaching_events
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM calls
  WHERE calls.id = call_coaching_events.call_id AND calls.agent_id = auth.uid()
));

CREATE POLICY "Users can view coaching events for their calls"
ON public.call_coaching_events
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM calls
  WHERE calls.id = call_coaching_events.call_id AND calls.agent_id = auth.uid()
));
