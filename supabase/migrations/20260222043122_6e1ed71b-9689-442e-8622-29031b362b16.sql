
-- Create proper role enum including owner
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'manager', 'agent');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper: check if user has any of the privileged roles (owner sees everything)
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- RLS policies for user_roles table
-- Everyone authed can read roles (needed for UI role checks)
CREATE POLICY "Authenticated users can read roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Only owners/admins can assign roles
CREATE POLICY "Owners and admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')
  );

-- Only owners/admins can update roles
CREATE POLICY "Owners and admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')
  );

-- Only owners can delete roles
CREATE POLICY "Owners can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

-- Now update existing RLS policies on other tables to use has_role + include owner access

-- DEALS: Update SELECT to include owner
DROP POLICY IF EXISTS "Agents see own deals" ON public.deals;
CREATE POLICY "Agents see own deals"
  ON public.deals FOR SELECT
  USING (
    assigned_agent_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role])
  );

DROP POLICY IF EXISTS "Agents update own deals" ON public.deals;
CREATE POLICY "Agents update own deals"
  ON public.deals FOR UPDATE
  USING (
    assigned_agent_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role])
  );

DROP POLICY IF EXISTS "Managers delete deals" ON public.deals;
CREATE POLICY "Owners and managers delete deals"
  ON public.deals FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- LEADS: Update to include owner
DROP POLICY IF EXISTS "Agents see own leads" ON public.leads;
CREATE POLICY "Agents see own leads"
  ON public.leads FOR SELECT
  USING (
    assigned_agent_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role])
  );

DROP POLICY IF EXISTS "Agents update own leads" ON public.leads;
CREATE POLICY "Agents update own leads"
  ON public.leads FOR UPDATE
  USING (
    assigned_agent_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role])
  );

DROP POLICY IF EXISTS "Managers delete leads" ON public.leads;
CREATE POLICY "Owners and managers delete leads"
  ON public.leads FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- ACTIVITIES: Update to include owner
DROP POLICY IF EXISTS "Agents see own activities" ON public.activities;
CREATE POLICY "Agents see own activities"
  ON public.activities FOR SELECT
  USING (
    agent_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role])
  );

DROP POLICY IF EXISTS "Managers delete activities" ON public.activities;
CREATE POLICY "Owners and managers delete activities"
  ON public.activities FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- CALLS: Add owner/manager visibility
DROP POLICY IF EXISTS "Agents can view their own calls" ON public.calls;
CREATE POLICY "Agents can view their own calls"
  ON public.calls FOR SELECT
  USING (
    agent_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role])
  );

-- NOTIFICATIONS: Owner can see all notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'owner')
  );

-- SUPPORT TICKETS: Owner can manage all
DROP POLICY IF EXISTS "Authenticated users can view tickets" ON public.support_tickets;
CREATE POLICY "Authenticated users can view tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() IS NOT NULL);
