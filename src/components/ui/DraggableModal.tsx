import { useState, useRef, useCallback, useEffect } from "react";
import { X, GripHorizontal, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
 
type SnapZone = 'center' | 'left' | 'right' | 'top' | 'bottom' | null;
type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

const SNAP_THRESHOLD = 40;
const SNAP_MARGIN = 20;
const RESIZE_SNAP_THRESHOLD = 30;

// Common size presets for snap-to-grid resizing
const SIZE_PRESETS = [
  { width: 640, height: 480, label: "Small" },
  { width: 800, height: 600, label: "Standard" },
  { width: 1024, height: 768, label: "Large" },
  { width: 1280, height: 720, label: "HD" },
  { width: 1440, height: 900, label: "Wide" },
  { width: 1600, height: 900, label: "Ultrawide" },
];

const findNearestPreset = (width: number, height: number) => {
  for (const preset of SIZE_PRESETS) {
    if (
      Math.abs(width - preset.width) < RESIZE_SNAP_THRESHOLD &&
      Math.abs(height - preset.height) < RESIZE_SNAP_THRESHOLD
    ) {
      return preset;
    }
  }
  return null;
};

 interface StoredModalState {
   position: { x: number; y: number };
   size: { width: number; height: number };
 }
 
 const getStoredState = (storageKey: string): StoredModalState | null => {
   try {
     const stored = localStorage.getItem(storageKey);
     if (stored) {
       return JSON.parse(stored);
     }
   } catch (e) {
     console.warn("Failed to load modal state from localStorage");
   }
   return null;
 };
 
const saveState = (
  storageKey: string, 
  position: { x: number; y: number }, 
  size: { width: number; height: number }
) => {
   try {
     localStorage.setItem(storageKey, JSON.stringify({ position, size }));
   } catch (e) {
     console.warn("Failed to save modal state to localStorage");
   }
 };
 
 interface DraggableModalProps {
   isOpen: boolean;
   onClose: () => void;
   title: React.ReactNode;
   children: React.ReactNode;
   storageKey: string;
   defaultWidth?: number;
   defaultHeight?: number;
   minWidth?: number;
   minHeight?: number;
   maxWidth?: number;
   maxHeight?: number;
   headerClassName?: string;
   headerStyle?: React.CSSProperties;
   footer?: React.ReactNode;
  showMaximize?: boolean;
 }
 
 export default function DraggableModal({ 
   isOpen, 
   onClose, 
   title,
   children,
   storageKey,
   defaultWidth = 800,
   defaultHeight = 600,
   minWidth = 400,
   minHeight = 300,
   maxWidth = 1200,
   maxHeight = 900,
   headerClassName,
   headerStyle,
  footer,
  showMaximize = true
 }: DraggableModalProps) {
  const isMobile = useIsMobile();
   const [position, setPosition] = useState(() => {
     const stored = getStoredState(storageKey);
     return stored?.position ?? { x: 100, y: 60 };
   });
   const [size, setSize] = useState(() => {
     const stored = getStoredState(storageKey);
     return stored?.size ?? { width: defaultWidth, height: defaultHeight };
   });
  const [isMaximized, setIsMaximized] = useState(false);
  const [snapZone, setSnapZone] = useState<SnapZone>(null);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [sizePresetHint, setSizePresetHint] = useState<typeof SIZE_PRESETS[0] | null>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [isResizing, setIsResizing] = useState(false);
   const [hasInitialized, setHasInitialized] = useState(false);
   const dragOffset = useRef({ x: 0, y: 0 });
   const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const preMaximizeState = useRef({ position: { x: 0, y: 0 }, size: { width: 0, height: 0 } });
   const modalRef = useRef<HTMLDivElement>(null);
 
   // Initialize position on first open - use stored or center
   useEffect(() => {
     if (isOpen && !hasInitialized) {
       const stored = getStoredState(storageKey);
     if (stored?.size && stored?.position) {
         // Validate stored position is still within viewport
         const maxX = window.innerWidth - stored.size.width;
         const maxY = window.innerHeight - 50;
         setPosition({
           x: Math.max(0, Math.min(maxX, stored.position.x)),
           y: Math.max(0, Math.min(maxY, stored.position.y))
         });
         setSize(stored.size);
       } else {
         // Center if no stored state
         const centerX = (window.innerWidth - size.width) / 2;
         const centerY = (window.innerHeight - size.height) / 2;
         setPosition({ x: Math.max(20, centerX), y: Math.max(20, centerY) });
       }
       setHasInitialized(true);
     }
   }, [isOpen, hasInitialized, storageKey, size.width, size.height]);
 
  const getSnappedPosition = useCallback((zone: SnapZone, currentSize: { width: number; height: number }) => {
    switch (zone) {
      case 'center':
        return {
          x: (window.innerWidth - currentSize.width) / 2,
          y: (window.innerHeight - currentSize.height) / 2
        };
      case 'left':
        return { x: SNAP_MARGIN, y: position.y };
      case 'right':
        return { x: window.innerWidth - currentSize.width - SNAP_MARGIN, y: position.y };
      case 'top':
        return { x: position.x, y: SNAP_MARGIN };
      case 'bottom':
        return { x: position.x, y: window.innerHeight - currentSize.height - SNAP_MARGIN };
      default:
        return position;
    }
  }, [position]);

  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      // Restore
      setPosition(preMaximizeState.current.position);
      setSize(preMaximizeState.current.size);
    } else {
      // Save current state and maximize
      preMaximizeState.current = { position, size };
      setPosition({ x: SNAP_MARGIN, y: SNAP_MARGIN });
      setSize({ 
        width: window.innerWidth - SNAP_MARGIN * 2, 
        height: window.innerHeight - SNAP_MARGIN * 2 
      });
    }
    setIsMaximized(!isMaximized);
  }, [isMaximized, position, size]);

   const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return; // Disable drag when maximized
     e.preventDefault();
     setIsDragging(true);
     dragOffset.current = {
       x: e.clientX - position.x,
       y: e.clientY - position.y
     };
  }, [position, isMaximized]);
 
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, direction: ResizeDirection = 'se') => {
    if (isMaximized) return; // Disable resize when maximized
     e.preventDefault();
     e.stopPropagation();
     setIsResizing(true);
    setResizeDirection(direction);
     resizeStart.current = {
       x: e.clientX,
       y: e.clientY,
       width: size.width,
       height: size.height
     };
  }, [size, isMaximized]);
 
   useEffect(() => {
     let currentPosition = position;
     let currentSize = size;
    let currentSnapZone: SnapZone = null;
     
     const handleMouseMove = (e: MouseEvent) => {
       if (isDragging) {
         const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.current.x));
         const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.current.y));
         currentPosition = { x: newX, y: newY };
         setPosition(currentPosition);

        // Detect snap zones
        const centerX = (window.innerWidth - size.width) / 2;
        const centerY = (window.innerHeight - size.height) / 2;

        let detectedSnap: SnapZone = null;

        // Center snap (both axes must be close)
        if (Math.abs(newX - centerX) < SNAP_THRESHOLD && 
            Math.abs(newY - centerY) < SNAP_THRESHOLD) {
          detectedSnap = 'center';
        }
        // Edge snaps
        else if (newX < SNAP_THRESHOLD) {
          detectedSnap = 'left';
        } else if (newX > window.innerWidth - size.width - SNAP_THRESHOLD) {
          detectedSnap = 'right';
        } else if (newY < SNAP_THRESHOLD) {
          detectedSnap = 'top';
        } else if (newY > window.innerHeight - size.height - SNAP_THRESHOLD) {
          detectedSnap = 'bottom';
        }

        currentSnapZone = detectedSnap;
        setSnapZone(detectedSnap);
       }
       if (isResizing) {
         const deltaX = e.clientX - resizeStart.current.x;
         const deltaY = e.clientY - resizeStart.current.y;
        
        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;
        let newX = position.x;
        let newY = position.y;
        
        // Handle different resize directions
        if (resizeDirection?.includes('e')) {
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.current.width + deltaX));
        }
        if (resizeDirection?.includes('w')) {
          const widthChange = Math.min(resizeStart.current.width - minWidth, Math.max(-(maxWidth - resizeStart.current.width), -deltaX));
          newWidth = resizeStart.current.width + widthChange;
          newX = position.x - widthChange + (resizeStart.current.width - size.width);
        }
        if (resizeDirection?.includes('s')) {
          newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.current.height + deltaY));
        }
        if (resizeDirection?.includes('n')) {
          const heightChange = Math.min(resizeStart.current.height - minHeight, Math.max(-(maxHeight - resizeStart.current.height), -deltaY));
          newHeight = resizeStart.current.height + heightChange;
          newY = position.y - heightChange + (resizeStart.current.height - size.height);
        }
        
        // Check for size preset snap
        const nearestPreset = findNearestPreset(newWidth, newHeight);
        setSizePresetHint(nearestPreset);
        
         currentSize = { width: newWidth, height: newHeight };
         setSize(currentSize);
        
        if (resizeDirection?.includes('w') || resizeDirection?.includes('n')) {
          setPosition({ x: newX, y: newY });
          currentPosition = { x: newX, y: newY };
        }
       }
     };
 
     const handleMouseUp = () => {
      if (isDragging) {
        // Apply snap if in zone
        if (currentSnapZone) {
          const snappedPosition = getSnappedPosition(currentSnapZone, size);
          currentPosition = snappedPosition;
          setPosition(snappedPosition);
        }
        saveState(storageKey, currentPosition, size);
        setSnapZone(null);
      }
      if (isResizing) {
        // Apply size preset snap if near one
        if (sizePresetHint) {
          currentSize = { width: sizePresetHint.width, height: sizePresetHint.height };
          setSize(currentSize);
        }
        saveState(storageKey, currentPosition, currentSize);
        setSizePresetHint(null);
        setResizeDirection(null);
       }
       setIsDragging(false);
       setIsResizing(false);
     };
 
     if (isDragging || isResizing) {
       document.addEventListener('mousemove', handleMouseMove);
       document.addEventListener('mouseup', handleMouseUp);
       return () => {
         document.removeEventListener('mousemove', handleMouseMove);
         document.removeEventListener('mouseup', handleMouseUp);
       };
     }
  }, [isDragging, isResizing, size.width, size.height, minWidth, maxWidth, minHeight, maxHeight, storageKey, getSnappedPosition, size, resizeDirection, position, sizePresetHint]);
 
   if (!isOpen) return null;

   // Mobile: render a simple full-screen modal
   if (isMobile) {
     return (
       <>
         <div className="fixed inset-0 bg-black/30 z-[100]" onClick={onClose} />
         <div className="fixed inset-0 z-[110] bg-background flex flex-col">
           <div
             className={cn("flex items-center justify-between px-4 py-3 shrink-0", headerClassName)}
             style={headerStyle}
           >
             <div className="flex items-center gap-2 flex-1 min-w-0">
               {title}
             </div>
             <button
               onClick={onClose}
               className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 border border-white/20 hover:border-red-400 transition-all ml-2 flex-shrink-0"
               title="Close"
             >
               <X className="w-5 h-5 text-white" />
             </button>
           </div>
           <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
           {footer && <div className="shrink-0">{footer}</div>}
         </div>
       </>
     );
   }
 
   return (
     <>
      {/* Snap guide lines */}
      {isDragging && snapZone && (
        <>
          {snapZone === 'center' && (
            <div className="fixed inset-0 pointer-events-none z-[105]">
              {/* Vertical center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-purple-500/60 -translate-x-1/2" />
              {/* Horizontal center line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-purple-500/60 -translate-y-1/2" />
              {/* Center crosshair glow */}
              <div className="absolute left-1/2 top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/30 border border-purple-500/60" />
            </div>
          )}
          {snapZone === 'left' && (
            <div className="fixed top-0 bottom-0 w-1 bg-blue-500/60 z-[105] transition-all" style={{ left: SNAP_MARGIN }} />
          )}
          {snapZone === 'right' && (
            <div className="fixed top-0 bottom-0 w-1 bg-blue-500/60 z-[105] transition-all" style={{ right: SNAP_MARGIN }} />
          )}
          {snapZone === 'top' && (
            <div className="fixed left-0 right-0 h-1 bg-blue-500/60 z-[105] transition-all" style={{ top: SNAP_MARGIN }} />
          )}
          {snapZone === 'bottom' && (
            <div className="fixed left-0 right-0 h-1 bg-blue-500/60 z-[105] transition-all" style={{ bottom: SNAP_MARGIN }} />
          )}
        </>
      )}

      {/* Size preset hint badge */}
      {isResizing && sizePresetHint && (
        <div 
          className="fixed z-[115] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-lg animate-pulse"
          style={{
            left: position.x + size.width / 2,
            top: position.y + size.height + 8,
            transform: 'translateX(-50%)'
          }}
        >
          📐 Snap to {sizePresetHint.label} ({sizePresetHint.width}×{sizePresetHint.height})
        </div>
      )}

       {/* Semi-transparent backdrop */}
       <div 
          className="fixed inset-0 bg-black/30 z-[100]"
         onClick={onClose}
       />
       
       {/* Draggable Modal */}
       <div
         ref={modalRef}
         className={cn(
            "fixed z-[110] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden",
          isDragging && "cursor-grabbing select-none",
          isResizing && "cursor-se-resize select-none",
          snapZone && "transition-none"
         )}
         style={{
           left: position.x,
           top: position.y,
           width: size.width,
           height: size.height,
         }}
       >
         {/* Header - Draggable */}
         <div 
           className={cn(
            "flex items-center justify-between px-4 py-3 shrink-0",
            !isMaximized && "cursor-grab",
            isMaximized && "cursor-default",
             headerClassName
           )}
           style={headerStyle}
           onMouseDown={handleMouseDown}
         >
           <div className="flex items-center gap-2 flex-1">
             <GripHorizontal className="w-4 h-4 text-white/50 flex-shrink-0" />
             {title}
           </div>
           
          <div className="flex items-center gap-2 flex-shrink-0">
            {showMaximize && (
              <button
                onClick={handleMaximize}
                className="px-2 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 transition-all flex items-center gap-1.5 hover:scale-105"
                title={isMaximized ? "Restore Window" : "Maximize Window"}
              >
                {isMaximized ? (
                  <>
                    <Minimize2 className="w-4 h-4 text-white" />
                    <span className="text-xs font-medium text-white hidden sm:inline">Restore</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 text-white" />
                    <span className="text-xs font-medium text-white hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 border border-white/20 hover:border-red-400 transition-all hover:scale-105"
              title="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
         </div>
         
         {/* Content */}
         <div className="flex-1 overflow-hidden flex flex-col">
           {children}
         </div>
         
         {/* Footer */}
         {footer && (
           <div className="shrink-0">
             {footer}
           </div>
         )}
         
         {/* Resize Handle */}
        {!isMaximized && (
          <>
            {/* Corner resize handles with visible grip indicators */}
            {/* SE Corner */}
            <div
              className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize group/handle"
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            >
              <div className="absolute bottom-1 right-1 w-3 h-3 opacity-40 group-hover/handle:opacity-100 transition-opacity">
                <div className="absolute bottom-0 right-0 w-2 h-0.5 bg-muted-foreground group-hover/handle:bg-primary group-hover/handle:shadow-[0_0_6px_hsl(var(--primary))]" />
                <div className="absolute bottom-0 right-0 w-0.5 h-2 bg-muted-foreground group-hover/handle:bg-primary group-hover/handle:shadow-[0_0_6px_hsl(var(--primary))]" />
              </div>
            </div>
            
            {/* SW Corner */}
            <div
              className="absolute bottom-0 left-0 w-5 h-5 cursor-sw-resize group/handle"
              onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            >
              <div className="absolute bottom-1 left-1 w-3 h-3 opacity-40 group-hover/handle:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 w-2 h-0.5 bg-muted-foreground group-hover/handle:bg-primary group-hover/handle:shadow-[0_0_6px_hsl(var(--primary))]" />
                <div className="absolute bottom-0 left-0 w-0.5 h-2 bg-muted-foreground group-hover/handle:bg-primary group-hover/handle:shadow-[0_0_6px_hsl(var(--primary))]" />
              </div>
            </div>
            
            {/* NE Corner */}
            <div
              className="absolute top-0 right-0 w-5 h-5 cursor-ne-resize group/handle"
              onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            >
              <div className="absolute top-1 right-1 w-3 h-3 opacity-40 group-hover/handle:opacity-100 transition-opacity">
                <div className="absolute top-0 right-0 w-2 h-0.5 bg-muted-foreground group-hover/handle:bg-primary group-hover/handle:shadow-[0_0_6px_hsl(var(--primary))]" />
                <div className="absolute top-0 right-0 w-0.5 h-2 bg-muted-foreground group-hover/handle:bg-primary group-hover/handle:shadow-[0_0_6px_hsl(var(--primary))]" />
              </div>
            </div>
            
            {/* NW Corner */}
            <div
              className="absolute top-0 left-0 w-5 h-5 cursor-nw-resize group/handle"
              onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            >
              <div className="absolute top-1 left-1 w-3 h-3 opacity-40 group-hover/handle:opacity-100 transition-opacity">
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-muted-foreground group-hover/handle:bg-primary group-hover/handle:shadow-[0_0_6px_hsl(var(--primary))]" />
                <div className="absolute top-0 left-0 w-0.5 h-2 bg-muted-foreground group-hover/handle:bg-primary group-hover/handle:shadow-[0_0_6px_hsl(var(--primary))]" />
              </div>
            </div>
            
            {/* Edge resize handles */}
            {/* Top edge */}
            <div
              className="absolute top-0 left-5 right-5 h-2 cursor-n-resize group/handle"
              onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
            >
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-muted-foreground/20 group-hover/handle:bg-primary/60 transition-colors" />
            </div>
            
            {/* Bottom edge */}
            <div
              className="absolute bottom-0 left-5 right-5 h-2 cursor-s-resize group/handle"
              onMouseDown={(e) => handleResizeMouseDown(e, 's')}
            >
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-muted-foreground/20 group-hover/handle:bg-primary/60 transition-colors" />
            </div>
            
            {/* Left edge */}
            <div
              className="absolute left-0 top-5 bottom-5 w-2 cursor-w-resize group/handle"
              onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
            >
              <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-muted-foreground/20 group-hover/handle:bg-primary/60 transition-colors" />
            </div>
            
            {/* Right edge */}
            <div
              className="absolute right-0 top-5 bottom-5 w-2 cursor-e-resize group/handle"
              onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
            >
              <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-muted-foreground/20 group-hover/handle:bg-primary/60 transition-colors" />
            </div>
          </>
        )}
       </div>
     </>
   );
 }