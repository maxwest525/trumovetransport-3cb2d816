import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Sparkles, Pencil, Plus, Check, ChevronDown, ChevronRight,
  LogOut, HelpCircle, Loader2, X, Trash2, Folder, FolderPlus, Image as ImageIcon,
  Cpu, ShieldCheck, Headphones, AlertTriangle, Camera, Square, ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ============================================================
   TruMove AI Inventory Scanner — fullscreen page
   Route: /inventory/scan
   Dark, neon-green tech aesthetic. Upload-only.
============================================================ */

type ScanState = "pending" | "scanning" | "scanned" | "failed";

interface Photo {
  id: string;
  file: File;
  url: string;            // object URL for display
  dataUrl?: string;       // base64 for AI
  roomId: string;
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
}

const DEFAULT_ROOMS: Room[] = [
  { id: "living-room", name: "Living Room" },
  { id: "bedroom", name: "Bedroom" },
  { id: "kitchen", name: "Kitchen" },
  { id: "dining-room", name: "Dining Room" },
  { id: "office", name: "Office" },
  { id: "other", name: "Other" },
];

const STEPS = ["Scan", "Review", "Get Quote"] as const;

/* ---------- helpers ---------- */

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
function TopBar({
  activeStep,
  onSaveExit,
}: {
  activeStep: number;
  onSaveExit: () => void;
}) {
  return (
    <header className="h-16 border-b border-white/[0.06] bg-black flex items-center px-6 flex-shrink-0">
      <div className="flex items-center gap-2 w-[200px]">
        <img src={logoImg} alt="TruMove" className="h-5 brightness-0 invert" />
        <span className="text-[10px] text-white/40 font-mono mt-0.5">™</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3">
          {STEPS.map((label, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300",
                      done && "bg-[#00ff88] text-black",
                      active && "bg-[#00ff88] text-black shadow-[0_0_16px_rgba(0,255,136,0.5)]",
                      !done && !active && "border border-white/15 text-white/40"
                    )}
                  >
                    {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold tracking-[0.1em] uppercase",
                      (done || active) ? "text-[#00ff88]" : "text-white/40"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-12 h-px bg-white/10 relative -mt-4">
                    <div
                      className="h-full bg-[#00ff88] transition-all duration-500"
                      style={{ width: done ? "100%" : "0%" }}
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
   Corner Brackets
============================================================ */
function Brackets({ pulse }: { pulse?: boolean }) {
  const cls = cn(
    "absolute w-6 h-6 border-[#00ff88] pointer-events-none",
    pulse && "animate-[pulse_2s_ease-in-out_infinite]"
  );
  return (
    <>
      <div className={cn(cls, "top-3 left-3 border-t-2 border-l-2")} />
      <div className={cn(cls, "top-3 right-3 border-t-2 border-r-2")} />
      <div className={cn(cls, "bottom-3 left-3 border-b-2 border-l-2")} />
      <div className={cn(cls, "bottom-3 right-3 border-b-2 border-r-2")} />
    </>
  );
}

/* ============================================================
   Detection Box overlay
============================================================ */
function DetectionBoxes({
  detections,
  highlightedId,
  onHover,
  onClick,
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
            transition={{ duration: 0.25, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
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
              style={{
                background: color,
                color: "#000",
              }}
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
  activePhoto,
  highlightedDetectionId,
  onHoverDetection,
  onClickDetection,
  onDrop,
  isScanning,
}: {
  activePhoto: Photo | null;
  highlightedDetectionId: string | null;
  onHoverDetection: (id: string | null) => void;
  onClickDetection: (d: Detection) => void;
  onDrop: (files: File[]) => void;
  isScanning: boolean;
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

      {/* Empty state */}
      {!activePhoto && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <Brackets />
          <motion.div
            initial={{ y: -4, opacity: 0.6 }}
            animate={{ y: 4, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="mb-5"
          >
            <Upload className="w-16 h-16 text-[#00ff88]/60" strokeWidth={1.25} />
          </motion.div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {isDragActive ? "Drop to upload" : "Drop photos here"}
          </h2>
          <p className="text-sm text-white/50 mb-6">
            or click to browse — JPG, PNG, HEIC up to 20MB each
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); open(); }}
            className="px-5 py-2.5 rounded-md bg-[#00ff88] text-black font-semibold text-sm hover:bg-[#00ff88]/90 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all"
          >
            Browse files
          </button>
        </div>
      )}

      {/* Loaded state */}
      {activePhoto && (
        <>
          <img
            src={activePhoto.enhancedUrl || activePhoto.url}
            alt="Room"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <Brackets pulse={isScanning} />

          {/* Top-left filename card */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-[#00ff88]" />
            <div className="text-[10px]">
              <div className="text-white/40 uppercase tracking-wider">Photo</div>
              <div className="text-white font-mono truncate max-w-[180px]">
                {activePhoto.file.name}
              </div>
            </div>
          </div>

          {/* Top-center scanning pill */}
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

          {/* Detection boxes */}
          <DetectionBoxes
            detections={activePhoto.detections}
            highlightedId={highlightedDetectionId}
            onHover={onHoverDetection}
            onClick={onClickDetection}
          />

          {/* Bottom hint when no detections yet */}
          {!isScanning && activePhoto.detections.length === 0 && activePhoto.status !== "failed" && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-white/10 rounded-md px-4 py-2.5 flex items-center gap-2.5 max-w-md">
              <Sparkles className="w-4 h-4 text-[#00ff88]" />
              <div className="text-[12px] text-white/80">
                Ready to scan — items will appear here as we detect them.
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

      {/* Drag overlay when photos exist */}
      {activePhoto && isDragActive && (
        <div className="absolute inset-0 bg-[#00ff88]/10 border-2 border-dashed border-[#00ff88] rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-white font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" /> Drop to add more photos
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Photo Strip
============================================================ */
function PhotoStrip({
  photos,
  activeId,
  editMode,
  onSelect,
  onDelete,
  onAdd,
}: {
  photos: Photo[];
  activeId: string | null;
  editMode: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {photos.map((p) => {
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
          >
            <button
              onClick={() => onSelect(p.id)}
              className={cn(
                "w-[60px] h-[60px] rounded-md overflow-hidden border-2 transition-all relative",
                active ? "border-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.4)]" : "border-white/10 hover:border-white/30"
              )}
            >
              <img src={p.url} alt="" className="w-full h-full object-cover" />
              <span className={cn("absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-black", dotColor)} />
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
      })}
      <button
        onClick={onAdd}
        className="w-[60px] h-[60px] rounded-md border-2 border-dashed border-white/15 hover:border-[#00ff88]/60 hover:bg-[#00ff88]/5 flex items-center justify-center text-white/40 hover:text-[#00ff88] transition-colors flex-shrink-0"
        aria-label="Add photos"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ============================================================
   Action Toolbar
============================================================ */
function ActionToolbar({
  onUpload,
  onEnhance,
  editMode,
  onToggleEdit,
  canContinue,
  onContinue,
  onSkipRoom,
  hasActivePhoto,
}: {
  onUpload: () => void;
  onEnhance: () => void;
  editMode: boolean;
  onToggleEdit: () => void;
  canContinue: boolean;
  onContinue: () => void;
  onSkipRoom: () => void;
  hasActivePhoto: boolean;
}) {
  const RoundBtn = ({
    icon: Icon, onClick, active, disabled, label,
  }: { icon: any; onClick: () => void; active?: boolean; disabled?: boolean; label: string }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "w-11 h-11 rounded-full border flex items-center justify-center transition-all",
        active
          ? "border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]"
          : "border-white/10 bg-[#111827] text-white/70 hover:border-white/30 hover:text-white",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <RoundBtn icon={Upload} onClick={onUpload} label="Upload more photos" />
        <RoundBtn icon={Sparkles} onClick={onEnhance} disabled={!hasActivePhoto} label="Enhance current photo" />
        <RoundBtn icon={Trash2} onClick={onToggleEdit} active={editMode} label="Edit photos" />
      </div>

      <button
        onClick={onContinue}
        disabled={!canContinue}
        className={cn(
          "h-11 px-6 rounded-full font-semibold text-sm flex items-center gap-2 transition-all",
          canContinue
            ? "bg-[#00ff88] text-black hover:shadow-[0_0_24px_rgba(0,255,136,0.5)]"
            : "bg-white/5 text-white/30 cursor-not-allowed"
        )}
      >
        Looks good, continue <ArrowRight className="w-4 h-4" />
      </button>

      <button
        onClick={onSkipRoom}
        className="text-[12px] text-white/40 hover:text-white/70 px-2"
      >
        Skip this room
      </button>
    </div>
  );
}

/* ============================================================
   Trust Strip
============================================================ */
function ScannerTrustStrip() {
  const items = [
    { icon: Cpu, title: "AI-Powered Detection", body: "Our AI identifies and counts your items automatically." },
    { icon: ShieldCheck, title: "100% Private & Secure", body: "Your photos and data are never shared or stored." },
    { icon: Headphones, title: "Need Help?", body: "Our moving experts are here to help you 24/7." },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it) => (
        <div
          key={it.title}
          className="rounded-lg border border-white/[0.06] bg-[#0a0e1a] px-4 py-3 flex items-start gap-3"
        >
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
  rooms,
  items,
  scanning,
  highlightedItemId,
  onItemHover,
  onItemClick,
  onEditItem,
  onAddItem,
  onContinue,
  collapsedRooms,
  toggleRoom,
}: {
  rooms: Room[];
  items: InventoryItem[];
  scanning: boolean;
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

  return (
    <aside className="w-[380px] flex-shrink-0 bg-[#0a0e1a] border-l border-white/[0.06] flex flex-col h-full">
      {/* Status card */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="rounded-lg bg-[#00ff88]/[0.06] border border-[#00ff88]/20 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#00ff88]/15 flex items-center justify-center">
            {scanning ? (
              <Loader2 className="w-4 h-4 text-[#00ff88] animate-spin" />
            ) : (
              <Check className="w-4 h-4 text-[#00ff88]" strokeWidth={3} />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-white">
              {scanning ? "Scan in progress..." : items.length === 0 ? "Ready when you are" : "Scan complete"}
            </div>
            <div className="text-[11px] text-white/50">
              We've detected <span className="text-white font-semibold tabular-nums">{totalCount}</span> item{totalCount === 1 ? "" : "s"} so far
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      {items.length > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
          <div className="text-[14px] font-medium text-white">Detected Items</div>
          <div className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full bg-[#00ff88]/15 text-[#00ff88]">
            {totalCount}
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-8 text-center text-white/40">
            <ImageIcon className="w-10 h-10 mb-3 opacity-40" />
            <div className="text-[13px]">No items detected yet</div>
            <div className="text-[11px] mt-1">Upload a photo to begin</div>
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
                    {collapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                    )}
                    <span className="text-[13px] font-medium text-white flex-1 text-left">
                      {room.name}
                    </span>
                    <span className="text-[11px] tabular-nums px-1.5 py-0.5 rounded bg-white/5 text-[#00ff88] font-semibold">
                      {roomCount}
                    </span>
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
                              highlightedItemId === item.id
                                ? "bg-[#00ff88]/[0.08]"
                                : "hover:bg-white/[0.03]"
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
                            <div className="text-[13px] text-white flex-1 min-w-0 truncate">
                              {item.name}
                            </div>
                            <div className="text-[13px] tabular-nums text-[#00ff88] font-semibold w-6 text-right">
                              {item.quantity}
                            </div>
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

      {/* Bottom actions */}
      <div className="p-4 border-t border-white/[0.06] space-y-2 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAddItem}
            className="h-9 rounded-md border border-white/10 bg-transparent text-white/70 text-[12px] font-medium hover:border-white/30 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
          <button
            className="h-9 rounded-md border border-white/10 bg-transparent text-white/70 text-[12px] font-medium hover:border-white/30 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Room
          </button>
        </div>
        <button
          onClick={onContinue}
          disabled={items.length === 0}
          className={cn(
            "w-full h-[52px] rounded-md font-semibold text-[14px] flex items-center justify-center gap-2 transition-all",
            items.length > 0
              ? "bg-[#00ff88] text-black hover:shadow-[0_0_24px_rgba(0,255,136,0.5)]"
              : "bg-white/5 text-white/30 cursor-not-allowed"
          )}
        >
          Looks Good, Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

/* ============================================================
   Room Picker Dialog
============================================================ */
function RoomPickerDialog({
  open, rooms, onSelect, onClose, batchCount,
}: {
  open: boolean;
  rooms: Room[];
  onSelect: (roomId: string, applyToAll: boolean) => void;
  onClose: () => void;
  batchCount: number;
}) {
  const [applyAll, setApplyAll] = useState(true);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-[#0a0e1a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Which room is this from?</DialogTitle>
          <DialogDescription className="text-white/50">
            We'll group your detected items by room.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id, applyAll)}
              className="px-3 py-3 rounded-md border border-white/10 bg-[#111827] text-white text-sm hover:border-[#00ff88] hover:bg-[#00ff88]/10 hover:text-[#00ff88] transition-colors text-left"
            >
              {r.name}
            </button>
          ))}
        </div>
        {batchCount > 1 && (
          <label className="flex items-center gap-2 mt-3 text-[12px] text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={applyAll}
              onChange={(e) => setApplyAll(e.target.checked)}
              className="accent-[#00ff88]"
            />
            Apply to all {batchCount} photos in this batch
          </label>
        )}
      </DialogContent>
    </Dialog>
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
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#111827] border-white/10 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-white/60 text-[11px] uppercase tracking-wider">Quantity</Label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-[#111827] border-white/10 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-white/60 text-[11px] uppercase tracking-wider">Room</Label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full mt-1 h-10 rounded-md bg-[#111827] border border-white/10 text-white px-3 text-sm"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
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
            "Upload photos of each room — JPG, PNG, or HEIC.",
            "We tag each photo to a room so items are grouped correctly.",
            "Our AI identifies furniture and large items and counts them.",
            "Review, edit, and adjust quantities in the right panel.",
            "Continue to get an instant moving estimate.",
          ].map((line, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[#00ff88]/15 text-[#00ff88] text-[12px] font-semibold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default function InventoryScan() {
  const navigate = useNavigate();

  const [rooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [collapsedRooms, setCollapsedRooms] = useState<Set<string>>(new Set());
  const [howOpen, setHowOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [highlightedDetectionId, setHighlightedDetectionId] = useState<string | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  // Pending photos awaiting room assignment
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);

  // Hidden file input for "Upload more"
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Inventory Scanner | TruMove";
  }, []);

  const activePhoto = photos.find((p) => p.id === activePhotoId) || null;
  const isScanning = activePhoto?.status === "scanning";

  /* ---------- file intake ---------- */
  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setPendingFiles(files);
    setRoomPickerOpen(true);
  }, []);

  /* ---------- after room picked, create photos & scan ---------- */
  const onRoomSelected = async (roomId: string, applyAll: boolean) => {
    setRoomPickerOpen(false);
    const filesToAssign = applyAll ? pendingFiles : pendingFiles.slice(0, 1);
    const remaining = applyAll ? [] : pendingFiles.slice(1);
    setPendingFiles(remaining);

    const newPhotos: Photo[] = [];
    for (const file of filesToAssign) {
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

    // Scan sequentially
    for (const photo of newPhotos) {
      await scanPhoto(photo);
    }

    // If more pending and applyAll was false, reopen picker for next
    if (remaining.length > 0) {
      setRoomPickerOpen(true);
    }
  };

  /* ---------- AI scan ---------- */
  const scanPhoto = async (photo: Photo) => {
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

      // Update photo
      setPhotos((prev) => prev.map((p) =>
        p.id === photo.id ? { ...p, status: "scanned", detections, dataUrl } : p
      ));

      // Add inventory items
      const newItems: InventoryItem[] = rawItems.map((it, i) => ({
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
      const msg = err?.message?.includes("429")
        ? "Rate limited. Wait a moment and try again."
        : err?.message?.includes("402")
        ? "AI credits required."
        : "Detection failed.";
      setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, status: "failed", error: msg } : p));
      toast({ title: "Scan failed", description: msg, variant: "destructive" });
    }
  };

  /* ---------- enhance ---------- */
  const enhanceActive = async () => {
    if (!activePhoto) return;
    toast({ title: "Enhancing photo...", description: "This may take a few seconds." });
    try {
      const dataUrl = activePhoto.dataUrl || (await fileToDataUrl(activePhoto.file));
      const { data, error } = await supabase.functions.invoke("enhance-image", {
        body: { imageUrl: dataUrl },
      });
      if (error) throw error;
      const enhancedUrl = data?.enhancedUrl;
      if (!enhancedUrl) throw new Error("No enhanced image returned");

      setPhotos((prev) => prev.map((p) =>
        p.id === activePhoto.id ? { ...p, enhancedUrl, qualityFlag: "ok", detections: [] } : p
      ));
      // Drop old items from this photo and re-scan
      setItems((prev) => prev.filter((i) => i.sourcePhotoId !== activePhoto.id));
      const updated = { ...activePhoto, enhancedUrl };
      await scanPhoto(updated);
      toast({ title: "Photo enhanced", description: "Re-scanning with improved quality." });
    } catch (err: any) {
      toast({ title: "Enhancement failed", description: err?.message || "Try again.", variant: "destructive" });
    }
  };

  /* ---------- delete photo ---------- */
  const deletePhoto = (id: string) => {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activePhotoId === id) {
        setActivePhotoId(next[0]?.id || null);
      }
      return next;
    });
    setItems((prev) => prev.filter((i) => i.sourcePhotoId !== id));
  };

  /* ---------- panel actions ---------- */
  const toggleRoom = (id: string) => {
    setCollapsedRooms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleItemClick = (item: InventoryItem) => {
    if (item.sourcePhotoId !== activePhotoId) {
      setActivePhotoId(item.sourcePhotoId);
    }
    // Find matching detection on the photo
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
    } else {
      setHighlightedItemId(null);
    }
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
    } else {
      setHighlightedDetectionId(null);
    }
  };

  const updateItem = (id: string, patch: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);

  const continueToReview = () => {
    if (totalCount === 0) {
      toast({ title: "Add some items first", description: "Upload at least one photo to scan.", variant: "destructive" });
      return;
    }
    // Stash items into sessionStorage so /online-estimate or future /review can pick them up
    try {
      sessionStorage.setItem("trumove.scannedInventory", JSON.stringify(items));
    } catch {}
    navigate("/online-estimate");
  };

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <TopBar
        activeStep={0}
        onSaveExit={() => navigate("/")}
      />

      <main className="flex-1 flex overflow-hidden">
        {/* Scanner column */}
        <section className="flex-1 min-w-0 flex flex-col p-6 gap-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-semibold leading-tight">
                Inventory <span className="text-[#00ff88]">Scanner</span>
              </h1>
              <p className="text-sm text-white/50 mt-1">
                Upload photos and we'll detect items automatically.
              </p>
            </div>
            <button
              onClick={() => setHowOpen(true)}
              className="flex items-center gap-1.5 text-[12px] text-white/60 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              How it works
            </button>
          </div>

          {/* Quality banner */}
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

          {/* Canvas */}
          <ScannerCanvas
            activePhoto={activePhoto}
            highlightedDetectionId={highlightedDetectionId}
            onHoverDetection={handleDetectionHover}
            onClickDetection={handleDetectionClick}
            onDrop={handleFiles}
            isScanning={isScanning}
          />

          {/* Photo strip */}
          {photos.length > 0 && (
            <PhotoStrip
              photos={photos}
              activeId={activePhotoId}
              editMode={editMode}
              onSelect={setActivePhotoId}
              onDelete={deletePhoto}
              onAdd={() => fileInputRef.current?.click()}
            />
          )}

          {/* Hidden input for upload-more */}
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

          {/* Action toolbar */}
          {photos.length > 0 && (
            <ActionToolbar
              onUpload={() => fileInputRef.current?.click()}
              onEnhance={enhanceActive}
              editMode={editMode}
              onToggleEdit={() => setEditMode((v) => !v)}
              canContinue={totalCount > 0}
              onContinue={continueToReview}
              onSkipRoom={() => {
                if (activePhoto) deletePhoto(activePhoto.id);
              }}
              hasActivePhoto={!!activePhoto}
            />
          )}

          {/* Trust strip */}
          <div className="mt-auto pt-2">
            <ScannerTrustStrip />
          </div>
        </section>

        {/* Inventory panel */}
        <InventoryPanel
          rooms={rooms}
          items={items}
          scanning={isScanning}
          highlightedItemId={highlightedItemId}
          onItemHover={handleItemHover}
          onItemClick={handleItemClick}
          onEditItem={setEditingItem}
          onAddItem={() => {
            const room = rooms[0];
            const newItem: InventoryItem = {
              id: uid(),
              name: "Custom item",
              quantity: 1,
              cubicFeet: 5,
              weight: 35,
              roomId: room.id,
              sourcePhotoId: "",
              confidence: 100,
            };
            setItems((prev) => [...prev, newItem]);
            setEditingItem(newItem);
          }}
          onContinue={continueToReview}
          collapsedRooms={collapsedRooms}
          toggleRoom={toggleRoom}
        />
      </main>

      {/* Modals */}
      <RoomPickerDialog
        open={roomPickerOpen}
        rooms={rooms}
        batchCount={pendingFiles.length}
        onSelect={onRoomSelected}
        onClose={() => { setRoomPickerOpen(false); setPendingFiles([]); }}
      />

      <ItemEditDrawer
        item={editingItem}
        rooms={rooms}
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(patch) => editingItem && updateItem(editingItem.id, patch)}
        onDelete={() => editingItem && deleteItem(editingItem.id)}
      />

      <HowItWorksDrawer open={howOpen} onClose={() => setHowOpen(false)} />
    </div>
  );
}
