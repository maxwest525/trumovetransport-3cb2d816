
-- Customer portal access table
CREATE TABLE public.customer_portal_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  invited_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_portal_access ENABLE ROW LEVEL SECURITY;

-- Customers can see their own portal access rows
CREATE POLICY "Customers can view own portal access"
  ON public.customer_portal_access
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Staff (owner/admin/manager/agent) can view all portal access
CREATE POLICY "Staff can view all portal access"
  ON public.customer_portal_access
  FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

-- Staff can insert portal access (invite customers)
CREATE POLICY "Staff can insert portal access"
  ON public.customer_portal_access
  FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

-- Staff can update portal access
CREATE POLICY "Staff can update portal access"
  ON public.customer_portal_access
  FOR UPDATE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

-- Staff can delete portal access
CREATE POLICY "Staff can delete portal access"
  ON public.customer_portal_access
  FOR DELETE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- Customer portal messages table
CREATE TABLE public.customer_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_access_id UUID NOT NULL REFERENCES public.customer_portal_access(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent')),
  sender_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;

-- Customers can view messages for their portal access
CREATE POLICY "Customers can view own messages"
  ON public.customer_messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.customer_portal_access cpa
    WHERE cpa.id = customer_messages.portal_access_id AND cpa.user_id = auth.uid()
  ));

-- Customers can send messages
CREATE POLICY "Customers can send messages"
  ON public.customer_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND sender_type = 'customer' AND
    EXISTS (
      SELECT 1 FROM public.customer_portal_access cpa
      WHERE cpa.id = customer_messages.portal_access_id AND cpa.user_id = auth.uid()
    )
  );

-- Staff can view and send messages
CREATE POLICY "Staff can view all customer messages"
  ON public.customer_messages
  FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

CREATE POLICY "Staff can send customer messages"
  ON public.customer_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type = 'agent' AND
    has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role])
  );

-- Customer documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-documents', 'customer-documents', false);

-- Customers can upload to their own folder
CREATE POLICY "Customers upload own documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Customers can view their own documents
CREATE POLICY "Customers view own documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Staff can view all customer documents
CREATE POLICY "Staff view all customer documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'customer-documents' AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

-- Auto-link portal access on signup: function to link user_id by email
CREATE OR REPLACE FUNCTION public.link_customer_portal_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.customer_portal_access
  SET user_id = NEW.id
  WHERE customer_email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$;
