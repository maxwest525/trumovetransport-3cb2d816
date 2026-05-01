# Room Scanner - Cinematic Polish + Fullscreen Scan Stage

## Goal

Make the existing scan moment feel premium without changing the flow, adding taps, increasing AI cost, or blocking the multi-room workflow. Four focused upgrades on `src/pages/ScanRoom.tsx` and `src/index.css`.

## What stays the same

- Same upload/scan flow
- Same Gemini 2.5 Flash detection (no model change, no cost change)
- Same auto-merge into the inventory list
- Same per-photo reveal sequence (`revealedBoxCount` ticking up)
- Same handoff to manual inventory after the scan
- No confidence colors, no tap-to-dismiss, no slide-up summary card

## What changes

### 1. Replace the cheesy scan line with a "depth sweep" effect

The current `tru-ai-scanner-line` is a hard horizontal bar. Replace it with one of these (will pick the cleanest in implementation):

- **Soft radial spotlight** that drifts diagonally across the photo once, with a faint grid/noise texture only inside the spotlight. Reads as "AI is examining" instead of "Star Trek tricorder."
- Single 1.2s pass, runs once per photo, then disappears. No looping.
- Uses `var(--primary)` at low opacity so it matches brand without screaming.

If the spotlight still feels cheesy, fall back to a simple corner-to-corner shimmer (gradient sweep at ~8% opacity). Either way: subtle, one-shot, premium.

### 2. Animated bracket draw-in for each detection box

Right now boxes appear instantly when `revealedBoxCount` increments. Add CSS keyframes so each new box:

- Corner brackets scale in from 0 to full size (180ms, ease-out)
- Label pill fades + slides up 4px (220ms, 80ms delay)
- Whole box gets a one-shot soft glow pulse on appear (400ms, then settles)

Pure CSS via `animation` on `.tru-ai-detection-box` when it mounts. No JS timing changes needed - the existing stagger from `revealedBoxCount` already drives it.

### 3. Mobile haptic tick on each box reveal

In the existing reveal loop (around line 965), add:

```ts
if ("vibrate" in navigator) navigator.vibrate(8);
```

8ms is a barely-perceptible tap, not a buzz. Fires once per detected item as it appears. Desktop ignores it. Free perceived-quality bump.

### 4. Fullscreen "Scan Stage" mode

When a scan kicks off (`isAiScanning` becomes true), the scanner panel expands to a fullscreen overlay so the photo + boxes get the whole screen. When the photo finishes (or user taps Done), it collapses back to the normal split layout so they can shoot the next room.

Behavior:
- Triggered automatically when `isAiScanning` flips true
- Renders a fixed `inset-0 z-50` overlay containing the active photo, boxes, scan effect, and the existing tally text
- Top-right close button ("Done" / X icon) - tap to exit early
- Auto-collapses 1.2s after the last box of the **final** photo lands (so the user sees the completed result, then returns to the workspace to scan the next room)
- Between photos in a multi-photo batch, stays fullscreen (smoother than popping in/out)
- Body scroll locked while open (same pattern as existing modals)
- Respects `prefers-reduced-motion` - skips the bracket animations and scan effect, just shows boxes statically

Mobile: fills the viewport edge-to-edge, photo uses `object-contain` so nothing is cropped. Desktop: same overlay, photo centered with max dimensions so it doesn't get absurdly stretched.

This solves your "go full screen for it too" without blocking the multi-room flow - they finish the scan, hit Done (or it auto-closes), and they're right back in the workspace ready for the next photo.

## Files touched

- `src/pages/ScanRoom.tsx` - add fullscreen overlay component, vibrate call in reveal loop, prefers-reduced-motion check
- `src/index.css` - new keyframes for bracket draw-in + glow pulse, replace `tru-ai-scanner-line` with the depth-sweep effect, fullscreen overlay styles

## Out of scope

- No backend changes
- No edge function changes
- No model upgrade
- No new user steps or decisions
- No changes to the inventory list, manual builder, or post-scan handoff
- Confidence-color coding stays off (already removed from plan)

## Risk

Low. All changes are presentational and additive. Worst case the fullscreen overlay feels off and we revert to inline-only - the underlying scan logic is untouched.
