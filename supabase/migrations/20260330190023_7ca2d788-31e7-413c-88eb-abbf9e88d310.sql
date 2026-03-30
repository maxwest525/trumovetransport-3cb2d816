
-- 1. Remove dangerous anon UPDATE policy on esign_documents
DROP POLICY IF EXISTS "Public can update esign doc status" ON public.esign_documents;

-- 2. Fix notifications INSERT policy to restrict who can be targeted
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Staff can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role])
  );

-- 3. Make pulse-compliance-scripts bucket private
UPDATE storage.buckets SET public = false WHERE id = 'pulse-compliance-scripts';

-- 4. Remove public read policy on pulse-compliance-scripts and add staff-only policy
DROP POLICY IF EXISTS "Anyone can read pulse scripts" ON storage.objects;
CREATE POLICY "Staff can read pulse compliance scripts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pulse-compliance-scripts'
    AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role])
  );
