import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Sparkles, Pencil, Plus, Check, ChevronDown, ChevronRight,
  LogOut, HelpCircle, Loader2, X, Trash2, Image as ImageIcon,
  Cpu, ShieldCheck, Headphones, AlertTriangle, Camera, Square, ArrowRight,
  Layers, Play, Zap, Pause, FolderPlus, Eye, EyeOff, Brain,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ============================================================
   TruMove AI Inventory Scanner — fullscreen page
   Route: /inventory/scan
============================================================ */

type ScanState = "pending" | "scanning" | "scanned" | "failed";
type RoomColor = "blue" | "purple" | "amber" | "coral" | "teal" | "gray" | "green" | "pink";

interface Photo {
  id: string;
  file: File;
  url: string;
  dataUrl?: string;
  roomId: string;            // "" if unsorted
  status: ScanState;
  width?: number;
  height?: number;
  fileSize: number;
  qualityFlag?: "low" | "ok";
  enhancedUrl?: string;
  detections: Detection[];
  error?: string;
}

interface Detection {
  id: string;
  itemName: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  cubicFeet: number;
  weight: number;
  photoId: string;
  roomId: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  cubicFeet: number;
  weight: number;
  roomId: string;
  sourcePhotoId: string;
  confidence: number;
  thumbnail?: string;
}

interface Room {
  id: string;
  name: string;
  color: RoomColor;
}

const COLOR_TINT: Record<RoomColor, string> = {
  blue: "#3b82f6",
  purple: "#a855f7",
  amber: "#f59e0b",
  coral: "#fb7185",
  teal: "#14b8a6",
  gray: "#9ca3af",
  green: "#22c55e",
  pink: "#ec4899",
};

const COLOR_ROTATION: RoomColor[] = ["blue", "purple", "amber", "coral", "teal", "gray", "green", "pink"];

const DEFAULT_ROOMS: Room[] = [
  { id: "living-room",  name: "Living Room",  color: "blue" },
  { id: "bedroom",      name: "Bedroom",      color: "purple" },
  { id: "kitchen",      name: "Kitchen",      color: "amber" },
  { id: "dining-room",  name: "Dining Room",  color: "coral" },
  { id: "office",       name: "Office",       color: "teal" },
  { id: "garage",       name: "Garage",       color: "gray" },
  { id: "bathroom",     name: "Bathroom",     color: "green" },
  { id: "other",        name: "Other",        color: "pink" },
];

const STEPS = ["Scan", "Review", "Get Quote"] as const;

const uid = () => Math.random().toString(36).slice(2, 10);

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getImageDims = (url: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });

const confidenceColor = (c: number) =>
  c >= 85 ? "#00ff88" : c >= 70 ? "#fbbf24" : "#ef4444";

