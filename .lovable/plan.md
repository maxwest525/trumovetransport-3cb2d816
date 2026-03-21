

## Plan: Fix CSS Build Error + Restyle AI Inventory Section

### 1. Fix build error in `src/index.css`
- **Line 1507-1508**: Stray `overflow-x: clip; }` sitting outside any rule block after the `@keyframes trudy-bounce` closing brace. Delete these two orphan lines.

### 2. Restyle AI-Powered Inventory section in `src/pages/Index.tsx`
- Remove the legacy `.tru-ai-header-row` class from the grid container; replace with inline Tailwind grid: `grid grid-cols-1 lg:grid-cols-3 gap-8 items-center`
- Remove `.tru-ai-scanner-center` and `.tru-ai-detection-right` classes; replace with simple Tailwind wrappers
- Tighten vertical padding: reduce `py-14 md:py-20` to `py-10 md:py-16`
- Remove redundant inline `style={{ justifyContent: 'center' }}`

### 3. Clean up corresponding CSS in `src/index.css`
- Remove `.tru-ai-header-row`, `.tru-ai-scanner-center`, `.tru-ai-detection-right` definitions and their responsive overrides (since they'll be replaced by Tailwind)

### Design specifics
- 3-column grid on `lg+`, single column stacked on mobile — matching the current layout but with Tailwind control
- Background layering (gradient blurs + dot pattern + edge lines) stays as-is — it's already using the correct pattern

