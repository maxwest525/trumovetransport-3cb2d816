-- Add marketing and accounting to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'accounting';