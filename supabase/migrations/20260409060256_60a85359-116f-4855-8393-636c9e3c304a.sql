
-- Fix 1: Remove overly permissive support_tickets UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Authenticated users can update support tickets" ON public.support_tickets;

-- Fix 2: Restrict user_roles INSERT/UPDATE to owner-only (prevent admin self-escalation)
DROP POLICY IF EXISTS "Owners and admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners and admins can update roles" ON public.user_roles;

CREATE POLICY "Only owners can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Only owners can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));

-- Fix 3: Restrict user_roles SELECT to self or manager/owner/admin
DROP POLICY IF EXISTS "Authenticated users can read roles" ON public.user_roles;

CREATE POLICY "Users can read own roles or staff can read all"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
);

-- Fix 4: Restrict profiles SELECT to hide emails from non-staff
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can view profiles with limited data"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role])
);
