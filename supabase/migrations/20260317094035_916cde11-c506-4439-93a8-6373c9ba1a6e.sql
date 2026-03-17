
-- ============================================================
-- PULSE COMMAND TABLES (prefixed with pulse_)
-- ============================================================

-- 1. Pulse Calls
CREATE TABLE public.pulse_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  client_name TEXT NOT NULL DEFAULT 'Unknown Client',
  transcript TEXT NOT NULL DEFAULT '',
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  compliance_score NUMERIC(5,2) DEFAULT NULL,
  talk_ratio_agent NUMERIC(5,2) DEFAULT NULL,
  talk_ratio_client NUMERIC(5,2) DEFAULT NULL,
  flagged_keywords TEXT[] DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'low',
  summary TEXT DEFAULT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.pulse_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read pulse_calls" ON public.pulse_calls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert pulse_calls" ON public.pulse_calls FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update pulse_calls" ON public.pulse_calls FOR UPDATE TO authenticated USING (true);

-- 2. Pulse Alerts
CREATE TABLE public.pulse_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  client_name TEXT NOT NULL DEFAULT 'Unknown Client',
  keyword TEXT NOT NULL,
  matched_text TEXT NOT NULL,
  match_type TEXT NOT NULL DEFAULT 'keyword',
  context TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  call_id UUID REFERENCES public.pulse_calls(id) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.pulse_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read pulse_alerts" ON public.pulse_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert pulse_alerts" ON public.pulse_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete pulse_alerts" ON public.pulse_alerts FOR DELETE TO authenticated USING (true);
CREATE INDEX idx_pulse_alerts_created_at ON public.pulse_alerts (created_at DESC);
CREATE INDEX idx_pulse_alerts_agent_name ON public.pulse_alerts (agent_name);
CREATE INDEX idx_pulse_alerts_severity ON public.pulse_alerts (severity);

-- 3. Pulse Agent Messages
CREATE TABLE public.pulse_agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  message TEXT NOT NULL,
  call_id TEXT DEFAULT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.pulse_agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read pulse_agent_messages" ON public.pulse_agent_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert pulse_agent_messages" ON public.pulse_agent_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update pulse_agent_messages" ON public.pulse_agent_messages FOR UPDATE TO authenticated USING (true);

-- 4. Pulse Watch Patterns
CREATE TABLE public.pulse_watch_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL DEFAULT 'default',
  patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_id UUID DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (config_key)
);
ALTER TABLE public.pulse_watch_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage pulse_watch_patterns" ON public.pulse_watch_patterns FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Pulse Notification Settings
CREATE TABLE public.pulse_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL DEFAULT 'default',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID DEFAULT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pulse_notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage pulse_notification_settings" ON public.pulse_notification_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Pulse Transcript Annotations
CREATE TABLE public.pulse_transcript_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.pulse_alerts(id) ON DELETE CASCADE,
  line_index INTEGER NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.pulse_transcript_annotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read pulse_transcript_annotations" ON public.pulse_transcript_annotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert pulse_transcript_annotations" ON public.pulse_transcript_annotations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete pulse_transcript_annotations" ON public.pulse_transcript_annotations FOR DELETE TO authenticated USING (true);

-- 7. Pulse Compliance Scripts
CREATE TABLE public.pulse_compliance_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'text/plain',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.pulse_compliance_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read pulse_compliance_scripts" ON public.pulse_compliance_scripts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert pulse_compliance_scripts" ON public.pulse_compliance_scripts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update pulse_compliance_scripts" ON public.pulse_compliance_scripts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete pulse_compliance_scripts" ON public.pulse_compliance_scripts FOR DELETE TO authenticated USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.pulse_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pulse_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pulse_agent_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pulse_compliance_scripts;

-- Storage bucket for compliance scripts
INSERT INTO storage.buckets (id, name, public) VALUES ('pulse-compliance-scripts', 'pulse-compliance-scripts', true);
CREATE POLICY "Authenticated can upload pulse scripts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pulse-compliance-scripts');
CREATE POLICY "Anyone can read pulse scripts" ON storage.objects FOR SELECT USING (bucket_id = 'pulse-compliance-scripts');
CREATE POLICY "Authenticated can delete pulse scripts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pulse-compliance-scripts');
