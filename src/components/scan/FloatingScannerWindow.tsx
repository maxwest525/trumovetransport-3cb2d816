import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, X, Upload, FolderOpen, Move } from "lucide-react";

interface FloatingScannerWindowProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Header content (preview pill). Rendered inside the window above the upload area. */
  header?: ReactNode;
  /**
   * Called when the user clicks the central upload area. Should trigger the
   * existing hidden file input on the scanner page.
   */
  onUploadClick: () => void;
  /**
   * Called when files are dropped on the upload area. Receives the same
   * DragEvent the underlying library handler expects.
   */
  onFilesDrop: (e: React.DragEvent) => void;
  /** Optional extra content rendered below the upload area. */
  children?: ReactNode;
}

const STORAGE_KEY = "tru-floating-scanner-window-v1";
const MIN_W = 360;
const MIN_H = 320;
const DEFAULT_W = 520;
const DEFAULT_H = 540;
const MOBILE_BREAKPOINT = 768;

interface PersistedState {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.x === "number" &&
      typeof parsed?.y === "number" &&
      typeof parsed?.width === "number" &&
      typeof parsed?.height === "number"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function clampToViewport(
  x: number,
  y: number,
  width: number,
  height: number,
): PersistedState {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(width, vw - 16);
  const h = Math.min(height, vh - 16);
  const cx = Math.max(8, Math.min(x, vw - w - 8));
  const cy = Math.max(8, Math.min(y, vh - h - 8));
  return { x: cx, y: cy, width: w, height: h };
}

/**
 * Movable, resizable, viewport-clamped window for the AI scanner.
 * Falls back to a full-screen sheet on small viewports.
 */
export function FloatingScannerWindow({
  open,
  onClose,
  title = "AI Scanner",
  header,
  onUploadClick,
  onFilesDrop,
  children,
}: FloatingScannerWindowProps) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );
  const [state, setState] = useState<PersistedState>(() => {
    if (typeof window === "undefined") {
      return { x: 100, y: 80, width: DEFAULT_W, height: DEFAULT_H };
    }
    const persisted = loadState();
    if (persisted) return clampToViewport(persisted.x, persisted.y, persisted.width, persisted.height);
    const x = Math.max(16, Math.round((window.innerWidth - DEFAULT_W) / 2));
    const y = Math.max(16, Math.round((window.innerHeight - DEFAULT_H) / 3));
    return { x, y, width: DEFAULT_W, height: DEFAULT_H };
  });
  const [maximized, setMaximized] = useState(false);
  const [restoreState, setRestoreState] = useState<PersistedState | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startLeft: number;
    startTop: number;
    edges: { left: boolean; right: boolean; top: boolean; bottom: boolean };
  } | null>(null);

  // Persist (debounced via the natural cadence of updates).
  useEffect(() => {
    if (maximized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, maximized]);

  // Keep clamped on viewport resize.
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      setState((s) => clampToViewport(s.x, s.y, s.width, s.height));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (maximized || isMobile) return;
      // Ignore drags initiated on interactive controls inside the header bar.
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        offsetX: e.clientX - state.x,
        offsetY: e.clientY - state.y,
      };
    },
    [maximized, isMobile, state.x, state.y],
  );

  const handleHeaderPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const nextX = e.clientX - drag.offsetX;
      const nextY = e.clientY - drag.offsetY;
      setState((s) => clampToViewport(nextX, nextY, s.width, s.height));
    },
    [],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      dragRef.current = null;
    }
  }, []);

  const startResize = (
    e: React.PointerEvent<HTMLDivElement>,
    edges: { left: boolean; right: boolean; top: boolean; bottom: boolean },
  ) => {
    if (maximized || isMobile) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    resizeRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startW: state.width,
      startH: state.height,
      startLeft: state.x,
      startTop: state.y,
      edges,
    };
  };

  const onResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = resizeRef.current;
    if (!r || r.pointerId !== e.pointerId) return;
    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;
    let newW = r.startW;
    let newH = r.startH;
    let newX = r.startLeft;
    let newY = r.startTop;
    if (r.edges.right) newW = r.startW + dx;
    if (r.edges.bottom) newH = r.startH + dy;
    if (r.edges.left) {
      newW = r.startW - dx;
      newX = r.startLeft + dx;
    }
    if (r.edges.top) {
      newH = r.startH - dy;
      newY = r.startTop + dy;
    }
    newW = Math.max(MIN_W, newW);
    newH = Math.max(MIN_H, newH);
    setState(clampToViewport(newX, newY, newW, newH));
  };

  const endResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (resizeRef.current?.pointerId === e.pointerId) {
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      resizeRef.current = null;
    }
  };

  const toggleMaximize = () => {
    if (maximized) {
      if (restoreState) setState(clampToViewport(restoreState.x, restoreState.y, restoreState.width, restoreState.height));
      setMaximized(false);
    } else {
      setRestoreState(state);
      setMaximized(true);
    }
  };

  if (!open) return null;

  // Mobile: full-screen sheet, no drag/resize.
  const positionStyle: React.CSSProperties = isMobile || maximized
    ? { left: 8, top: 8, width: "calc(100vw - 16px)", height: "calc(100vh - 16px)" }
    : { left: state.x, top: state.y, width: state.width, height: state.height };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      setIsDraggingFiles(true);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) setIsDraggingFiles(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    onFilesDrop(e);
  };

  const content = (
    <div
      role="dialog"
      aria-label={title}
      className="fixed z-[100] flex flex-col rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
      style={positionStyle}
    >
      {/* Title bar (drag handle) */}
      <div
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40 ${
          isMobile || maximized ? "" : "cursor-move select-none"
        }`}
      >
        <Move className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[12px] font-bold uppercase tracking-wider text-foreground">
          {title}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {!isMobile && (
            <button
              type="button"
              onClick={toggleMaximize}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={maximized ? "Restore" : "Expand"}
              aria-label={maximized ? "Restore" : "Expand"}
            >
              {maximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-auto p-3 space-y-3">
        {header}

        {/* Upload card with drag-and-drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed transition-colors ${
            isDraggingFiles
              ? "border-primary bg-primary/[0.10]"
              : "border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08] hover:border-primary/60"
          }`}
        >
          <button
            type="button"
            onClick={onUploadClick}
            className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {isDraggingFiles ? "Drop to add to All" : "Upload your Images and Videos"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Drag & drop or{" "}
              <span className="text-primary font-semibold underline underline-offset-2">
                click to browse
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mt-1">
              <FolderOpen className="w-3 h-3" /> Goes into "All" folder by default
            </p>
          </button>
        </div>

        {children}
      </div>

      {/* Resize handles - hidden on mobile/maximized */}
      {!isMobile && !maximized && (
        <>
          {/* Edges */}
          <div
            onPointerDown={(e) => startResize(e, { left: false, right: true, top: false, bottom: false })}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize"
          />
          <div
            onPointerDown={(e) => startResize(e, { left: true, right: false, top: false, bottom: false })}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className="absolute top-0 left-0 h-full w-1.5 cursor-ew-resize"
          />
          <div
            onPointerDown={(e) => startResize(e, { left: false, right: false, top: false, bottom: true })}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize"
          />
          <div
            onPointerDown={(e) => startResize(e, { left: false, right: false, top: true, bottom: false })}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className="absolute top-0 left-0 w-full h-1.5 cursor-ns-resize"
          />
          {/* Corner grip - bottom right (visible) */}
          <div
            onPointerDown={(e) => startResize(e, { left: false, right: true, top: false, bottom: true })}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5"
            title="Drag to resize"
          >
            <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-muted-foreground/60 hover:border-primary transition-colors" />
          </div>
          {/* Other corners */}
          <div
            onPointerDown={(e) => startResize(e, { left: true, right: false, top: false, bottom: true })}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize"
          />
          <div
            onPointerDown={(e) => startResize(e, { left: false, right: true, top: true, bottom: false })}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize"
          />
          <div
            onPointerDown={(e) => startResize(e, { left: true, right: false, top: true, bottom: false })}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize"
          />
        </>
      )}
    </div>
  );

  return createPortal(content, document.body);
}

export default FloatingScannerWindow;