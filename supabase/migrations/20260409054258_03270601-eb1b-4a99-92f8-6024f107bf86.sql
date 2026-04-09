
-- Fix 1: support_tickets UPDATE policy - restrict to staff roles only
DROP POLICY IF EXISTS "Authenticated users can update support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Staff can update support tickets" ON public.support_tickets;

CREATE POLICY "Staff can update support tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

-- Fix 2: calls table - change all policies from public to authenticated
DROP POLICY IF EXISTS "Agents can insert their own calls" ON public.calls;
DROP POLICY IF EXISTS "Agents can update their own calls" ON public.calls;
DROP POLICY IF EXISTS "Agents can view their own calls" ON public.calls;

CREATE POLICY "Agents can insert their own calls"
ON public.calls
FOR INSERT
TO authenticated
WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their own calls"
ON public.calls
FOR UPDATE
TO authenticated
USING (agent_id = auth.uid());

CREATE POLICY "Agents can view their own calls"
ON public.calls
FOR SELECT
TO authenticated
USING ((agent_id = auth.uid()) OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));
