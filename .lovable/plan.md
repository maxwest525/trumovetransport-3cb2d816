

## Separate Logo Parts for Different Glow Effects

### The Problem

The logo is a **single PNG image** (`src/assets/logo.png`). CSS `filter: drop-shadow()` applies uniformly to the entire image — we cannot give the truck and "TRU" a green underglow while giving "MOVE" a white underglow on a single `<img>` element.

### Solution

Split the logo into **two or three separate PNG images** (with transparent backgrounds), then layer them in the header:

1. **Truck + "TRU"** — gets green underglow (`rgba(34,197,94,...)`)
2. **"MOVE"** — gets white underglow (`rgba(255,255,255,...)`)

Both get the black outline simulation (tight dark shadows) and a **bottom-right drop shadow** (e.g., `drop-shadow(3px 4px 6px rgba(0,0,0,0.7))` instead of the current centered `0 4px 6px`).

### Steps

1. **User provides two separate logo PNGs** — one for the truck+"TRU" portion, one for "MOVE". (I cannot split a PNG programmatically.)
2. **Update `Header.tsx`** — replace the single `<img>` with a container holding two `<img>` elements side by side, each with their own filter styles:
   - Truck+TRU: black outline + bottom-right shadow + green glow
   - MOVE: black outline + bottom-right shadow + white glow
3. Position them so they align seamlessly as one logo.

### Immediate Fix (without splitting)

If splitting isn't feasible, I can at least fix the **shadow direction to bottom-right** now by changing the dark shadow offset from `0 4px 6px` to `3px 4px 6px`. But the dual-color glow requires separate image assets.

**Do you have (or can you provide) the logo split into two parts?** Or would you prefer I apply the bottom-right shadow fix now with a single green glow as a start?

