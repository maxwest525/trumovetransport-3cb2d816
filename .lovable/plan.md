

# Plan: External Customer Portal + Style Extractor Fix + Mobile Enhancement

## 1. Fix Style Extractor (fonts and sizing not applying visibly)

**Problem**: The brand style extraction pipeline injects `fontFamily`, `borderRadius`, and colors, but the massive `index.css` file (35,000 lines) contains hardcoded `!important` overrides on `font-size`, `line-height`, and `border-radius` that suppress the injected inline styles. For example, line 33888 forces `h1 { font-size: 1.875rem !important; }` on mobile, overriding any inline brand style.

**Fix**:
- Add `!important` to the inline style injection in `TruMoveBrandingElements.tsx` and `AILandingPageGenerator.tsx` for font-family, font-size, border-radius, and font-weight properties
- Wrap the fullscreen preview in a scoping class (e.g., `.brand-override-active`) that neutralizes the global CSS defaults when a brand preset is applied
- Ensure the `brandStyles` helper returns values that cascade properly across all shared components

**Files to modify**:
- `src/components/demo/ppc/AILandingPageGenerator.tsx` -- add scoping class to fullscreen wrapper
- `src/components/demo/ppc/TruMoveBrandingElements.tsx` -- strengthen inline style injection
- `src/index.css` -- add `.brand-override-active` scope that unsets the hardcoded `!important` font/radius rules

---

## 2. Create External Customer Portal

A public-facing portal where customers (non-staff) can log in with a simple email/password to:
- **Track their move** -- see current status, driver location, and estimated delivery
- **View their quote/invoice** -- see pricing breakdown and payment status
- **Upload documents** -- photos, inventory lists, insurance docs
- **Message the team** -- simple chat or message thread with their assigned agent

### Architecture

- **New route**: `/portal` (customer portal entry) and `/portal/dashboard`
- **New auth flow**: Separate from the internal `/agent-login`. Customers sign up or are invited via email
- **New database table**: `customer_portal_users` linking a customer email to a lead/deal
- **New page components**:
  - `src/pages/CustomerPortal.tsx` -- login/signup for customers
  - `src/pages/CustomerPortalDashboard.tsx` -- main dashboard with move status, documents, messages
- **Shared layout**: `src/components/layout/CustomerPortalShell.tsx` -- clean, minimal shell (no internal sidebar)
- **RLS policies**: Customers can only see their own data (filtered by their linked lead/deal)

### Database Changes

```text
Table: customer_portal_access
- id (uuid, PK)
- customer_email (text, not null)
- user_id (uuid, FK to auth.users, nullable -- linked on first login)
- lead_id (uuid, FK to leads, nullable)
- deal_id (uuid, FK to deals, nullable)
- invited_by (uuid, FK to auth.users)
- created_at (timestamptz)

RLS: Users can only SELECT rows where user_id = auth.uid()
```

### Portal Features (Phase 1)

| Feature | Description |
|---|---|
| Move Tracker | Status timeline showing current stage from the deal pipeline |
| Quote Summary | Read-only view of the estimate/quote attached to their deal |
| Document Upload | Upload photos, inventory lists to a `customer-documents` storage bucket |
| Message Thread | Simple message list between customer and their assigned agent |

---

## 3. Mobile Enhancements

Audit and improve the existing mobile experience across the public site:

- **Touch targets**: Ensure all buttons and links meet 44px minimum tap target size
- **Hero section**: Tighten vertical spacing, ensure CTA is visible without scrolling on common phone sizes (375x812, 390x844)
- **Navigation**: Verify mobile hamburger menu works correctly with all current nav items
- **Trust strips**: Ensure horizontal scroll works smoothly, no overflow issues
- **Portal pages**: Build the new customer portal as mobile-first from the start
- **Form inputs**: Increase input height to 48px on mobile for easier interaction

**Files to modify**:
- `src/index.css` -- targeted mobile fixes in the existing responsive section
- New portal components will be built with mobile-first Tailwind classes

---

## Technical Summary

| Task | Files | Type |
|---|---|---|
| Fix style extractor cascade | `AILandingPageGenerator.tsx`, `TruMoveBrandingElements.tsx`, `index.css` | Bug fix |
| Customer portal auth + layout | New: `CustomerPortal.tsx`, `CustomerPortalDashboard.tsx`, `CustomerPortalShell.tsx` | New feature |
| Portal database table + RLS | Migration SQL | Database |
| Mobile enhancements | `index.css`, new portal components | UI polish |