/* ============================================================
   Top Bar
============================================================ */
function TopBar({ activeStep, onSaveExit }: { activeStep: number; onSaveExit: () => void }) {
  return (
    <header className="h-16 border-b border-white/[0.06] bg-black flex items-center px-6 flex-shrink-0">
      <div className="flex items-center gap-2 w-[200px]">
        <img src={logoImg} alt="TruMove" className="h-5 brightness-0 invert" />
        <span className="text-[11px] text-[#00ff88]/70 font-mono mt-0.5">™</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3">
          {STEPS.map((label, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={active ? { boxShadow: ["0 0 8px rgba(0,255,136,0.4)", "0 0 20px rgba(0,255,136,0.7)", "0 0 8px rgba(0,255,136,0.4)"] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300",
                      done && "bg-[#00ff88] text-black",
                      active && "bg-[#00ff88] text-black",
                      !done && !active && "border border-white/15 text-white/40"
                    )}
                  >
                    {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                  </motion.div>
                  <span className={cn(
                    "text-[10px] font-semibold tracking-[0.1em] uppercase",
                    (done || active) ? "text-[#00ff88]" : "text-white/40"
                  )}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-12 h-px bg-white/10 relative -mt-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-[#00ff88]"
                      initial={{ width: "0%" }}
                      animate={{ width: done ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-[200px] flex justify-end">
        <button
          onClick={onSaveExit}
          className="flex items-center gap-2 text-[12px] text-white/60 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Save & Exit
        </button>
      </div>
    </header>
  );
}

/* ============================================================
   Brackets
============================================================ */
function Brackets({ pulse }: { pulse?: boolean }) {
  const cls = cn(
    "absolute w-7 h-7 border-[#00ff88] pointer-events-none [filter:drop-shadow(0_0_6px_rgba(0,255,136,0.4))]",
    pulse && "animate-[pulse_2s_ease-in-out_infinite]"
  );
  return (
    <>
      <div className={cn(cls, "top-3 left-3 border-t-[3px] border-l-[3px] rounded-tl-sm")} />
      <div className={cn(cls, "top-3 right-3 border-t-[3px] border-r-[3px] rounded-tr-sm")} />
      <div className={cn(cls, "bottom-3 left-3 border-b-[3px] border-l-[3px] rounded-bl-sm")} />
      <div className={cn(cls, "bottom-3 right-3 border-b-[3px] border-r-[3px] rounded-br-sm")} />
    </>
  );
}

/* ============================================================
   Detection Boxes
============================================================ */
function DetectionBoxes({
  detections, highlightedId, onHover, onClick,
}: {
  detections: Detection[];
  highlightedId?: string | null;
  onHover: (id: string | null) => void;
  onClick: (d: Detection) => void;
}) {
  return (
    <>
      {detections.map((d, i) => {
        const color = confidenceColor(d.confidence);
        const highlighted = highlightedId === d.id;
        return (
          <motion.button
            key={d.id}
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => onHover(d.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(d)}
            className="absolute group cursor-pointer"
            style={{
              left: `${d.bbox.x * 100}%`,
              top: `${d.bbox.y * 100}%`,
              width: `${d.bbox.width * 100}%`,
              height: `${d.bbox.height * 100}%`,
              border: `${highlighted ? 3 : 2}px solid ${color}`,
              boxShadow: highlighted ? `0 0 16px ${color}80` : undefined,
              borderRadius: 4,
            }}
          >
            <div
              className="absolute -top-[22px] left-0 px-1.5 py-0.5 rounded-sm text-[10px] font-semibold whitespace-nowrap"
              style={{ background: color, color: "#000" }}
            >
              {d.itemName}
            </div>
          </motion.button>
        );
      })}
    </>
  );
}

/* ============================================================
   Scanner Canvas
============================================================ */
function ScannerCanvas({
  activePhoto, highlightedDetectionId, onHoverDetection, onClickDetection,
  onDrop, isScanning, activeRoomName, showBrackets,
}: {
  activePhoto: Photo | null;
  highlightedDetectionId: string | null;
  onHoverDetection: (id: string | null) => void;
  onClickDetection: (d: Detection) => void;
  onDrop: (files: File[]) => void;
  isScanning: boolean;
  activeRoomName: string;
  showBrackets: boolean;
}) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".heic", ".webp"] },
    multiple: true,
    noClick: !!activePhoto,
    noKeyboard: !!activePhoto,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative w-full overflow-hidden rounded-xl bg-[#0a0e1a] border transition-all",
        isDragActive ? "border-[#00ff88] shadow-[0_0_32px_rgba(0,255,136,0.25)]" : "border-white/[0.06]",
        !activePhoto && "cursor-pointer"
      )}
      style={{ aspectRatio: "16 / 10" }}
    >
      <input {...getInputProps()} />

      {!activePhoto && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <Brackets />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="mb-5 relative"
          >
            <div className="relative w-[72px] h-[72px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-[#00ff88]/15 blur-xl" />
              <Camera className="w-14 h-14 text-[#00ff88]" strokeWidth={1.25} />
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-[#00ff88]" fill="#00ff88" />
            </div>
          </motion.div>
          <h2 className="text-[22px] font-semibold text-white mb-1.5">
            {isDragActive ? "Drop to upload" : "Drop photos here"}
          </h2>
          <p className="text-[13px] text-white/50 mb-5">
            or click to browse — JPG, PNG, HEIC up to 20MB each
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); open(); }}
            className="h-11 w-[140px] rounded-md bg-[#00ff88] text-black font-semibold text-sm hover:bg-[#00ff88]/90 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all"
          >
            Browse files
          </button>
        </div>
      )}

      {activePhoto && (
        <>
          <img
            src={activePhoto.enhancedUrl || activePhoto.url}
            alt="Room"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {showBrackets && <Brackets pulse={isScanning} />}

          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-[#00ff88]" />
            <div className="text-[10px]">
              <div className="text-white/40 uppercase tracking-wider">Photo</div>
              <div className="text-white font-mono truncate max-w-[180px]">
                {activePhoto.file.name}
              </div>
            </div>
          </div>

          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-[#00ff88]/40 rounded-full pl-2.5 pr-3.5 py-1.5 flex items-center gap-2"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#00ff88]"
              />
              <span className="text-[11px] text-white font-semibold">Scanning...</span>
            </motion.div>
          )}

          {showBrackets && (
            <DetectionBoxes
              detections={activePhoto.detections}
              highlightedId={highlightedDetectionId}
              onHover={onHoverDetection}
              onClick={onClickDetection}
            />
          )}

          {!isScanning && activePhoto.detections.length === 0 && activePhoto.status !== "failed" && activePhoto.status !== "scanned" && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-white/10 rounded-md px-4 py-2.5 flex items-center gap-2.5 max-w-md">
              <Sparkles className="w-4 h-4 text-[#00ff88]" />
              <div className="text-[12px] text-white/80">
                Hit "Scan this room" below to detect items.
              </div>
            </div>
          )}

          {activePhoto.status === "failed" && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-950/80 backdrop-blur-sm border border-red-500/40 rounded-md px-4 py-2.5 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <div className="text-[12px] text-red-200">
                Scan failed. {activePhoto.error || "Try again."}
              </div>
            </div>
          )}
        </>
      )}

      {activePhoto && isDragActive && (
        <div className="absolute inset-0 bg-[#00ff88]/15 border-2 border-dashed border-[#00ff88] rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-white font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" /> Drop to add to {activeRoomName}
          </div>
        </div>
      )}
      {!activePhoto && isDragActive && (
        <div className="absolute inset-0 bg-[#00ff88]/15 flex items-center justify-center pointer-events-none">
          <div className="text-white font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" /> Drop to add to {activeRoomName}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Photo Strip (now ABOVE canvas)
============================================================ */
function PhotoStrip({
  photos, activeId, editMode, showRoomLabels, rooms,
  onSelect, onDelete, onAdd, onPhotoDragStart,
}: {
  photos: Photo[];
  activeId: string | null;
  editMode: boolean;
  showRoomLabels: boolean;
  rooms: Room[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onPhotoDragStart: (photoId: string) => void;
}) {
  const grouped = useMemo(() => {
    if (!showRoomLabels) return [{ room: null as Room | null, photos }];
    const map = new Map<string, Photo[]>();
    for (const p of photos) {
      const list = map.get(p.roomId) || [];
      list.push(p);
      map.set(p.roomId, list);
    }
    return Array.from(map.entries()).map(([roomId, ps]) => ({
      room: rooms.find((r) => r.id === roomId) || null,
      photos: ps,
    }));
  }, [photos, showRoomLabels, rooms]);

  const renderThumb = (p: Photo) => {
    const dotColor =
      p.status === "scanned" ? "bg-[#00ff88]"
      : p.status === "scanning" ? "bg-amber-400 animate-pulse"
      : p.status === "failed" ? "bg-red-500"
      : "bg-white/30";
    const active = p.id === activeId;
    return (
      <motion.div
        key={p.id}
        animate={editMode ? { rotate: [-1, 1, -1] } : { rotate: 0 }}
        transition={editMode ? { duration: 0.3, repeat: Infinity } : {}}
        className="relative flex-shrink-0"
        draggable={editMode}
        onDragStart={() => onPhotoDragStart(p.id)}
      >
        <button
          onClick={() => onSelect(p.id)}
          className={cn(
            "w-[64px] h-[64px] rounded-md overflow-hidden border-2 transition-all relative",
            active ? "border-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.4)]" : "border-white/10 hover:border-white/30"
          )}
        >
          <img src={p.url} alt="" className="w-full h-full object-cover" />
          <span className={cn("absolute bottom-1 right-1 w-2 h-2 rounded-full ring-2 ring-black", dotColor)} />
        </button>
        {editMode && (
          <button
            onClick={() => onDelete(p.id)}
            className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600"
            aria-label="Delete photo"
          >
            <X className="w-3 h-3" strokeWidth={3} />
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin items-end">
      {grouped.map((g, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          {showRoomLabels && g.room && (
            <div className="flex items-center gap-1.5 px-1">
              <span className="w-2 h-2 rounded-sm" style={{ background: COLOR_TINT[g.room.color] }} />
              <span className="text-[9px] text-white/40 uppercase tracking-wider font-semibold">{g.room.name}</span>
            </div>
          )}
          <div className="flex gap-2">
            {g.photos.map(renderThumb)}
          </div>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="w-[64px] h-[64px] rounded-md border-2 border-dashed border-white/15 hover:border-[#00ff88]/60 hover:bg-[#00ff88]/5 flex items-center justify-center text-white/40 hover:text-[#00ff88] transition-colors flex-shrink-0"
        aria-label="Add photos"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ============================================================
   Action Toolbar (3 round buttons only)
============================================================ */
function ActionToolbar({
  onUpload, onEnhance, editMode, onToggleEdit, hasActivePhoto,
  showBrackets, onToggleBrackets,
}: {
  onUpload: () => void;
  onEnhance: () => void;
  editMode: boolean;
  onToggleEdit: () => void;
  hasActivePhoto: boolean;
  showBrackets: boolean;
  onToggleBrackets: () => void;
}) {
  const RoundBtn = ({ icon: Icon, onClick, active, disabled, label }:
    { icon: any; onClick: () => void; active?: boolean; disabled?: boolean; label: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={cn(
              "w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-150",
              active
                ? "border-[#00ff88] bg-[#00ff88] text-black shadow-[0_0_12px_rgba(0,255,136,0.35)]"
                : "border-white/10 bg-[#111827] text-white/70 hover:border-[#00ff88] hover:text-white hover:scale-[1.05]",
              disabled && "opacity-30 cursor-not-allowed hover:scale-100 hover:border-white/10"
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex items-center gap-2">
      <RoundBtn icon={Upload} onClick={onUpload} label="Upload photos" />
      <RoundBtn icon={Sparkles} onClick={onEnhance} disabled={!hasActivePhoto} label="Enhance current photo" />
      <RoundBtn icon={Trash2} onClick={onToggleEdit} active={editMode} disabled={!hasActivePhoto} label="Edit / delete photos" />
      <RoundBtn icon={showBrackets ? Eye : EyeOff} onClick={onToggleBrackets} active={!showBrackets} disabled={!hasActivePhoto} label={showBrackets ? "Hide detection brackets" : "Show detection brackets"} />
    </div>
  );
}

/* ============================================================
   Scan Controls
============================================================ */
type ScanProgress = { current: number; total: number };

function ScanControls({
  scanState, scanProgress, canScanRoom, canScanAll, activeRoomName,
  onScanRoom, onScanAll, onCancel,
}: {
  scanState: "idle" | "scanning";
  scanProgress: ScanProgress;
  canScanRoom: boolean;
  canScanAll: boolean;
  activeRoomName: string;
  onScanRoom: () => void;
  onScanAll: () => void;
  onCancel: () => void;
}) {
  if (scanState === "scanning") {
    const pct = scanProgress.total > 0 ? Math.round((scanProgress.current / scanProgress.total) * 100) : 0;
    return (
      <div className="rounded-md border border-[#00ff88]/30 bg-[#00ff88]/[0.04] p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[12px] font-semibold text-white">
            Scanning {scanProgress.current} of {scanProgress.total} photos…
          </div>
          <button
            onClick={onCancel}
            className="text-[11px] text-white/60 hover:text-white flex items-center gap-1"
          >
            <Pause className="w-3 h-3" /> Cancel
          </button>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-[#00ff88]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={onScanRoom}
        disabled={!canScanRoom}
        className={cn(
          "h-11 rounded-md font-semibold text-[13px] flex items-center justify-center gap-2 transition-all",
          canScanRoom
            ? "bg-[#00ff88] text-black hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]"
            : "bg-white/5 text-white/30 cursor-not-allowed"
        )}
      >
        <Play className="w-3.5 h-3.5" fill="currentColor" />
        Scan {activeRoomName}
      </button>
      <button
        onClick={onScanAll}
        disabled={!canScanAll}
        className={cn(
          "h-11 rounded-md font-semibold text-[13px] flex items-center justify-center gap-2 border transition-all",
          canScanAll
            ? "border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/10"
            : "border-white/10 text-white/30 cursor-not-allowed"
        )}
      >
        <Zap className="w-3.5 h-3.5" />
        Scan all rooms
      </button>
    </div>
  );
}

/* ============================================================
   Room Sidebar
============================================================ */
function RoomSidebar({
  rooms, activeRoomId, photos, items, totalWeight,
  onRoomSelect, onRoomCreate, onPhotoMove,
}: {
  rooms: Room[];
  activeRoomId: string;        // "" means "all"
  photos: Photo[];
  items: InventoryItem[];
  totalWeight: number;
  onRoomSelect: (id: string) => void;
  onRoomCreate: (name: string) => void;
  onPhotoMove: (photoId: string, toRoomId: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const photoCountFor = (roomId: string) => photos.filter((p) => p.roomId === roomId).length;
  const roomsWithContent = rooms.filter((r) => photoCountFor(r.id) > 0).length;

  const handleDropOnRoom = (e: React.DragEvent, roomId: string) => {
    e.preventDefault();
    setDragOverId(null);
    // Files from desktop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Forward through onRoomCreate? No — handled by parent via different mechanism. Keep room-targeted file drop simple: switch room then defer to parent.
      // Use a custom event on window for parent to consume
      const files = Array.from(e.dataTransfer.files);
      window.dispatchEvent(new CustomEvent("room-file-drop", { detail: { roomId, files } }));
      return;
    }
    // Photo reassignment
    const photoId = e.dataTransfer.getData("text/photo-id");
    if (photoId) onPhotoMove(photoId, roomId);
  };

  const Row = ({
    id, name, color, count, isAll,
  }: { id: string; name: string; color?: RoomColor; count: number; isAll?: boolean }) => {
    const active = activeRoomId === id;
    const dragOver = dragOverId === id;
    return (
      <button
        onClick={() => onRoomSelect(id)}
        onDragOver={(e) => { e.preventDefault(); setDragOverId(id); }}
        onDragLeave={() => setDragOverId(null)}
        onDrop={(e) => handleDropOnRoom(e, id)}
        className={cn(
          "w-full h-11 px-3 flex items-center gap-2.5 rounded-md transition-all text-left relative border-l-2",
          active
            ? "bg-[#00ff88]/[0.08] border-[#00ff88] text-[#00ff88]"
            : "border-transparent text-white/80 hover:bg-white/[0.04]",
          dragOver && "ring-2 ring-[#00ff88] scale-[1.02] bg-[#00ff88]/10"
        )}
      >
        {isAll ? (
          <Layers className="w-4 h-4 flex-shrink-0" />
        ) : (
          <span
            className="w-4 h-4 rounded-sm flex-shrink-0"
            style={{ background: color ? `${COLOR_TINT[color]}40` : undefined, border: color ? `1px solid ${COLOR_TINT[color]}` : undefined }}
          />
        )}
        <span className="text-[13px] flex-1 truncate font-medium">{name}</span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded min-w-[22px] text-center",
            count > 0 ? "bg-white/5 text-[#00ff88]" : "bg-white/5 text-white/30"
          )}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <aside className="w-[260px] flex-shrink-0 bg-[#070b14] border-r border-white/[0.06] flex flex-col h-full overflow-hidden">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2 px-1">Rooms</div>

        <div className="space-y-0.5 mb-3">
          <Row id="" name="All" count={photos.length} isAll />
        </div>

        <div className="h-px bg-white/[0.06] mb-3" />

        <div className="space-y-0.5">
          {rooms.map((r) => (
            <Row key={r.id} id={r.id} name={r.name} color={r.color} count={photoCountFor(r.id)} />
          ))}
        </div>

        {adding ? (
          <div className="mt-3">
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) {
                  onRoomCreate(newName.trim());
                  setNewName("");
                  setAdding(false);
                }
                if (e.key === "Escape") { setAdding(false); setNewName(""); }
              }}
              onBlur={() => { setAdding(false); setNewName(""); }}
              placeholder="Room name"
              className="h-9 bg-[#111827] border-white/10 text-white text-[13px]"
            />
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-3 w-full h-10 rounded-md border border-dashed border-white/15 hover:border-[#00ff88]/50 hover:text-[#00ff88] text-white/50 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Add Room
          </button>
        )}
      </div>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em] mb-2 px-1">Summary</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-white/50">Total items</span>
            <span className="text-white font-semibold tabular-nums">{items.reduce((s, i) => s + i.quantity, 0)}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-white/50">Active rooms</span>
            <span className="text-white/70 tabular-nums">{roomsWithContent}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-white/50">Total weight</span>
            <span className="text-white font-semibold tabular-nums">
              {Math.round(totalWeight).toLocaleString()} <span className="text-white/40 font-normal">lbs</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ============================================================
   Trust Strip (with dividers)
============================================================ */
function ScannerTrustStrip() {
  const items = [
    { icon: Cpu, title: "AI-Powered Detection", body: "Our AI identifies and counts your items automatically." },
    { icon: ShieldCheck, title: "100% Private & Secure", body: "Your photos and data are never shared or stored." },
    { icon: Headphones, title: "Need Help?", body: "Our moving experts are here to help you 24/7." },
  ];
  return (
    <div className="grid grid-cols-3 gap-0 rounded-lg border border-white/[0.06] bg-[#0a0e1a] overflow-hidden divide-x divide-white/[0.06]">
      {items.map((it) => (
        <div key={it.title} className="px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center flex-shrink-0">
            <it.icon className="w-4 h-4 text-[#00ff88]" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-white">{it.title}</div>
            <div className="text-[11px] text-white/50 leading-snug mt-0.5">{it.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Inventory Panel
============================================================ */
function InventoryPanel({
  rooms, items, scanning, hasAnyScan, highlightedItemId,
  onItemHover, onItemClick, onEditItem, onAddItem, onContinue,
  collapsedRooms, toggleRoom,
}: {
  rooms: Room[];
  items: InventoryItem[];
  scanning: boolean;
  hasAnyScan: boolean;
  highlightedItemId: string | null;
  onItemHover: (id: string | null) => void;
  onItemClick: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onAddItem: () => void;
  onContinue: () => void;
  collapsedRooms: Set<string>;
  toggleRoom: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    for (const item of items) {
      const list = map.get(item.roomId) || [];
      list.push(item);
      map.set(item.roomId, list);
    }
    return map;
  }, [items]);

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const isEmpty = items.length === 0;
  const canContinue = totalCount > 0;

  return (
    <aside className="w-[380px] flex-shrink-0 bg-[#0a0e1a] border-l border-white/[0.06] flex flex-col h-full">
      {!isEmpty && (
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            {scanning ? (
              <Loader2 className="w-3.5 h-3.5 text-[#00ff88] animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 text-[#00ff88]" strokeWidth={3} />
            )}
            <div className="text-[14px] font-semibold text-white">Detected Items</div>
          </div>
          <div className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full bg-[#00ff88]/15 text-[#00ff88]">
            {totalCount}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center px-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center mb-4">
              <ImageIcon className="w-5 h-5 text-[#00ff88]" />
            </div>
            <div className="text-[14px] text-white font-semibold mb-1">No items yet</div>
            <div className="text-[12px] text-white/50 mb-6 max-w-[240px]">
              Organize photos by room, then scan to detect items automatically.
            </div>
            <ol className="text-left space-y-2.5 w-full max-w-[240px]">
              {[
                "Pick a room from the left",
                "Drop photos into the canvas",
                "Hit Scan this room",
              ].map((line, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[12px] text-white/70">{line}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="py-2">
            {rooms.map((room) => {
              const roomItems = grouped.get(room.id) || [];
              if (roomItems.length === 0) return null;
              const collapsed = collapsedRooms.has(room.id);
              const roomCount = roomItems.reduce((s, i) => s + i.quantity, 0);
              return (
                <div key={room.id} className="mb-1">
                  <button
                    onClick={() => toggleRoom(room.id)}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/[0.03] transition-colors"
                  >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-white/40" /> : <ChevronDown className="w-3.5 h-3.5 text-white/40" />}
                    <span className="w-2 h-2 rounded-sm" style={{ background: COLOR_TINT[room.color] }} />
                    <span className="text-[13px] font-medium text-white flex-1 text-left">{room.name}</span>
                    <span className="text-[11px] tabular-nums px-1.5 py-0.5 rounded bg-white/5 text-[#00ff88] font-semibold">{roomCount}</span>
                  </button>

                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        {roomItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25 }}
                            onMouseEnter={() => onItemHover(item.id)}
                            onMouseLeave={() => onItemHover(null)}
                            className={cn(
                              "group flex items-center gap-2.5 px-4 py-1.5 cursor-pointer transition-colors",
                              highlightedItemId === item.id ? "bg-[#00ff88]/[0.08]" : "hover:bg-white/[0.03]"
                            )}
                            onClick={() => onItemClick(item)}
                          >
                            <div className="w-8 h-8 rounded-md bg-[#111827] border border-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-white/30" />
                              )}
                            </div>
                            <div className="text-[13px] text-white flex-1 min-w-0 truncate">{item.name}</div>
                            <div className="text-[13px] tabular-nums text-[#00ff88] font-semibold w-6 text-right">{item.quantity}</div>
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditItem(item); }}
                              className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Edit item"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/[0.06] space-y-2 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAddItem}
            disabled={isEmpty}
            className={cn(
              "h-9 rounded-md border bg-transparent text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors",
              isEmpty
                ? "border-white/5 text-white/20 cursor-not-allowed"
                : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
            )}
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
          <button
            disabled={isEmpty}
            className={cn(
              "h-9 rounded-md border bg-transparent text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors",
              isEmpty
                ? "border-white/5 text-white/20 cursor-not-allowed"
                : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
            )}
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Room
          </button>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={canContinue ? onContinue : undefined}
                disabled={!canContinue}
                className={cn(
                  "w-full h-[52px] rounded-md font-semibold text-[14px] flex items-center justify-center gap-2 transition-all",
                  canContinue
                    ? "bg-[#00ff88] text-black hover:shadow-[0_0_24px_rgba(0,255,136,0.5)]"
                    : "bg-white/[0.04] text-white/25 cursor-not-allowed"
                )}
              >
                Looks Good, Continue <ArrowRight className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            {!canContinue && (
              <TooltipContent>Complete a scan first</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}

/* ============================================================
   Item Edit Drawer
============================================================ */
function ItemEditDrawer({
  item, rooms, open, onClose, onSave, onDelete,
}: {
  item: InventoryItem | null;
  rooms: Room[];
  open: boolean;
  onClose: () => void;
  onSave: (patch: Partial<InventoryItem>) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQty(item.quantity);
      setRoomId(item.roomId);
    }
  }, [item]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="bg-[#0a0e1a] border-white/10 text-white w-[360px]">
        <SheetHeader>
          <SheetTitle className="text-white">Edit item</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-white/60 text-[11px] uppercase tracking-wider">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-[#111827] border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/60 text-[11px] uppercase tracking-wider">Quantity</Label>
            <Input
              type="number" min={1} value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-[#111827] border-white/10 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-white/60 text-[11px] uppercase tracking-wider">Room</Label>
            <select
              value={roomId} onChange={(e) => setRoomId(e.target.value)}
              className="w-full mt-1 h-10 rounded-md bg-[#111827] border border-white/10 text-white px-3 text-sm"
            >
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { onSave({ name, quantity: qty, roomId }); onClose(); }}
              className="flex-1 h-10 rounded-md bg-[#00ff88] text-black font-semibold text-sm hover:shadow-[0_0_16px_rgba(0,255,136,0.4)]"
            >
              Save
            </button>
            <button
              onClick={() => { onDelete(); onClose(); }}
              className="h-10 px-3 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ============================================================
   How it works drawer
============================================================ */
function HowItWorksDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="bg-[#0a0e1a] border-white/10 text-white w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-white">How it works</SheetTitle>
        </SheetHeader>
        <ol className="mt-6 space-y-4 text-sm text-white/70">
          {[
            "Pick a room from the left sidebar.",
            "Drop photos into the canvas (or directly onto a room folder).",
            "Hit Scan this room — or Scan all rooms when you're done organizing.",
            "Review detected items in the right panel and tweak as needed.",
            "Continue to get your instant moving estimate.",
          ].map((line, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[#00ff88]/15 text-[#00ff88] text-[12px] font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  );
}

/* ============================================================
   Confirm Scan All Dialog
============================================================ */
function ScanAllConfirmDialog({
  open, onClose, onConfirm, photoCount, roomCount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  photoCount: number;
  roomCount: number;
}) {
  const estMinutes = Math.max(1, Math.round((photoCount * 8) / 60));
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-[#0a0e1a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Scan all rooms?</DialogTitle>
          <DialogDescription className="text-white/60">
            We'll process {photoCount} photo{photoCount === 1 ? "" : "s"} across {roomCount} room{roomCount === 1 ? "" : "s"}. Estimated ~{estMinutes} minute{estMinutes === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-md border border-white/10 text-white/70 text-sm hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-10 px-4 rounded-md bg-[#00ff88] text-black font-semibold text-sm hover:shadow-[0_0_16px_rgba(0,255,136,0.4)]"
          >
            Start scanning
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default function InventoryScan() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>(DEFAULT_ROOMS[0].id); // "" = All
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [collapsedRooms, setCollapsedRooms] = useState<Set<string>>(new Set());
  const [howOpen, setHowOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [highlightedDetectionId, setHighlightedDetectionId] = useState<string | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  const [scanState, setScanState] = useState<"idle" | "scanning">("idle");
  const [scanProgress, setScanProgress] = useState<ScanProgress>({ current: 0, total: 0 });
  const cancelScanRef = useRef(false);
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = "Inventory Scanner | TruMove"; }, []);

  // Photos visible in current view
  const visiblePhotos = useMemo(
    () => activeRoomId === "" ? photos : photos.filter((p) => p.roomId === activeRoomId),
    [photos, activeRoomId]
  );

  const activePhoto = useMemo(() => {
    return photos.find((p) => p.id === activePhotoId) || null;
  }, [photos, activePhotoId]);

  // Auto-pick first visible photo when switching rooms
  useEffect(() => {
    if (visiblePhotos.length === 0) {
      setActivePhotoId(null);
    } else if (!visiblePhotos.find((p) => p.id === activePhotoId)) {
      setActivePhotoId(visiblePhotos[0].id);
    }
  }, [visiblePhotos, activePhotoId]);

  const isScanning = scanState === "scanning" || activePhoto?.status === "scanning";

  /* ---------- file intake (uses currently active room) ---------- */
  const handleFiles = useCallback(async (files: File[], targetRoomId?: string) => {
    if (files.length === 0) return;
    const roomId = targetRoomId ?? (activeRoomId || rooms[0].id);

    const newPhotos: Photo[] = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const dims = await getImageDims(url);
      const lowQuality = dims.width < 1024 || dims.height < 768 || file.size < 100 * 1024;
      newPhotos.push({
        id: uid(),
        file,
        url,
        roomId,
        status: "pending",
        width: dims.width,
        height: dims.height,
        fileSize: file.size,
        qualityFlag: lowQuality ? "low" : "ok",
        detections: [],
      });
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (!activePhotoId && newPhotos[0]) setActivePhotoId(newPhotos[0].id);
    if (targetRoomId && targetRoomId !== activeRoomId) {
      setActiveRoomId(targetRoomId);
    }
  }, [activeRoomId, rooms, activePhotoId]);

  // Listen for room-targeted file drops from sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const { roomId, files } = (e as CustomEvent).detail;
      handleFiles(files, roomId);
    };
    window.addEventListener("room-file-drop", handler);
    return () => window.removeEventListener("room-file-drop", handler);
  }, [handleFiles]);

  /* ---------- AI scan (single photo) ---------- */
  const scanPhoto = async (photo: Photo): Promise<void> => {
    setActivePhotoId(photo.id);
    setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, status: "scanning" } : p));
    try {
      const dataUrl = await fileToDataUrl(photo.file);
      const room = rooms.find((r) => r.id === photo.roomId);
      const { data, error } = await supabase.functions.invoke("detect-inventory", {
        body: { imageUrl: dataUrl, roomHint: room?.name },
      });
      if (error) throw error;
      const rawItems: any[] = data?.items || [];

      const detections: Detection[] = rawItems.map((it) => ({
        id: uid(),
        itemName: it.name,
        confidence: it.confidence ?? 80,
        bbox: it.box || { x: 0, y: 0, width: 0, height: 0 },
        cubicFeet: it.cubicFeet || 5,
        weight: it.weight || 35,
        photoId: photo.id,
        roomId: photo.roomId,
      }));

      setPhotos((prev) => prev.map((p) =>
        p.id === photo.id ? { ...p, status: "scanned", detections, dataUrl } : p
      ));

      const newItems: InventoryItem[] = rawItems.map((it) => ({
        id: uid(),
        name: it.name,
        quantity: Math.max(1, Math.round(it.quantity || 1)),
        cubicFeet: it.cubicFeet || 5,
        weight: it.weight || 35,
        roomId: photo.roomId,
        sourcePhotoId: photo.id,
        confidence: it.confidence ?? 80,
      }));
      setItems((prev) => [...prev, ...newItems]);
    } catch (err: any) {
      console.error("scan failed", err);
      const msg = err?.message?.includes("429") ? "Rate limited. Wait a moment and try again."
        : err?.message?.includes("402") ? "AI credits required."
        : "Detection failed.";
      setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, status: "failed", error: msg } : p));
      toast({ title: "Scan failed", description: msg, variant: "destructive" });
    }
  };

  /* ---------- batch scan ---------- */
  const runBatch = async (toScan: Photo[]) => {
    if (toScan.length === 0) {
      toast({ title: "Nothing to scan", description: "Upload photos first." });
      return;
    }
    cancelScanRef.current = false;
    setScanState("scanning");
    setScanProgress({ current: 0, total: toScan.length });
    for (let i = 0; i < toScan.length; i++) {
      if (cancelScanRef.current) break;
      setScanProgress({ current: i + 1, total: toScan.length });
      await scanPhoto(toScan[i]);
    }
    setScanState("idle");
    setScanProgress({ current: 0, total: 0 });
  };

  const scanThisRoom = () => {
    const target = photos.filter((p) => p.roomId === activeRoomId && p.status !== "scanned" && p.status !== "scanning");
    runBatch(target);
  };

  const scanAllRooms = () => {
    const target = photos.filter((p) => p.status !== "scanned" && p.status !== "scanning");
    runBatch(target);
    setConfirmAllOpen(false);
  };

  const cancelScan = () => { cancelScanRef.current = true; };

  /* ---------- enhance ---------- */
  const enhanceActive = async () => {
    if (!activePhoto) return;
    toast({ title: "Enhancing photo...", description: "This may take a few seconds." });
    try {
      const dataUrl = activePhoto.dataUrl || (await fileToDataUrl(activePhoto.file));
      const { data, error } = await supabase.functions.invoke("enhance-image", { body: { imageUrl: dataUrl } });
      if (error) throw error;
      const enhancedUrl = data?.enhancedUrl;
      if (!enhancedUrl) throw new Error("No enhanced image returned");
      setPhotos((prev) => prev.map((p) => p.id === activePhoto.id ? { ...p, enhancedUrl, qualityFlag: "ok", detections: [] } : p));
      setItems((prev) => prev.filter((i) => i.sourcePhotoId !== activePhoto.id));
      await scanPhoto({ ...activePhoto, enhancedUrl });
      toast({ title: "Photo enhanced", description: "Re-scanning with improved quality." });
    } catch (err: any) {
      toast({ title: "Enhancement failed", description: err?.message || "Try again.", variant: "destructive" });
    }
  };

  const deletePhoto = (id: string) => {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activePhotoId === id) setActivePhotoId(next[0]?.id || null);
      return next;
    });
    setItems((prev) => prev.filter((i) => i.sourcePhotoId !== id));
  };

  const movePhotoToRoom = (photoId: string, toRoomId: string) => {
    setPhotos((prev) => prev.map((p) => p.id === photoId ? { ...p, roomId: toRoomId } : p));
    setItems((prev) => prev.map((i) => i.sourcePhotoId === photoId ? { ...i, roomId: toRoomId } : i));
    toast({ title: "Photo moved", description: `Reassigned to ${rooms.find((r) => r.id === toRoomId)?.name || "room"}` });
  };

  const createRoom = (name: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + uid().slice(0, 4);
    const usedColors = new Set(rooms.map((r) => r.color));
    const color = COLOR_ROTATION.find((c) => !usedColors.has(c)) || "blue";
    const newRoom: Room = { id, name, color };
    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(id);
  };

  const toggleRoom = (id: string) => {
    setCollapsedRooms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleItemClick = (item: InventoryItem) => {
    if (item.sourcePhotoId !== activePhotoId) setActivePhotoId(item.sourcePhotoId);
    const photo = photos.find((p) => p.id === item.sourcePhotoId);
    const det = photo?.detections.find((d) => d.itemName === item.name);
    if (det) setHighlightedDetectionId(det.id);
    setTimeout(() => setHighlightedDetectionId(null), 1800);
  };

  const handleDetectionClick = (d: Detection) => {
    const item = items.find((i) => i.sourcePhotoId === d.photoId && i.name === d.itemName);
    if (item) setEditingItem(item);
  };

  const handleDetectionHover = (id: string | null) => {
    setHighlightedDetectionId(id);
    if (id) {
      const photo = photos.find((p) => p.id === activePhotoId);
      const det = photo?.detections.find((d) => d.id === id);
      const matchedItem = items.find((i) => i.sourcePhotoId === det?.photoId && i.name === det?.itemName);
      setHighlightedItemId(matchedItem?.id || null);
    } else setHighlightedItemId(null);
  };

  const handleItemHover = (id: string | null) => {
    setHighlightedItemId(id);
    if (id) {
      const item = items.find((i) => i.id === id);
      if (item && item.sourcePhotoId === activePhotoId) {
        const photo = photos.find((p) => p.id === activePhotoId);
        const det = photo?.detections.find((d) => d.itemName === item.name);
        setHighlightedDetectionId(det?.id || null);
      }
    } else setHighlightedDetectionId(null);
  };

  const updateItem = (id: string, patch: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));
  };
  const deleteItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const totalWeight = items.reduce((s, i) => s + i.weight * i.quantity, 0);

  const continueToReview = () => {
    if (totalCount === 0) {
      toast({ title: "Add some items first", description: "Upload at least one photo to scan.", variant: "destructive" });
      return;
    }
    try { sessionStorage.setItem("trumove.scannedInventory", JSON.stringify(items)); } catch {}
    navigate("/online-estimate");
  };

  // Derived: scan eligibility
  const activeRoomName = activeRoomId === "" ? "all" : (rooms.find((r) => r.id === activeRoomId)?.name || "room");
  const photosInActiveRoom = photos.filter((p) => p.roomId === activeRoomId);
  const unscannedInActiveRoom = photosInActiveRoom.filter((p) => p.status !== "scanned" && p.status !== "scanning");
  const unscannedAll = photos.filter((p) => p.status !== "scanned" && p.status !== "scanning");
  const canScanRoom = activeRoomId !== "" && unscannedInActiveRoom.length > 0 && scanState === "idle";
  const canScanAll = unscannedAll.length > 0 && scanState === "idle";

  // Photo drag (for reassignment)
  const draggedPhotoIdRef = useRef<string | null>(null);
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      if (!draggedPhotoIdRef.current) return;
      e.dataTransfer?.setData("text/photo-id", draggedPhotoIdRef.current);
    };
    document.addEventListener("dragstart", handleDragStart);
    return () => document.removeEventListener("dragstart", handleDragStart);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key) - 1;
        if (rooms[idx]) setActiveRoomId(rooms[idx].id);
      } else if (e.key === "0") {
        setActiveRoomId("");
      } else if (e.key.toLowerCase() === "u") {
        fileInputRef.current?.click();
      } else if (e.key.toLowerCase() === "s" && e.shiftKey) {
        if (canScanAll) setConfirmAllOpen(true);
      } else if (e.key.toLowerCase() === "s") {
        if (canScanRoom) scanThisRoom();
      } else if (e.key.toLowerCase() === "e") {
        setEditMode((v) => !v);
      } else if (e.key === "Escape") {
        setEditMode(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, canScanRoom, canScanAll]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <TopBar activeStep={0} onSaveExit={() => navigate("/")} />

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT: Room sidebar */}
        <RoomSidebar
          rooms={rooms}
          activeRoomId={activeRoomId}
          photos={photos}
          items={items}
          totalWeight={totalWeight}
          onRoomSelect={setActiveRoomId}
          onRoomCreate={createRoom}
          onPhotoMove={movePhotoToRoom}
        />

        {/* CENTER: Scanner stage */}
        <section className="flex-1 min-w-0 flex flex-col p-6 gap-4 overflow-y-auto">
          <div>
            <h1 className="text-[26px] font-semibold leading-tight">
              Inventory <span className="text-[#00ff88]">Scanner</span>
            </h1>
            <p className="text-sm text-white/50 mt-1">
              {activeRoomId === ""
                ? "Showing all rooms — pick a folder to focus."
                : `Active room: ${activeRoomName}. Upload, organize, scan.`}
            </p>
          </div>

          {activePhoto?.qualityFlag === "low" && !activePhoto.enhancedUrl && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-amber-500/10 border border-amber-500/40 px-4 py-2.5 flex items-center gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="text-[12px] text-amber-100 flex-1">
                This photo is {activePhoto.width}×{activePhoto.height}. We recommend at least 1024×768.
              </div>
              <button
                onClick={enhanceActive}
                className="text-[12px] font-semibold text-black bg-[#00ff88] px-3 py-1 rounded hover:shadow-[0_0_12px_rgba(0,255,136,0.4)]"
              >
                Enhance with AI
              </button>
              <button
                onClick={() => setPhotos((prev) => prev.map((p) => p.id === activePhoto.id ? { ...p, qualityFlag: "ok" } : p))}
                className="text-[12px] text-amber-200/80 hover:text-white"
              >
                Use anyway
              </button>
            </motion.div>
          )}

          {/* Photo strip ABOVE canvas */}
          {visiblePhotos.length > 0 && (
            <PhotoStrip
              photos={visiblePhotos}
              activeId={activePhotoId}
              editMode={editMode}
              showRoomLabels={activeRoomId === ""}
              rooms={rooms}
              onSelect={setActivePhotoId}
              onDelete={deletePhoto}
              onAdd={() => fileInputRef.current?.click()}
              onPhotoDragStart={(id) => { draggedPhotoIdRef.current = id; }}
            />
          )}

          {/* Canvas */}
          <ScannerCanvas
            activePhoto={activePhoto}
            highlightedDetectionId={highlightedDetectionId}
            onHoverDetection={handleDetectionHover}
            onClickDetection={handleDetectionClick}
            onDrop={(files) => handleFiles(files)}
            isScanning={isScanning}
            onHelp={() => setHowOpen(true)}
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length) handleFiles(files);
              e.target.value = "";
            }}
          />

          {/* Action toolbar + Scan controls */}
          <div className="space-y-3">
            <ActionToolbar
              onUpload={() => fileInputRef.current?.click()}
              onEnhance={enhanceActive}
              editMode={editMode}
              onToggleEdit={() => setEditMode((v) => !v)}
              hasActivePhoto={!!activePhoto}
            />
            <ScanControls
              scanState={scanState}
              scanProgress={scanProgress}
              canScanRoom={canScanRoom}
              canScanAll={canScanAll}
              activeRoomName={activeRoomId === "" ? "this room" : `this ${activeRoomName}`}
              onScanRoom={scanThisRoom}
              onScanAll={() => setConfirmAllOpen(true)}
              onCancel={cancelScan}
            />
          </div>

          <div className="mt-auto pt-2">
            <ScannerTrustStrip />
          </div>
        </section>

        {/* RIGHT: Inventory panel */}
        <InventoryPanel
          rooms={rooms}
          items={items}
          scanning={isScanning}
          hasAnyScan={photos.some((p) => p.status === "scanned")}
          highlightedItemId={highlightedItemId}
          onItemHover={handleItemHover}
          onItemClick={handleItemClick}
          onEditItem={setEditingItem}
          onAddItem={() => {
            const room = rooms.find((r) => r.id === activeRoomId) || rooms[0];
            const newItem: InventoryItem = {
              id: uid(), name: "Custom item", quantity: 1, cubicFeet: 5, weight: 35,
              roomId: room.id, sourcePhotoId: "", confidence: 100,
            };
            setItems((prev) => [...prev, newItem]);
            setEditingItem(newItem);
          }}
          onContinue={continueToReview}
          collapsedRooms={collapsedRooms}
          toggleRoom={toggleRoom}
        />
      </main>

      <ItemEditDrawer
        item={editingItem}
        rooms={rooms}
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(patch) => editingItem && updateItem(editingItem.id, patch)}
        onDelete={() => editingItem && deleteItem(editingItem.id)}
      />

      <HowItWorksDrawer open={howOpen} onClose={() => setHowOpen(false)} />

      <ScanAllConfirmDialog
        open={confirmAllOpen}
        onClose={() => setConfirmAllOpen(false)}
        onConfirm={scanAllRooms}
        photoCount={unscannedAll.length}
        roomCount={new Set(unscannedAll.map((p) => p.roomId)).size}
      />
    </div>
  );
}
