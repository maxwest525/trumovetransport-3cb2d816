
-- Tighten deal_history insert: only allow if user owns the deal or is manager
DROP POLICY "System inserts deal history" ON public.deal_history;
CREATE POLICY "Authenticated inserts deal history" ON public.deal_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deals d WHERE d.id = deal_history.deal_id
      AND (d.assigned_agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'))
    )
  );
