
-- pulse_transcript_annotations: drop existing then recreate
DROP POLICY IF EXISTS "Managers can read pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Managers can insert pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Managers can delete pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Allow all authenticated users to view annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Allow all authenticated users to insert annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Allow all authenticated users to delete annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can view annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can insert annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can delete annotations" ON public.pulse_transcript_annotations;

CREATE POLICY "Managers can read pulse_transcript_annotations" ON public.pulse_transcript_annotations FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can insert pulse_transcript_annotations" ON public.pulse_transcript_annotations FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can delete pulse_transcript_annotations" ON public.pulse_transcript_annotations FOR DELETE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- pulse_notification_settings: drop existing then recreate
DROP POLICY IF EXISTS "Managers can read pulse_notification_settings" ON public.pulse_notification_settings;
DROP POLICY IF EXISTS "Managers can insert pulse_notification_settings" ON public.pulse_notification_settings;
DROP POLICY IF EXISTS "Managers can update pulse_notification_settings" ON public.pulse_notification_settings;
DROP POLICY IF EXISTS "Managers can delete pulse_notification_settings" ON public.pulse_notification_settings;
DROP POLICY IF EXISTS "Allow all authenticated users to manage notification settings" ON public.pulse_notification_settings;
DROP POLICY IF EXISTS "Authenticated can manage notification settings" ON public.pulse_notification_settings;

CREATE POLICY "Managers can read pulse_notification_settings" ON public.pulse_notification_settings FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can insert pulse_notification_settings" ON public.pulse_notification_settings FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can update pulse_notification_settings" ON public.pulse_notification_settings FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can delete pulse_notification_settings" ON public.pulse_notification_settings FOR DELETE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- pulse_watch_patterns: drop existing then recreate
DROP POLICY IF EXISTS "Managers can read pulse_watch_patterns" ON public.pulse_watch_patterns;
DROP POLICY IF EXISTS "Managers can insert pulse_watch_patterns" ON public.pulse_watch_patterns;
DROP POLICY IF EXISTS "Managers can update pulse_watch_patterns" ON public.pulse_watch_patterns;
DROP POLICY IF EXISTS "Managers can delete pulse_watch_patterns" ON public.pulse_watch_patterns;
DROP POLICY IF EXISTS "Allow all authenticated users to manage watch patterns" ON public.pulse_watch_patterns;
DROP POLICY IF EXISTS "Authenticated can manage watch patterns" ON public.pulse_watch_patterns;

CREATE POLICY "Managers can read pulse_watch_patterns" ON public.pulse_watch_patterns FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can insert pulse_watch_patterns" ON public.pulse_watch_patterns FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can update pulse_watch_patterns" ON public.pulse_watch_patterns FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers can delete pulse_watch_patterns" ON public.pulse_watch_patterns FOR DELETE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

-- agent_coaching_stats: restrict from {public} to {authenticated} with scoping
DROP POLICY IF EXISTS "Agents can view their own stats" ON public.agent_coaching_stats;
DROP POLICY IF EXISTS "Agents can insert their own stats" ON public.agent_coaching_stats;
DROP POLICY IF EXISTS "Agents can update their own stats" ON public.agent_coaching_stats;

CREATE POLICY "Agents can view their own stats" ON public.agent_coaching_stats FOR SELECT TO authenticated
USING (agent_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));

CREATE POLICY "Agents can insert their own stats" ON public.agent_coaching_stats FOR INSERT TO authenticated
WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their own stats" ON public.agent_coaching_stats FOR UPDATE TO authenticated
USING (agent_id = auth.uid());

-- Storage: restrict pulse-compliance-scripts bucket
DROP POLICY IF EXISTS "Authenticated can upload pulse scripts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete pulse scripts" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload pulse scripts" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete pulse scripts" ON storage.objects;

CREATE POLICY "Staff can upload pulse scripts" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pulse-compliance-scripts' AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Staff can delete pulse scripts" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pulse-compliance-scripts' AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));
