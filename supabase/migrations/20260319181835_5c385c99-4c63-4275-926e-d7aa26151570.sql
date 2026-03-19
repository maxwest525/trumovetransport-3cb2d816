
-- 1. Create esign_documents table
CREATE TABLE public.esign_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  ref_number text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  delivery_method text NOT NULL DEFAULT 'email',
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  completed_at timestamptz,
  sent_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.esign_documents ENABLE ROW LEVEL SECURITY;

-- RLS: Agents see docs for own leads, managers/owners see all
CREATE POLICY "Agents can view own lead esign docs" ON public.esign_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = esign_documents.lead_id
        AND (l.assigned_agent_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
    )
  );

CREATE POLICY "Agents can insert esign docs" ON public.esign_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = esign_documents.lead_id
        AND (l.assigned_agent_id = auth.uid() OR l.assigned_agent_id IS NULL OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
    )
  );

CREATE POLICY "Agents can update own lead esign docs" ON public.esign_documents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = esign_documents.lead_id
        AND (l.assigned_agent_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
    )
  );

-- Service role needs to update docs from edge functions (anon insert for customer-facing signing)
CREATE POLICY "Public can update esign doc status" ON public.esign_documents
  FOR UPDATE TO anon
  USING (true);

-- 2. Add lead_id to esign_audit_trail
ALTER TABLE public.esign_audit_trail ADD COLUMN lead_id uuid REFERENCES public.leads(id);
