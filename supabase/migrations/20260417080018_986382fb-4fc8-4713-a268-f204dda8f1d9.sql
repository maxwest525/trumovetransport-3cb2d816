-- Add verification + audit columns to scan_resume_tokens
ALTER TABLE public.scan_resume_tokens
  ADD COLUMN IF NOT EXISTS phone_last4 text,
  ADD COLUMN IF NOT EXISTS verification_method text NOT NULL DEFAULT 'phone_last4',
  ADD COLUMN IF NOT EXISTS email_hint text,
  ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS redeemed_ip text,
  ADD COLUMN IF NOT EXISTS redeemed_user_agent text;

-- verification_method: 'phone_last4' or 'email'
-- phone_last4: last 4 digits of lead phone (when method = phone_last4)
-- email_hint: full lead email (when method = email) — used for case-insensitive match server-side
-- failed_attempts + last_attempt_at: rate-limit (1 attempt/sec, no permanent lockout)
-- redeemed_ip + redeemed_user_agent: audit trail on successful redemption