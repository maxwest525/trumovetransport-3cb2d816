

## Plan: Remove Phone Number Pill

**What**: Delete the phone call link pill (`<a href="tel:...">`) on lines 284–287 of `src/pages/CustomerService.tsx`.

**Change**: Remove lines 284–287 in `src/pages/CustomerService.tsx`:
```tsx
// DELETE this block:
<a href="tel:+16097277647" className="tru-secondary-action-btn !text-sm !py-2.5 !px-5">
  <Phone className="h-4 w-4" />
  (609) 727-7647
</a>
```

The "Chat with Trudy" button remains as the sole CTA. If the `Phone` import becomes unused, it will also be removed.

