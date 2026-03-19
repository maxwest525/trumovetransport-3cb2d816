

## Plan: Increase White Glow Around "MOVE" in Logo

The logo currently has a 4-layer white drop-shadow. Since `drop-shadow` applies uniformly to all non-transparent pixels, we can't selectively target just the dark "MOVE" text vs the green "Tru" portion with a single filter.

However, increasing the intensity and spread of the existing glow will make the dark letters pop more against the black navbar. The green portion already has inherent contrast so it won't be negatively affected.

### Changes

**`src/components/layout/Header.tsx` (line 159)**

Increase the glow radius and opacity across all layers, and add additional wider layers for a stronger halo effect:

```
Current:  drop-shadow(0 0 4px rgba(255,255,255,1)) drop-shadow(0 0 10px rgba(255,255,255,0.85)) drop-shadow(0 0 22px rgba(255,255,255,0.5)) drop-shadow(0 0 40px rgba(255,255,255,0.25))

Proposed: drop-shadow(0 0 6px rgba(255,255,255,1)) drop-shadow(0 0 14px rgba(255,255,255,1)) drop-shadow(0 0 28px rgba(255,255,255,0.7)) drop-shadow(0 0 44px rgba(255,255,255,0.4)) drop-shadow(0 0 60px rgba(255,255,255,0.2))
```

Key differences:
- Inner layers bumped to full opacity (1.0) for a brighter core glow around the black letters
- Mid-range layers increased from 0.5→0.7 for stronger falloff
- Added a 5th layer at 60px for a wider, softer halo

