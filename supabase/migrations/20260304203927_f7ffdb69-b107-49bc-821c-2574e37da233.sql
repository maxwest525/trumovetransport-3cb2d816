
-- E-Sign Audit Trail for ESIGN Act + UETA compliance
CREATE TABLE public.esign_audit_trail (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ref_number TEXT NOT NULL,
  document_type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  signer_ip_address TEXT,
  user_agent TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  document_hash TEXT,
  consent_given BOOLEAN DEFAULT false,
  consent_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.esign_audit_trail ENABLE ROW LEVEL SECURITY;

-- Staff can view audit trails
CREATE POLICY "Staff can view audit trails"
  ON public.esign_audit_trail FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

-- Staff can insert audit events
CREATE POLICY "Staff can insert audit events"
  ON public.esign_audit_trail FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

-- Public can insert audit events (for customer-facing signing)
CREATE POLICY "Public can insert audit events"
  ON public.esign_audit_trail FOR INSERT
  TO anon
  WITH CHECK (true);

-- Index for fast lookups by ref_number
CREATE INDEX idx_esign_audit_ref ON public.esign_audit_trail(ref_number);
