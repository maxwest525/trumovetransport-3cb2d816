
ALTER TABLE public.lead_attribution
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS browser_language text,
  ADD COLUMN IF NOT EXISTS connection_type text,
  ADD COLUMN IF NOT EXISTS is_touch_device boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS viewport_size text,
  ADD COLUMN IF NOT EXISTS visit_count integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS tab_blur_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_scroll_depth integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ad_blocker_detected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS color_depth integer,
  ADD COLUMN IF NOT EXISTS hardware_concurrency integer,
  ADD COLUMN IF NOT EXISTS do_not_track boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pdf_viewer_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cookies_enabled boolean DEFAULT true;
