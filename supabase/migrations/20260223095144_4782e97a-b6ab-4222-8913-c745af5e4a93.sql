ALTER TABLE public.profiles
ADD COLUMN automation_mode text NOT NULL DEFAULT 'review';
