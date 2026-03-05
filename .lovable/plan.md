

## Problem

The hero section uses `grid lg:grid-cols-2` with `items-start`, creating two unbalanced columns:
- **Left column**: Small headline ("Meet Trudy"), a tiny subtitle, action buttons, and stats — very short content
- **Right column**: Full chat box with 340px message area + header + input — much taller

This creates a massive visual gap below the left column. The headline looks "minimized" in the top-left while the chat dominates the right. The capabilities grid then sits below this uneven layout.

## Fix

Restructure the hero into a **stacked layout** instead of side-by-side columns:

1. **Hero headline + subtitle + action buttons**: Full-width, centered at the top
2. **Stats row**: Inline below the CTA, centered
3. **Chat box**: Centered below the hero text, constrained width (`max-w-lg`)
4. **Capabilities grid**: Follows naturally without a gap

### Changes in `src/pages/CustomerService.tsx` (lines 297-383)

Replace the `grid lg:grid-cols-2` hero with a single-column centered layout:

```
<section className="pt-6 pb-4 px-4">
  <div className="mx-auto max-w-3xl text-center space-y-4">
    {/* Headline + subtitle */}
    <div>
      <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">Meet Trudy</h1>
      <p className="text-muted-foreground text-xs mt-1 max-w-sm mx-auto leading-relaxed">
        AI move coordinator — instant quotes, tracking, scheduling & support by voice.
      </p>
    </div>

    {/* Action row - centered */}
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {/* Talk to Trudy / End Call buttons - same as current */}
      {/* Phone link - same as current */}
    </div>

    {/* Live status - centered */}
    {/* Stats row - centered */}

    {/* Chat box - centered, constrained */}
    <div className="max-w-lg mx-auto">
      {chatMode === 'demo' ? <TrudyChatBox .../> : <AIChatContainer .../>}
    </div>
  </div>
</section>
```

This eliminates the two-column imbalance and creates a clean top-down flow: headline → CTA → stats → chat → capabilities.

