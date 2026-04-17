-- Create public storage bucket for AI room scan photos so agents can review them in the CRM
INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-room-photos', 'scan-room-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous (and authenticated) users to upload scan photos
CREATE POLICY "Anyone can upload scan room photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'scan-room-photos');

-- Photos are public-readable (they live in a public bucket and are needed for CRM viewing)
CREATE POLICY "Scan room photos are publicly readable"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'scan-room-photos');

-- Staff can delete scan photos when cleaning up
CREATE POLICY "Staff can delete scan room photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'scan-room-photos'
  AND public.has_any_role(auth.uid(), ARRAY['owner'::public.app_role, 'admin'::public.app_role, 'manager'::public.app_role])
);

-- Extend lead_inventory so AI-scanned items can be tagged + linked back to the source photo
ALTER TABLE public.lead_inventory
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_photo_url text,
  ADD COLUMN IF NOT EXISTS detection_box jsonb,
  ADD COLUMN IF NOT EXISTS confidence numeric;

-- New table: store the photos the AI scanned (one row per uploaded photo) for CRM review
CREATE TABLE IF NOT EXISTS public.lead_scan_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  room_label text,
  detected_boxes jsonb NOT NULL DEFAULT '[]'::jsonb,
  item_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_scan_photos_lead_id_idx ON public.lead_scan_photos(lead_id);

ALTER TABLE public.lead_scan_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view scan photos for their leads"
ON public.lead_scan_photos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = lead_scan_photos.lead_id
      AND (
        l.assigned_agent_id = auth.uid()
        OR l.assigned_agent_id IS NULL
        OR public.has_any_role(auth.uid(), ARRAY['owner'::public.app_role, 'manager'::public.app_role])
      )
  )
);

CREATE POLICY "Agents can insert scan photos for their leads"
ON public.lead_scan_photos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = lead_scan_photos.lead_id
      AND (
        l.assigned_agent_id = auth.uid()
        OR l.assigned_agent_id IS NULL
        OR public.has_any_role(auth.uid(), ARRAY['owner'::public.app_role, 'manager'::public.app_role])
      )
  )
);

CREATE POLICY "Owners and managers delete scan photos"
ON public.lead_scan_photos
FOR DELETE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['owner'::public.app_role, 'manager'::public.app_role]));