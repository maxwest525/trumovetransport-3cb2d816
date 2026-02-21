
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'deal_update', 'ticket_assignment', 'system', 'info'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT, -- optional route to navigate to
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (user_id = auth.uid());

-- System/triggers can insert notifications for any user
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Index for fast lookups
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: auto-create notification on deal stage change
CREATE OR REPLACE FUNCTION public.notify_deal_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lead_name TEXT;
  stage_label TEXT;
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage AND NEW.assigned_agent_id IS NOT NULL THEN
    SELECT first_name || ' ' || last_name INTO lead_name
    FROM public.leads WHERE id = NEW.lead_id;

    stage_label := REPLACE(NEW.stage::text, '_', ' ');
    stage_label := INITCAP(stage_label);

    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.assigned_agent_id,
      'deal_update',
      'Deal Stage Updated',
      COALESCE(lead_name, 'A deal') || ' moved to "' || stage_label || '"',
      '/agent/pipeline',
      jsonb_build_object('deal_id', NEW.id, 'old_stage', OLD.stage, 'new_stage', NEW.stage)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_deal_stage
AFTER UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.notify_deal_stage_change();

-- Trigger: auto-create notification on new support ticket
CREATE OR REPLACE FUNCTION public.notify_new_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  agent RECORD;
BEGIN
  -- Notify all agents about new tickets
  FOR agent IN SELECT id FROM public.profiles WHERE role IN ('agent', 'manager') LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      agent.id,
      'ticket_assignment',
      'New Support Ticket',
      'From ' || NEW.name || ': ' || COALESCE(NEW.subject, LEFT(NEW.message, 60)),
      '/admin/support-tickets',
      jsonb_build_object('ticket_id', NEW.id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_ticket
AFTER INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_ticket();
