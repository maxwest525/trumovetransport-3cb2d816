import { useEffect, useRef, useState } from "react";
import { Package, Weight, ArrowLeft, Sparkles } from "lucide-react";

export interface ScannerPreviewItem {
  id: string | number;
  name: string;
  quantity: number;
}

interface ScannerPreviewPillProps {
  totalWeight: number;
  totalCuFt: number;
  detectedCount: number;
  /** Most-recent-first list of detected items. The pill cycles through them 3 at a time. */
  recentItems: ScannerPreviewItem[];
  onBackToInventory: () => void;
}

/**
 * Compact horizontal status pill shown at the top of the floating scanner window.
 * Displays running totals (lbs / cu.ft), a rotating window of the 3 most-recently
 * detected items, and a "Back to inventory" action.
 *
 * Newly arriving items (IDs not seen on the previous render) get a one-shot
 * highlight ring + fade-in so customers can see the scan progressing in real time.
 */
export function ScannerPreviewPill({
  totalWeight,
  totalCuFt,
  detectedCount,
  recentItems,
  onBackToInventory,
}: ScannerPreviewPillProps) {
  const [windowStart, setWindowStart] = useState(0);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const seenIdsRef = useRef<Set<string>>(new Set());
  const highlightTimersRef = useRef<Map<string, number>>(new Map());

  // Detect newly arrived items by diffing against the previous render.
  // Each newcomer gets a 1.6s highlight, then fades to the steady-state pill.
  useEffect(() => {
    const currentIds = new Set(recentItems.map((i) => String(i.id)));
    const newcomers: string[] = [];
    currentIds.forEach((id) => {
      if (!seenIdsRef.current.has(id)) newcomers.push(id);
    });
    seenIdsRef.current = currentIds;

    if (newcomers.length === 0) return;

    setHighlightedIds((prev) => {
      const next = new Set(prev);
      newcomers.forEach((id) => next.add(id));
      return next;
    });

    // When a new item arrives, jump the cycling window back to the start so
    // the freshest detections are immediately visible.
    setWindowStart(0);

    newcomers.forEach((id) => {
      const existing = highlightTimersRef.current.get(id);
      if (existing) window.clearTimeout(existing);
      const timer = window.setTimeout(() => {
        setHighlightedIds((prev) => {
          if (!prev.has(id)) return prev;
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        highlightTimersRef.current.delete(id);
      }, 1600);
      highlightTimersRef.current.set(id, timer);
    });
  }, [recentItems]);

  // Clean up any pending highlight timers on unmount.
  useEffect(() => {
    const timers = highlightTimersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  // Cycle the visible 3-item window every 2.5s when there are more than 3 items.
  useEffect(() => {
    if (recentItems.length <= 3) {
      setWindowStart(0);
      return;
    }
    const id = window.setInterval(() => {
      setWindowStart((prev) => (prev + 1) % recentItems.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [recentItems.length]);

  // Build the visible 3-item slice with wrap-around.
  const visible: ScannerPreviewItem[] = [];
  for (let i = 0; i < Math.min(3, recentItems.length); i++) {
    visible.push(recentItems[(windowStart + i) % recentItems.length]);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
      {/* Totals */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider transition-all">
        <Weight className="w-3 h-3" />
        {Math.round(totalWeight).toLocaleString()} lbs
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider transition-all">
        <Package className="w-3 h-3" />
        {Math.round(totalCuFt).toLocaleString()} cu.ft
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        <Sparkles className={`w-3 h-3 text-primary ${highlightedIds.size > 0 ? "animate-pulse" : ""}`} />
        {detectedCount} found
      </div>

      {/* Cycling recent items - 3 most-recent suggestions */}
      <div className="flex-1 min-w-[160px] flex flex-wrap items-center gap-1.5 overflow-hidden">
        {visible.length === 0 ? (
          <span className="text-[11px] text-muted-foreground/70 italic">
            Detected items will appear here
          </span>
        ) : (
          visible.map((item) => {
            const isNew = highlightedIds.has(String(item.id));
            return (
              <span
                key={`${item.id}-${windowStart}`}
                className={`inline-flex max-w-[180px] items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium animate-fade-in transition-all duration-300 ${
                  isNew
                    ? "bg-primary/15 border border-primary text-primary ring-2 ring-primary/30 shadow-[0_0_0_4px_hsl(var(--primary)/0.08)]"
                    : "bg-background border border-border text-foreground"
                }`}
                title={item.name}
              >
                {isNew && <Sparkles className="w-3 h-3 shrink-0" />}
                <span className="truncate">{item.name}</span>
                {item.quantity > 1 && (
                  <span className={isNew ? "font-bold" : "text-primary font-bold"}>
                    x{item.quantity}
                  </span>
                )}
              </span>
            );
          })
        )}
      </div>

      {/* Back to inventory */}
      <button
        type="button"
        onClick={onBackToInventory}
        className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/[0.06] hover:bg-primary/[0.14] px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to inventory
      </button>
    </div>
  );
}

export default ScannerPreviewPill;
