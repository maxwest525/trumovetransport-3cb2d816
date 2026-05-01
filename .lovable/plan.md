## Goal

Turn the AI scanner panel into an expandable, resizable, movable window. Inside that window, surface the photo upload library card with drag-and-drop, plus a live preview pill (total lbs, total cu.ft, and the 3 most recent detected items cycling). Keep the full inventory accessible via a "Back to inventory" button.

## What this is NOT

This is not adding a new modal. The Custom Item modal stays as-is. Drag-and-drop file upload already exists in the scanner - we're not rebuilding it, we're re-housing it inside the new floating window and adding the preview header.

## What changes

### 1. New floating scanner window (`src/components/scan/FloatingScannerWindow.tsx`)

A new wrapper component, modeled on the existing `DraggableModal`:

- Movable: drag by the title bar.
- Resizable: edge + corner handles, viewport-clamped (cannot be dragged or resized off-screen).
- Window controls in the title bar: Expand / Restore / Close.
- "Expand" maximizes to ~95vw x 90vh; "Restore" returns to the last user size.
- Sensible min size (e.g. 480 x 520) and a default size that fits a laptop screen.
- Position + size persisted in `localStorage` so it remembers across sessions.
- Mobile: full-screen sheet behavior (no drag/resize on small viewports).

### 2. Live preview header (inside the window, above the upload card)

A single horizontal pill row that always shows:

- Total weight (lbs) of detected inventory.
- Total volume (cu.ft) of detected inventory.
- A rotating slot showing 3 most recently detected items (cycles every ~2.5s if more than 3 exist).
- A "Back to inventory" button on the right that closes the floating window and returns the user to the full inventory view.

Counts come from the existing `detectedItems` state already in `ScanRoom.tsx`.

### 3. Upload card moved into the window

The existing Library panel (the right-hand column at `ScanRoom.tsx` ~line 2167) is lifted out and rendered inside the new floating window. All existing behavior is preserved:

- Click to upload.
- Drag-and-drop files onto the card (already wired via `handleLibraryDrop`).
- Folders, multi-select, batch move, scan triggers - unchanged.

### 4. Trigger to open the window

Add an "Open scanner" / "Expand scanner" button on the scan page. When clicked, the floating window mounts. The existing inline split-pane layout still works for users who prefer it; the floating window is an additional view, not a replacement, so we don't break the current flow.

## Files touched

- New: `src/components/scan/FloatingScannerWindow.tsx`
- New: `src/components/scan/ScannerPreviewPill.tsx` (the lbs/cu.ft + cycling items header)
- Edit: `src/pages/ScanRoom.tsx` - add the open button, mount the floating window, pass `detectedItems` and the existing library handlers in as props. No logic rewrites.

## Technical notes

- Reuse drag/resize math from `src/components/ui/DraggableModal.tsx` (already viewport-clamped and battle-tested) instead of writing new geometry code.
- Cycling preview uses a `setInterval` with a 3-item window over `detectedItems`, cleared on unmount.
- All colors via semantic tokens (`var(--primary)`, `var(--background)`), per project rules. No em dashes in copy.
- No backend changes, no new tables, no new edge functions.

## Open question (non-blocking, can decide during build)

Should opening the floating window auto-collapse the inline split-pane scanner so there's only one scanner UI visible at a time? Default plan: yes, hide the inline scanner while the floating window is open, restore it on close.
