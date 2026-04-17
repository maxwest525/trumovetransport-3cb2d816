-- Allow staff to revoke (mark as used) resume tokens for leads they can access
CREATE POLICY "Staff can revoke scan resume tokens"
ON public.scan_resume_tokens
FOR UPDATE
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
)
WITH CHECK (
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