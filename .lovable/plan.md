

## Redesign: Portal Page — Clean, Modern, Premium

The emojis and current card style look dated. Here's a complete visual overhaul inspired by Linear/Vercel — ultra-clean, monochrome, text-forward.

### Direction
- **No emojis, no gradients, no colored icon boxes**
- Monochrome Lucide icons (thin, 20px, `text-muted-foreground`) — no backgrounds or circles around them
- Cards: minimal — tight padding, `rounded-xl`, very subtle border, no shadow at rest. On hover: slight border brightening + subtle shadow
- Remove the ambient background blurs (the colored gradient orbs) — they add visual noise
- Remove the "Open →" CTA row from each card — the whole card is clickable, it's obvious
- Header: logo + greeting + email/sign-out on one tight block, less vertical spacing
- Grid: 4 columns on desktop, tighter `gap-2.5`, `max-w-[900px]`
- Overall feel: dark-mode-friendly, high contrast text, lots of whitespace, no decoration

### Icon mapping (Lucide, monochrome)
| Card | Icon |
|------|------|
| Admin | `Settings` |
| Agent | `Users` |
| Manager | `BarChart3` |
| Marketing | `Megaphone` |
| Accounting | `Receipt` |
| Lead Vendors | `Package` |
| Compliance | `ShieldCheck` |
| Customer Sites | `Globe` |

### Card structure (simplified)
```
┌─────────────────────┐
│ [icon]  Title        │  ← icon + title on same line
│ Description text     │
│            stat pill →│  ← top-right corner if exists
└─────────────────────┘
```

Cards become horizontal-ish: icon left-aligned inline with the title, description below, stat badge top-right. More compact, less "tile-y".

### Files changed
- `src/pages/AgentLogin.tsx` — full card and header redesign, swap emojis for Lucide icons, remove ambient blurs and "Open" CTA

