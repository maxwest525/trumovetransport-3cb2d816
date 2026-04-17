-- Table to store one-time tokens that let an agent push a saved scan
-- back into a customer's browser via a shareable resume link.
CREATE TABLE public.scan_resume_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  lead_id uuid NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  used_at timestamptz
);

CREATE INDEX idx_scan_resume_tokens_token ON public.scan_resume_tokens(token);
CREATE INDEX idx_scan_resume_tokens_lead ON public.scan_resume_tokens(lead_id);

ALTER TABLE public.scan_resume_tokens ENABLE ROW LEVEL SECURITY;

-- Staff can see tokens for leads they have access to (matches lead_scan_photos pattern).
CREATE POLICY "Staff can view scan resume tokens"
ON public.scan_resume_tokens
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = scan_resume_tokens.lead_id
      AND (
        l.assigned_agent_id = auth.uid()
        OR l.assigned_agent_id IS NULL
        OR public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role, 'admin'::app_role])
      )
  )
);

-- Staff can create tokens for leads they have access to.
CREATE POLICY "Staff can create scan resume tokens"
ON public.scan_resume_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = scan_resume_tokens.lead_id
      AND (
        l.assigned_agent_id = auth.uid()
        OR l.assigned_agent_id IS NULL
        OR public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role, 'admin'::app_role])
      )
  )
);

-- Owners and managers can revoke (delete) tokens.
CREATE POLICY "Owners and managers delete scan resume tokens"
ON public.scan_resume_tokens
FOR DELETE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]));