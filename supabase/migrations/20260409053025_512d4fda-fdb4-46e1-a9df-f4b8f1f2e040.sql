
-- ============================================================
-- 1. SUPPORT_TICKETS: restrict SELECT to staff only
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Authenticated can read support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Anyone can view support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Authenticated users can view tickets" ON public.support_tickets;

-- Keep any existing anon INSERT for public form submission
-- Add staff-only SELECT
CREATE POLICY "Staff can view support tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

-- ============================================================
-- 2. ESIGN_AUDIT_TRAIL: remove anon INSERT, keep staff INSERT
-- ============================================================
DROP POLICY IF EXISTS "Public can insert audit events" ON public.esign_audit_trail;

-- Replace with service_role only insert for anonymous context (edge functions)
CREATE POLICY "Service role can insert audit events"
  ON public.esign_audit_trail FOR INSERT
  TO anon
  WITH CHECK (false);

-- ============================================================
-- 3. USER_ROLES: restrict SELECT to self + managers/owners
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can read roles" ON public.user_roles;

CREATE POLICY "Users can read own roles or managers can read all"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
  );

-- ============================================================
-- 4. PULSE_CALLS: scope to owner/manager only
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can read pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Authenticated can insert pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Authenticated can update pulse_calls" ON public.pulse_calls;

CREATE POLICY "Managers can read pulse_calls"
  ON public.pulse_calls FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can insert pulse_calls"
  ON public.pulse_calls FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can update pulse_calls"
  ON public.pulse_calls FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- ============================================================
-- 5. PULSE_ALERTS: scope to owner/manager
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can read pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Authenticated can insert pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Authenticated can delete pulse_alerts" ON public.pulse_alerts;

CREATE POLICY "Managers can read pulse_alerts"
  ON public.pulse_alerts FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can insert pulse_alerts"
  ON public.pulse_alerts FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can delete pulse_alerts"
  ON public.pulse_alerts FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- ============================================================
-- 6. PULSE_AGENT_MESSAGES: scope to owner/manager
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can read pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Authenticated can insert pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Authenticated can update pulse_agent_messages" ON public.pulse_agent_messages;

CREATE POLICY "Managers can read pulse_agent_messages"
  ON public.pulse_agent_messages FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can insert pulse_agent_messages"
  ON public.pulse_agent_messages FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can update pulse_agent_messages"
  ON public.pulse_agent_messages FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- ============================================================
-- 7. PULSE_COMPLIANCE_SCRIPTS: scope to owner/admin/manager
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can read pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can insert pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can update pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can delete pulse_compliance_scripts" ON public.pulse_compliance_scripts;

CREATE POLICY "Admins can read pulse_compliance_scripts"
  ON public.pulse_compliance_scripts FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Admins can insert pulse_compliance_scripts"
  ON public.pulse_compliance_scripts FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Admins can update pulse_compliance_scripts"
  ON public.pulse_compliance_scripts FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Admins can delete pulse_compliance_scripts"
  ON public.pulse_compliance_scripts FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 8. PULSE_NOTIFICATION_SETTINGS: scope to owner/admin/manager
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can manage notification settings" ON public.pulse_notification_settings;
DROP POLICY IF EXISTS "Anyone can manage notification settings" ON public.pulse_notification_settings;

-- Drop the ALL policy by trying common names
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated can manage pulse_notification_settings" ON public.pulse_notification_settings';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admins can manage notification_settings"
  ON public.pulse_notification_settings FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 9. PULSE_WATCH_PATTERNS: scope to owner/admin/manager
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can manage watch patterns" ON public.pulse_watch_patterns;
DROP POLICY IF EXISTS "Anyone can manage watch patterns" ON public.pulse_watch_patterns;

DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated can manage pulse_watch_patterns" ON public.pulse_watch_patterns';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admins can manage watch_patterns"
  ON public.pulse_watch_patterns FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 10. PULSE_TRANSCRIPT_ANNOTATIONS: scope to owner/manager
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can read pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can insert pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can delete pulse_transcript_annotations" ON public.pulse_transcript_annotations;

CREATE POLICY "Managers can read pulse_transcript_annotations"
  ON public.pulse_transcript_annotations FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can insert pulse_transcript_annotations"
  ON public.pulse_transcript_annotations FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can delete pulse_transcript_annotations"
  ON public.pulse_transcript_annotations FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- ============================================================
-- 11. STORAGE: pulse-compliance-scripts bucket — restrict upload/delete
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can upload pulse scripts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete pulse scripts" ON storage.objects;

CREATE POLICY "Admins can upload pulse scripts"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pulse-compliance-scripts'
    AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
  );

CREATE POLICY "Admins can delete pulse scripts"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'pulse-compliance-scripts'
    AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
  );
