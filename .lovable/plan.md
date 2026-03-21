

## Plan: Homepage Full Restyle

### Problems Identified
1. **Large gray box** — the hero form card (`.tru-floating-form-card`) has heavy old styling with borders, shadows, and a gray background that doesn't match the new design language
2. **Floating trust strip** — `StatsStrip` sits between hero and AI scanner as a disconnected element
3. **AI Scanner divider not centered** — the dot-divider under "AI-Powered Inventory" uses `flex items-center` without `justify-center` since it's inside the left-aligned `.tru-ai-content-left`
4. **Old-style form** — the hero form uses old `.tru-qb-*` CSS classes with heavy borders, glows, and pill headers instead of clean Tailwind inputs matching the new pages
5. **No textured backgrounds on most sections** — only the AI scanner and tracker sections have dot patterns; the hero and form area have none
6. **No subtle gradients** — hero section relies on old CSS instead of the established `bg-primary/[0.06] blur-[120px]` pattern

### Changes

#### 1. `src/pages/Index.tsx` — Restyle hero form to modern inline Tailwind
- Replace the `.tru-floating-form-card` / `.tru-qb-*` form markup with clean Tailwind-styled inputs matching other pages (rounded-lg borders, `bg-background`, `border-border`, `focus:ring-primary`)
- Replace `.tru-qb-form-header-pill` with the standard section header pattern (uppercase tracking label + dot divider)
- Replace `.tru-qb-continue` / `.tru-engine-btn` with the standard CTA button style (`bg-foreground text-background` with primary icon accents)
- Replace `.tru-floating-form-footer` trust indicators with inline Tailwind
- Remove `.tru-hero-left-column` / `.tru-hero-right-column` CSS dependencies where possible, use Tailwind grid/flex instead
- Add dot pattern + gradient blur backgrounds to the hero section (behind the form)
- Remove or relocate `StatsStrip` — either move it into the hero as a subtle inline element or remove the standalone strip between sections
- Fix AI scanner section: center the dot-divider by adding `justify-center` or restructuring the left column content alignment

#### 2. `src/index.css` — Clean up (minimal)
- No major CSS deletions in this pass (old classes are used elsewhere), but override key form classes to be transparent/borderless so they don't conflict

### Design Specifics
- **Hero form**: White/dark card with `ring-1 ring-border rounded-2xl`, no heavy shadows. Inputs use `rounded-lg border border-border bg-background px-3 py-2.5 text-sm` pattern
- **Form header**: Replace pill with `text-[11px] uppercase tracking-[0.3em] text-primary font-semibold` + dot divider + bold heading
- **Backgrounds**: Add `bg-primary/[0.06] blur-[120px]` blobs and dot pattern to hero wrapper
- **StatsStrip**: Integrate as a compact row inside the hero or remove the standalone div between sections
- **AI Scanner divider**: Wrap in `flex items-center justify-center` to center it properly

