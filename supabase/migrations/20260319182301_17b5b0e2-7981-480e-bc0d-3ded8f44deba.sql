
-- Allow customers to view esign_documents for leads they have portal access to
CREATE POLICY "Customers can view own esign docs" ON public.esign_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_portal_access cpa
      WHERE cpa.lead_id = esign_documents.lead_id
        AND cpa.user_id = auth.uid()
    )
  );
