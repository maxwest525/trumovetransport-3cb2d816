
-- Enums for lead source, lead status, deal stage, activity type
CREATE TYPE public.lead_source AS ENUM ('website', 'referral', 'ppc', 'walk_in', 'phone', 'other');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'lost');
CREATE TYPE public.deal_stage AS ENUM ('new_lead', 'contacted', 'qualified', 'estimate_sent', 'follow_up', 'booked', 'dispatched', 'in_transit', 'delivered', 'closed_won', 'closed_lost');
CREATE TYPE public.activity_type AS ENUM ('call', 'email', 'note', 'follow_up', 'meeting', 'text', 'stage_change');

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source lead_source NOT NULL DEFAULT 'website',
  status lead_status NOT NULL DEFAULT 'new',
  assigned_agent_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  tags TEXT[],
  move_date DATE,
  origin_address TEXT,
  destination_address TEXT,
  estimated_weight NUMERIC,
  estimated_value NUMERIC
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents see own leads" ON public.leads FOR SELECT TO authenticated
  USING (assigned_agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));
CREATE POLICY "Agents insert leads" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (assigned_agent_id = auth.uid() OR assigned_agent_id IS NULL);
CREATE POLICY "Agents update own leads" ON public.leads FOR UPDATE TO authenticated
  USING (assigned_agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));
CREATE POLICY "Managers delete leads" ON public.leads FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));

CREATE INDEX idx_leads_agent ON public.leads(assigned_agent_id);
CREATE INDEX idx_leads_status ON public.leads(status);

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PIPELINE_STAGES (configurable)
-- ============================================================
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stage_key deal_stage NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_default BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authed can read stages" ON public.pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage stages" ON public.pipeline_stages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));

-- Seed default stages
INSERT INTO public.pipeline_stages (name, stage_key, display_order, color, is_default) VALUES
  ('New Lead',       'new_lead',      1, '#3b82f6', true),
  ('Contacted',      'contacted',     2, '#8b5cf6', false),
  ('Qualified',      'qualified',     3, '#6366f1', false),
  ('Estimate Sent',  'estimate_sent', 4, '#f59e0b', false),
  ('Follow Up',      'follow_up',     5, '#ef4444', false),
  ('Booked',         'booked',        6, '#10b981', false),
  ('Dispatched',     'dispatched',    7, '#14b8a6', false),
  ('In Transit',     'in_transit',    8, '#06b6d4', false),
  ('Delivered',      'delivered',     9, '#22c55e', false),
  ('Closed Won',     'closed_won',   10, '#16a34a', false),
  ('Closed Lost',    'closed_lost',  11, '#dc2626', false);

-- ============================================================
-- DEALS
-- ============================================================
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  stage deal_stage NOT NULL DEFAULT 'new_lead',
  deal_value NUMERIC DEFAULT 0,
  actual_revenue NUMERIC,
  carrier_id TEXT,
  carrier_name TEXT,
  assigned_agent_id UUID REFERENCES public.profiles(id),
  expected_close_date DATE,
  actual_close_date DATE,
  loss_reason TEXT
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents see own deals" ON public.deals FOR SELECT TO authenticated
  USING (assigned_agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));
CREATE POLICY "Agents insert deals" ON public.deals FOR INSERT TO authenticated
  WITH CHECK (assigned_agent_id = auth.uid() OR assigned_agent_id IS NULL);
CREATE POLICY "Agents update own deals" ON public.deals FOR UPDATE TO authenticated
  USING (assigned_agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));
CREATE POLICY "Managers delete deals" ON public.deals FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));

CREATE INDEX idx_deals_agent ON public.deals(assigned_agent_id);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_lead ON public.deals(lead_id);

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ACTIVITIES
-- ============================================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id),
  type activity_type NOT NULL DEFAULT 'note',
  subject TEXT,
  description TEXT,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_done BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents see own activities" ON public.activities FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));
CREATE POLICY "Agents insert activities" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid());
CREATE POLICY "Agents update own activities" ON public.activities FOR UPDATE TO authenticated
  USING (agent_id = auth.uid());
CREATE POLICY "Managers delete activities" ON public.activities FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));

CREATE INDEX idx_activities_deal ON public.activities(deal_id);
CREATE INDEX idx_activities_lead ON public.activities(lead_id);
CREATE INDEX idx_activities_agent ON public.activities(agent_id);

-- ============================================================
-- DEAL_HISTORY (audit log)
-- ============================================================
CREATE TABLE public.deal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deal_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents see own deal history" ON public.deal_history FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.deals d WHERE d.id = deal_history.deal_id
    AND (d.assigned_agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'))
  ));
CREATE POLICY "System inserts deal history" ON public.deal_history FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_deal_history_deal ON public.deal_history(deal_id);

-- ============================================================
-- TRIGGERS: Auto-log stage changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_deal_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    -- Log to deal_history
    INSERT INTO public.deal_history (deal_id, changed_by, field_changed, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'stage', OLD.stage::text, NEW.stage::text);
    
    -- Auto-create activity
    INSERT INTO public.activities (deal_id, lead_id, agent_id, type, subject, description)
    VALUES (
      NEW.id,
      NEW.lead_id,
      auth.uid(),
      'stage_change',
      'Stage changed to ' || NEW.stage::text,
      'Deal moved from ' || OLD.stage::text || ' to ' || NEW.stage::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deal_stage_change
  AFTER UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_deal_stage_change();

-- Enable realtime for deals (for live Kanban updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
