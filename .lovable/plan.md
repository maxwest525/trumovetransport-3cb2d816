

## Fix Logo Glow Effect — Add Black Outline + Dark Shadow

The current implementation only applied green `drop-shadow` layers to the logo. The user's reference image shows a more complete effect with **four components**:

1. **Green fill** (already part of the logo image)
2. **Black stroke/outline** around the logo shape
3. **Green neon underglow** (radiating green bloom)
4. **Dark drop shadow** for depth/contrast

### The Problem

Since the logo is a **PNG image** (not text), we cannot use `-webkit-text-stroke`. For images, all effects must be achieved through CSS `filter: drop-shadow(...)` layers.

### Solution

**File: `src/components/layout/Header.tsx`** (~line 41)

Replace the current green-only drop-shadow chain with a layered approach:
- **Dark outline layers** — tight, opaque black shadows at small radii (1-2px) in multiple directions to simulate a stroke
- **Dark drop shadow** — a larger black shadow for depth (e.g., `0 4px 6px rgba(0,0,0,0.6)`)
- **Green glow layers** — progressively larger/softer green shadows for the neon bloom

```
filter:
  /* Black outline simulation */
  drop-shadow(1px 1px 0 rgba(0,0,0,0.9))
  drop-shadow(-1px -1px 0 rgba(0,0,0,0.9))
  drop-shadow(1px -1px 0 rgba(0,0,0,0.9))
  drop-shadow(-1px 1px 0 rgba(0,0,0,0.9))
  /* Dark depth shadow */
  drop-shadow(0 4px 6px rgba(0,0,0,0.7))
  /* Green neon glow */
  drop-shadow(0 0 8px rgba(34,197,94,0.9))
  drop-shadow(0 0 20px rgba(34,197,94,0.7))
  drop-shadow(0 0 40px rgba(34,197,94,0.4))
```

This replicates all four visual components from the reference image using only CSS filters compatible with PNG images.

