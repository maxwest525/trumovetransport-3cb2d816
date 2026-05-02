import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Sparkles, ImageIcon, Check, LogOut, Loader2,
  ShieldCheck, Clock, ChevronDown, Plus, X, HelpCircle,
  CheckCircle2, RotateCcw, Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ============================================================
   TruMove AI Inventory Scanner — single-dropzone workflow
   Route: /inventory/scan
   States: empty → scanning → complete
============================================================ */

type ScannerState = "empty" | "scanning" | "complete";
type PhotoStatus = "pending" | "scanning" | "scanned" | "failed";

interface Photo {
  id: string;
  file?: File;          // optional for sample
  url: string;
  dataUrl?: string;
  roomId: string;       // assigned post-scan
  autoTagged: boolean;
  status: PhotoStatus;
  detections: Detection[];
  width?: number;
  height?: number;
  quality?: QualityResult;
  enhanceStatus?: "idle" | "enhancing" | "enhanced" | "failed";
  qualityDismissed?: boolean;
}

interface QualityResult {
  tier: "good" | "medium" | "low";
  reason: "resolution" | "compression" | null;
  recommendation: "enhance" | "optional" | null;
  width: number;
  height: number;
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
  confidence: number;
  detectedAt: number;
}

interface Room {
  id: string;
  name: string;
  color: string;
  detectedAt: number;
}

/* ----- Room palette (rotated as rooms appear) ----- */
const ROOM_PALETTE = [
  { id: "living-room", name: "Living Room", color: "#3b82f6" },
  { id: "bedroom",     name: "Bedroom",     color: "#a855f7" },
  { id: "kitchen",     name: "Kitchen",     color: "#f59e0b" },
  { id: "dining-room", name: "Dining Room", color: "#fb7185" },
  { id: "office",      name: "Office",      color: "#14b8a6" },
  { id: "bathroom",    name: "Bathroom",    color: "#22c55e" },
  { id: "garage",      name: "Garage",      color: "#9ca3af" },
  { id: "nursery",     name: "Nursery",     color: "#f472b6" },
  { id: "basement",    name: "Basement",    color: "#64748b" },
  { id: "other",       name: "Other",       color: "#ec4899" },
];

const ROOM_KEYWORDS: Record<string, string[]> = {
  bedroom: ["bed", "nightstand", "dresser", "headboard", "mattress", "armoire", "wardrobe"],
  "living-room": ["sofa", "couch", "loveseat", "coffee table", "tv stand", "recliner", "ottoman", "media console", "tv"],
  kitchen: ["fridge", "refrigerator", "stove", "oven", "microwave", "dishwasher"],
  "dining-room": ["dining table", "dining chair", "buffet", "china cabinet", "hutch"],
  office: ["desk", "office chair", "filing cabinet", "bookshelf", "monitor"],
  bathroom: ["vanity", "toilet", "shower", "bath"],
  garage: ["lawn mower", "tool chest", "workbench", "bike", "bicycle"],
};

const uid = () => Math.random().toString(36).slice(2, 10);

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const confidenceColor = (c: number) =>
  c >= 85 ? "#00ff88" : c >= 70 ? "#fbbf24" : "#ef4444";

/* ----- Photo quality helpers ----- */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function checkPhotoQuality(
  fileSize: number,
  width: number,
  height: number,
): QualityResult {
  const minDim = Math.min(width, height);
  if (minDim > 0 && minDim < 600) {
    return { tier: "low", reason: "resolution", recommendation: "enhance", width, height };
  }
  const pixels = width * height;
  const bpp = pixels > 0 ? fileSize / pixels : 1;
  if (bpp < 0.3 && pixels > 0) {
    return { tier: "low", reason: "compression", recommendation: "enhance", width, height };
  }
  if (minDim > 0 && minDim < 1000) {
    return { tier: "medium", reason: "resolution", recommendation: "optional", width, height };
  }
  return { tier: "good", reason: null, recommendation: null, width, height };
}

function formatDimensions(width: number, height: number): string {
  const max = Math.max(width, height);
  if (max >= 3840) return "4K";
  if (max >= 4000) return "high resolution";
  if (max >= 1920 && Math.min(width, height) >= 1080) return "1080p";
  return `${width}x${height}`;
}

function detectRoomFromItems(itemNames: string[]): { roomId: string; auto: boolean } {
  const counts: Record<string, number> = {};
  for (const name of itemNames) {
    const n = name.toLowerCase();
    for (const [rid, kws] of Object.entries(ROOM_KEYWORDS)) {
      if (kws.some((k) => n.includes(k))) counts[rid] = (counts[rid] || 0) + 1;
    }
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [rid, c] of Object.entries(counts)) {
    if (c > bestCount) { best = rid; bestCount = c; }
  }
  if (best) return { roomId: best, auto: true };
  return { roomId: "other", auto: true };
}

/* Map a Gemini room display name -> internal room id, creating one if needed. */
function roomNameToId(name: string): string {
  const trimmed = name.trim();
  const match = ROOM_PALETTE.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
  if (match) return match.id;
  return trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "other";
}

/* ============================================================
   Top Bar — TruMove header (desktop polish)
============================================================ */
function TopBar({ statusLabel, onSaveExit }: { statusLabel: string; onSaveExit: () => void }) {
  return (
    <header
      className="h-12 lg:h-16 flex items-center px-5 lg:px-8 flex-shrink-0 relative"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,255,136,0.03) 0%, transparent 100%), #000",
        borderBottom: "0.5px solid rgba(0,255,136,0.15)",
      }}
    >
      {/* Left — wordmark */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-[13px] lg:text-[20px] tracking-[0.18em] lg:tracking-[0.14em] font-semibold text-white">
          TRUMOVE
        </span>
        <span className="text-[9px] lg:text-[10px] text-[#00ff88] font-bold -mt-2 lg:-mt-3">™</span>
      </div>

      {/* Center — single status string (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2">
          <span
            className="w-[6px] h-[6px] rounded-full bg-[#00ff88]"
            style={{ boxShadow: "0 0 8px rgba(0,255,136,0.6)" }}
          />
          <span className="text-[13px] text-white/90 font-normal">{statusLabel}</span>
        </div>
      </div>

      <div className="flex-1 lg:flex-none lg:w-auto flex justify-end ml-auto">
        <button
          onClick={onSaveExit}
          className="flex items-center gap-1.5 text-[11px] lg:text-[13px] text-white/50 hover:text-white transition-colors"
        >
          <LogOut className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          Save & exit
        </button>
      </div>
    </header>
  );
}

/* ============================================================
   Page heading row (desktop only)
============================================================ */
function PageHeading() {
  return (
    <div className="hidden lg:flex items-end justify-between mb-6">
      <div>
        <h1 className="text-[28px] font-medium text-white tracking-[-0.4px] leading-tight">
          Inventory <span className="text-[#00ff88]">Scanner</span>
        </h1>
        <p className="text-[14px] text-[#a8b3c0] mt-1.5">
          Drop photos. Our AI builds your moving inventory in seconds.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 text-[12px] text-[#a8b3c0] hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/[0.04]">
          <HelpCircle className="w-3.5 h-3.5" /> How it works
        </button>
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full bg-[#00ff88]"
            style={{ boxShadow: "0 0 6px rgba(0,255,136,0.6)" }}
          />
          <span className="text-[10px] uppercase tracking-[0.12em] text-[#7d8694] font-medium">
            AI Engine
          </span>
          <span className="text-[10px] text-white/80 font-mono">Gemini Vision</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Empty state
============================================================ */
function EmptyState({
  onFiles, onSample,
}: {
  onFiles: (files: File[]) => void;
  onSample: () => void;
}) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [], "video/*": [] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDrop: (accepted) => onFiles(accepted),
  });

  return (
    <div className="flex-1 overflow-auto px-6 py-8">
      <div className="max-w-[1100px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-[22px] font-medium text-white tracking-[-0.3px]">
            Show us what you're moving
          </h1>
          <p className="text-[13px] text-white/50 mt-1.5">
            Upload photos of every room. Our AI handles the rest.
          </p>
        </div>

        {/* Hero dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "relative rounded-lg transition-all duration-200 cursor-pointer",
            "py-8 px-5",
            isDragActive ? "scale-[1.01]" : ""
          )}
          style={{
            background: isDragActive ? "rgba(0,255,136,0.06)" : "rgba(0,255,136,0.02)",
            border: isDragActive
              ? "1px solid rgba(0,255,136,0.7)"
              : "1px dashed rgba(0,255,136,0.35)",
          }}
        >
          <input {...getInputProps()} />
          {/* corner brackets */}
          <Bracket pos="tl" />
          <Bracket pos="tr" />
          <Bracket pos="bl" />
          <Bracket pos="br" />

          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,255,136,0.08)", border: "0.5px solid rgba(0,255,136,0.2)" }}
            >
              <ImageIcon className="w-5 h-5 text-[#00ff88]" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00ff88] flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-black" strokeWidth={2.5} />
              </span>
            </motion.div>

            <div className="text-left">
              <div className="text-[16px] text-white font-medium">
                {isDragActive ? "Drop to start scanning" : "Drop photos and videos anywhere"}
              </div>
              <div className="text-[12px] text-white/50 mt-0.5">
                JPG, PNG, HEIC, MP4 — up to 50 files at once
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); open(); }}
              className="px-3 py-1.5 rounded-md bg-[#00ff88] text-black text-[12px] font-medium hover:bg-[#00ff88]/90 transition-colors"
            >
              Browse files
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); open(); }}
              className="px-3 py-1.5 rounded-md border border-white/15 text-white/80 text-[12px] hover:border-white/30 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3 h-3" /> Use camera
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSample(); }}
              className="px-3 py-1.5 rounded-md border border-white/10 text-white/60 text-[12px] hover:border-white/20 hover:text-white/90 transition-colors"
            >
              Try with sample
            </button>
          </div>
        </div>

        {/* Process strip */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { n: 1, t: "Upload anything", d: "All rooms, all at once. No sorting needed." },
            { n: 2, t: "AI sorts by room", d: "Detects furniture and groups automatically." },
            { n: 3, t: "Review & continue", d: "Edit anything wrong, then get your quote." },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-lg p-3"
              style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-[18px] h-[18px] rounded text-[10px] font-semibold flex items-center justify-center"
                  style={{ background: "rgba(0,255,136,0.12)", color: "#00ff88" }}
                >
                  {s.n}
                </span>
                <span className="text-[11px] text-white font-medium">{s.t}</span>
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed pl-[26px]">{s.d}</p>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div
          className="mt-5 rounded-md p-2.5 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-1.5 text-[11px] text-white/50">
            <ShieldCheck className="w-3 h-3 text-[#00ff88]" />
            Photos never leave our servers · Encrypted in transit
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/50">
            <Clock className="w-3 h-3" />
            Avg time: 3 min for a 2-bed apartment
          </div>
        </div>
      </div>
    </div>
  );
}

function Bracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-3.5 h-3.5 pointer-events-none";
  const map = {
    tl: "top-1.5 left-1.5 border-t-[2px] border-l-[2px]",
    tr: "top-1.5 right-1.5 border-t-[2px] border-r-[2px]",
    bl: "bottom-1.5 left-1.5 border-b-[2px] border-l-[2px]",
    br: "bottom-1.5 right-1.5 border-b-[2px] border-r-[2px]",
  };
  return <div className={cn(base, map[pos])} style={{ borderColor: "#00ff88" }} />;
}

/* ============================================================
   Status bar (scanning + complete states)
============================================================ */
function StatusBar({
  current, total, itemsFound, etaSec, complete, roomCount, slim, onRescan, onDismiss,
}: {
  current: number; total: number; itemsFound: number; etaSec: number;
  complete: boolean; roomCount: number;
  slim?: boolean;
  onRescan?: () => void;
  onDismiss?: () => void;
}) {
  if (complete && slim) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg px-3 lg:px-5 py-2 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
          <span className="text-[13px] text-white/90 font-medium">Ready to review</span>
          <span className="text-[12px] text-[#a8b3c0]">
            {itemsFound} items · {roomCount} {roomCount === 1 ? "room" : "rooms"}
          </span>
        </div>
        {onRescan && (
          <button
            onClick={onRescan}
            className="flex items-center gap-1.5 text-[12px] text-[#a8b3c0] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Re-scan
          </button>
        )}
      </motion.div>
    );
  }

  if (complete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="rounded-lg flex items-center justify-between"
        style={{
          background: "rgba(0,255,136,0.08)",
          border: "0.5px solid rgba(0,255,136,0.4)",
          padding: "14px 20px",
          minHeight: 56,
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <CheckCircle2 className="w-[18px] h-[18px] text-[#00ff88]" fill="rgba(0,255,136,0.18)" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-[14px] text-white font-medium leading-tight">Scan complete</span>
            <span className="text-[12px] text-[#a8b3c0] leading-tight mt-0.5">
              {itemsFound} items detected across {roomCount} {roomCount === 1 ? "room" : "rooms"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRescan && (
            <button
              onClick={onRescan}
              className="h-7 px-2.5 rounded text-[12px] text-white/80 hover:text-white border border-white/15 hover:border-white/30 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" /> Re-scan
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white/50 hover:text-white p-1"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="rounded-lg flex items-center justify-between"
      style={{
        background: "rgba(0,255,136,0.04)",
        border: "0.5px solid rgba(0,255,136,0.15)",
        padding: "14px 20px",
        minHeight: 56,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-[18px] h-[18px] flex items-center justify-center">
          <Loader2
            className="w-[18px] h-[18px] text-[#00ff88] animate-spin"
            style={{ filter: "drop-shadow(0 0 6px rgba(0,255,136,0.5))" }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-white font-medium leading-tight">
            Analyzing {current} of {total} {total === 1 ? "photo" : "photos"}
          </span>
          <span className="text-[12px] text-[#a8b3c0] leading-tight mt-0.5">
            Found {itemsFound} items so far
          </span>
        </div>
      </div>
      <div className="text-[12px] font-mono text-[#00ff88]">
        {etaSec > 0 ? `~${etaSec}s` : "wrapping up…"}
      </div>
    </div>
  );
}

/* ============================================================
   Room chips
============================================================ */
function MiniDropzone({
  uploaded, scanned, onFiles,
}: {
  uploaded: number;
  scanned: number;
  onFiles: (files: File[]) => void;
}) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [], "video/*": [] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDrop: (accepted) => {
      if (accepted.length === 0) return;
      onFiles(accepted);
      toast({ title: `Added ${accepted.length} ${accepted.length === 1 ? "photo" : "photos"} to queue` });
    },
  });
  return (
    <div
      {...getRootProps()}
      onClick={open}
      className="rounded-lg flex items-center justify-between cursor-pointer transition-colors"
      style={{
        height: 48,
        padding: "8px 16px",
        border: isDragActive
          ? "1px solid rgba(0,255,136,0.7)"
          : "1px dashed rgba(0,255,136,0.25)",
        background: isDragActive ? "rgba(0,255,136,0.06)" : "rgba(0,255,136,0.02)",
      }}
    >
      <input {...getInputProps()} />
      <div className="flex items-center gap-2.5">
        <div
          className="relative w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(0,255,136,0.1)" }}
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#00ff88]" strokeWidth={1.75} />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff88] flex items-center justify-center">
            <Sparkles className="w-1.5 h-1.5 text-black" strokeWidth={3} />
          </span>
        </div>
        <span className="text-[12px] text-white font-medium">
          {isDragActive ? "Drop to add to queue" : "Drop more photos"}
        </span>
        <span className="text-[11px] text-white/50">or click to browse</span>
      </div>
      <span className="text-[11px] text-white/50">
        {uploaded} uploaded · {scanned} scanned
      </span>
    </div>
  );
}

/* ============================================================
   Corner-bracket detection box
============================================================ */
function DetectionBox({
  bbox, label, confidence, color, index,
}: {
  bbox: { x: number; y: number; width: number; height: number };
  label: string;
  confidence: number;
  color: string;
  index: number;
}) {
  // Dark text for legibility on color fills
  const textColor =
    color === "#00ff88" ? "#002818" :
    color === "#fbbf24" ? "#422006" :
    color === "#ef4444" ? "#450a0a" :
    "#000";
  const cornerBase: React.CSSProperties = {
    position: "absolute",
    borderColor: color,
    borderStyle: "solid",
    filter: `drop-shadow(0 0 8px ${color}66)`,
  };
  const corners: Array<{ key: string; style: React.CSSProperties }> = [
    { key: "tl", style: { top: -1, left: -1, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderRightWidth: 0, borderBottomWidth: 0 } },
    { key: "tr", style: { top: -1, right: -1, borderTopWidth: 2.5, borderRightWidth: 2.5, borderLeftWidth: 0, borderBottomWidth: 0 } },
    { key: "br", style: { bottom: -1, right: -1, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderLeftWidth: 0, borderTopWidth: 0 } },
    { key: "bl", style: { bottom: -1, left: -1, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderRightWidth: 0, borderTopWidth: 0 } },
  ];
  const baseDelay = index * 0.08;
  return (
    <div
      className="absolute group"
      style={{
        left: `${bbox.x * 100}%`,
        top: `${bbox.y * 100}%`,
        width: `${bbox.width * 100}%`,
        height: `${bbox.height * 100}%`,
        pointerEvents: "auto",
        border: "none",
        background: "transparent",
      }}
    >
      {corners.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0.85, 1], scale: 1 }}
          transition={{ delay: baseDelay + i * 0.03, duration: 0.4, ease: "easeOut" }}
          className="w-3 h-3 lg:w-[18px] lg:h-[18px]"
          style={{ ...cornerBase, ...c.style }}
        />
      ))}
      <motion.div
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: baseDelay + 0.22, duration: 0.15 }}
        className="absolute -top-[24px] left-0 whitespace-nowrap pointer-events-none"
        style={{
          background: color,
          color: textColor,
          maxWidth: "180px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          padding: "3px 8px",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          outline: "1px solid rgba(0,0,0,0.2)",
          letterSpacing: "0.01em",
        }}
      >
        {label} · {Math.round(confidence)}%
      </motion.div>
    </div>
  );
}

/* ============================================================
   Room chips
============================================================ */
function RoomChips({
  rooms, items, activeRoomId, onPick, onAdd,
}: {
  rooms: Room[]; items: InventoryItem[];
  activeRoomId: string | null;
  onPick: (id: string | null) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onPick(null)}
        className={cn(
          "h-8 lg:h-8 px-3 lg:px-3.5 rounded-full text-[12px] lg:text-[13px] font-medium transition-all flex items-center gap-2",
          activeRoomId === null
            ? "bg-[#00ff88]/10 text-white border-[0.5px] border-[#00ff88]/40"
            : "text-[#a8b3c0] hover:text-white"
        )}
        style={
          activeRoomId === null
            ? undefined
            : {
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.08)",
              }
        }
      >
        All
        <span className={cn("text-[11px]", activeRoomId === null ? "text-[#00ff88]" : "opacity-70")}>
          {items.reduce((s, i) => s + i.quantity, 0)}
        </span>
      </button>
      <AnimatePresence>
        {rooms.map((r) => {
          const count = items.filter((i) => i.roomId === r.id).reduce((s, i) => s + i.quantity, 0);
          const photoFor = "items"; // (visual-only tooltip key)
          const active = activeRoomId === r.id;
          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => onPick(r.id)}
              title={`${count} ${photoFor}`}
              className={cn(
                "h-8 lg:h-8 px-3 lg:px-3.5 rounded-full text-[12px] lg:text-[13px] font-medium transition-all flex items-center gap-2 hover:scale-[1.02]",
                active
                  ? "text-white"
                  : "text-[#a8b3c0] hover:text-white"
              )}
              style={{
                background: active ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.04)",
                border: active
                  ? "0.5px solid rgba(0,255,136,0.4)"
                  : "0.5px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="w-[6px] h-[6px] rounded-full" style={{ background: r.color }} />
              {r.name}
              <span className={cn("text-[11px]", active ? "text-[#00ff88]" : "opacity-70")}>{count}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
      <button
        onClick={onAdd}
        className="h-8 px-3 rounded-full text-[12px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
        style={{ border: "0.5px dashed rgba(255,255,255,0.15)" }}
      >
        <Plus className="w-3 h-3" /> add
      </button>
    </div>
  );
}

/* ============================================================
   Scanner Canvas
============================================================ */
function ScannerCanvas({
  photo, photoIndex, totalPhotos, room, onChangeRoom, allRooms,
  onEnhance, onDismissQuality,
}: {
  photo: Photo | null;
  photoIndex: number; totalPhotos: number;
  room: Room | undefined;
  onChangeRoom: (newRoomId: string) => void;
  allRooms: Room[];
  onEnhance: (photoId: string) => void;
  onDismissQuality: (photoId: string) => void;
}) {
  return (
    <div
      className="relative w-full rounded-lg overflow-hidden bg-black"
      style={{ aspectRatio: "16 / 10", border: "0.5px solid rgba(255,255,255,0.08)" }}
    >
      {/* corner brackets */}
      <CanvasBracket pos="tl" />
      <CanvasBracket pos="tr" />
      <CanvasBracket pos="bl" />
      <CanvasBracket pos="br" />

      {photo ? (
        <>
          <img
            src={photo.url}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />
          {/* Quality banner */}
          {photo.quality && photo.quality.tier !== "good" && !photo.qualityDismissed && (
            <QualityBanner
              quality={photo.quality}
              enhanceStatus={photo.enhanceStatus ?? "idle"}
              onEnhance={() => onEnhance(photo.id)}
              onDismiss={() => onDismissQuality(photo.id)}
            />
          )}
          {/* Detection boxes */}
          {photo.status === "scanned" && photo.detections.map((d, i) => (
            <DetectionBox
              key={d.id}
              bbox={d.bbox}
              label={d.itemName}
              confidence={d.confidence}
              color={confidenceColor(d.confidence)}
              index={i}
            />
          ))}

          {photo.status === "scanning" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/70 border border-[#00ff88]/30">
                <Loader2 className="w-3.5 h-3.5 text-[#00ff88] animate-spin" />
                <span className="text-[11px] text-white">Detecting items…</span>
              </div>
            </div>
          )}

          {/* Top-center photo info pill */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full text-white hover:bg-black/85 transition-colors"
                  style={{
                    background: "rgba(0,0,0,0.7)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    padding: "6px 14px",
                    fontSize: 13,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span className="w-[6px] h-[6px] rounded-full bg-[#00ff88]" />
                  <span className="text-white font-medium">
                    Photo {photoIndex + 1} of {totalPhotos}
                  </span>
                  <span className="text-white/40">·</span>
                  <span className="text-[#00ff88]/90">
                    {photo.autoTagged ? "auto-tagged" : "tagged"}
                  </span>
                  <span className="text-white">{room?.name?.toLowerCase() || "—"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1 bg-black border-white/10" align="center">
                <div className="text-[10px] text-white/40 px-2 py-1 uppercase tracking-wider">Move to</div>
                {allRooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onChangeRoom(r.id)}
                    className="w-full text-left px-2 py-1.5 rounded text-[11px] text-white/80 hover:bg-white/5 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
                    {r.name}
                  </button>
                ))}
                {ROOM_PALETTE.filter((p) => !allRooms.find((r) => r.id === p.id)).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onChangeRoom(p.id)}
                    className="w-full text-left px-2 py-1.5 rounded text-[11px] text-white/50 hover:bg-white/5 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                    {p.name}
                    <span className="ml-auto text-[9px] text-white/30">new</span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-[12px]">
          No photo selected
        </div>
      )}
    </div>
  );
}

function CanvasBracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-3 h-3 lg:w-[18px] lg:h-[18px] pointer-events-none z-10";
  const map = {
    tl: "top-2 left-2 border-t-[1.5px] border-l-[1.5px] lg:border-t-[2.5px] lg:border-l-[2.5px]",
    tr: "top-2 right-2 border-t-[1.5px] border-r-[1.5px] lg:border-t-[2.5px] lg:border-r-[2.5px]",
    bl: "bottom-2 left-2 border-b-[1.5px] border-l-[1.5px] lg:border-b-[2.5px] lg:border-l-[2.5px]",
    br: "bottom-2 right-2 border-b-[1.5px] border-r-[1.5px] lg:border-b-[2.5px] lg:border-r-[2.5px]",
  };
  return (
    <motion.div
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={cn(base, map[pos])}
      style={{
        borderColor: "#00ff88",
        filter: "drop-shadow(0 0 8px rgba(0,255,136,0.4))",
      }}
    />
  );
}

/* ============================================================
   Quality Banner — slides into top of canvas
============================================================ */
function QualityBanner({
  quality, enhanceStatus, onEnhance, onDismiss,
}: {
  quality: QualityResult;
  enhanceStatus: "idle" | "enhancing" | "enhanced" | "failed";
  onEnhance: () => void;
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(quality.tier === "low");
  const [autoFaded, setAutoFaded] = useState(false);

  useEffect(() => {
    if (quality.tier === "medium" && !expanded) {
      const t = setTimeout(() => setAutoFaded(true), 4000);
      return () => clearTimeout(t);
    }
  }, [quality.tier, expanded]);

  if (autoFaded) return null;

  const headline =
    quality.reason === "compression"
      ? "We can sharpen this photo"
      : "We can make this photo sharper";
  const subtitle =
    quality.reason === "compression"
      ? "Image quality looks compressed - enhancement will help our AI detect items more accurately."
      : `This image is ${formatDimensions(quality.width, quality.height)} - we'll get better detection at higher resolution.`;

  // Compact pill for medium tier
  if (quality.tier === "medium" && !expanded) {
    return (
      <motion.button
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={() => setExpanded(true)}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium text-white"
        style={{ background: "rgba(0,0,0,0.7)", border: "0.5px solid rgba(0,255,136,0.3)" }}
      >
        <Sparkles className="w-3 h-3 text-[#00ff88]" />
        Tip: enhance for better results
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute top-0 left-0 right-0 z-20 mx-3 mt-3 rounded-md flex items-center gap-3 px-3 py-2"
      style={{
        background: "rgba(0,255,136,0.08)",
        border: "0.5px solid rgba(0,255,136,0.4)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Sparkles className="w-3.5 h-3.5 text-[#00ff88] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-white leading-tight">{headline}</div>
        <div className="text-[11px] text-white/60 leading-tight mt-0.5 truncate">{subtitle}</div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onEnhance}
          disabled={enhanceStatus === "enhancing" || enhanceStatus === "enhanced"}
          className="h-7 px-2.5 rounded text-[11px] font-semibold text-black bg-[#00ff88] hover:bg-[#00ff88]/90 transition-colors flex items-center gap-1 disabled:opacity-60"
        >
          {enhanceStatus === "enhancing" ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Enhancing</>
          ) : enhanceStatus === "enhanced" ? (
            <><Check className="w-3 h-3" /> Enhanced</>
          ) : (
            "Enhance"
          )}
        </button>
        <button
          onClick={onDismiss}
          className="h-7 px-2 rounded text-[11px] text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors"
        >
          Use anyway
        </button>
        <button
          onClick={onDismiss}
          className="text-white/40 hover:text-white p-0.5"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Photo strip
============================================================ */
function PhotoStrip({
  photos, activeId, onPick, onAddMore,
}: {
  photos: Photo[]; activeId: string | null;
  onPick: (id: string) => void;
  onAddMore: () => void;
}) {
  const dotColor = (s: PhotoStatus) =>
    s === "scanned" ? "#00ff88" : s === "scanning" ? "#fbbf24" : s === "failed" ? "#ef4444" : "#6b7280";
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {photos.map((p) => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            onClick={() => onPick(p.id)}
            className={cn(
              "relative flex-shrink-0 w-10 h-[30px] rounded overflow-hidden transition-all",
              active ? "ring-1 ring-[#00ff88]" : "opacity-70 hover:opacity-100"
            )}
            style={{ border: active ? "1.5px solid #00ff88" : "0.5px solid rgba(255,255,255,0.1)" }}
          >
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <span
              className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: dotColor(p.status), boxShadow: `0 0 4px ${dotColor(p.status)}` }}
            />
          </button>
        );
      })}
      <button
        onClick={onAddMore}
        className="flex-shrink-0 w-10 h-[30px] rounded flex items-center justify-center text-white/40 hover:text-white/80 hover:border-white/30 transition-colors"
        style={{ border: "0.5px dashed rgba(255,255,255,0.15)" }}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ============================================================
   Live inventory feed
============================================================ */
function LiveInventoryFeed({
  rooms, items, activeRoomId, onPickRoom, photos,
}: {
  rooms: Room[]; items: InventoryItem[];
  activeRoomId: string | null;
  onPickRoom: (id: string) => void;
  photos: Photo[];
}) {
  const now = Date.now();
  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const active = activeRoomId
    ? items.filter((i) => i.roomId === activeRoomId)
    : items;
  const others = rooms.filter((r) => r.id !== activeRoomId);

  const thumbFor = useCallback((item: InventoryItem) => {
    for (const p of photos) {
      const d = p.detections.find(
        (x) =>
          x.roomId === item.roomId &&
          x.itemName.toLowerCase() === item.name.toLowerCase(),
      );
      if (d) return { url: p.url, bbox: d.bbox };
    }
    return null;
  }, [photos]);

  return (
    <div
      className="rounded-lg flex flex-col"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        padding: 16,
        maxHeight: 600,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] text-white font-medium truncate">
          {activeRoom?.name || "All rooms"}
        </span>
        <span
          className="text-[11px] text-[#00ff88] font-medium px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,255,136,0.1)" }}
        >
          {active.reduce((s, i) => s + i.quantity, 0)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
        <AnimatePresence initial={false}>
          {active.length === 0 && (
            <div className="text-[12px] text-white/30 italic py-2">Detecting items…</div>
          )}
          {active.map((it) => {
            const isNew = now - it.detectedAt < 2500;
            const lowConf = it.confidence < 70;
            const thumb = thumbFor(it);
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center gap-3 rounded-md transition-colors group/item hover:bg-white/[0.03]",
                  isNew && "bg-[#00ff88]/[0.06] border-[0.5px] border-[#00ff88]/20"
                )}
                style={{ minHeight: 52, padding: "6px 8px" }}
              >
                <div
                  className="w-10 h-10 rounded-md flex-shrink-0 overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {thumb ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${thumb.url})`,
                        backgroundSize: `${100 / Math.max(thumb.bbox.width, 0.05)}% ${100 / Math.max(thumb.bbox.height, 0.05)}%`,
                        backgroundPosition: `${(thumb.bbox.x / Math.max(1 - thumb.bbox.width, 0.0001)) * 100}% ${(thumb.bbox.y / Math.max(1 - thumb.bbox.height, 0.0001)) * 100}%`,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isNew && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#00ff88] flex-shrink-0"
                        style={{ boxShadow: "0 0 4px rgba(0,255,136,0.7)" }}
                      />
                    )}
                    {lowConf && !isNew && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    )}
                    <span className="text-[13px] text-white font-medium truncate leading-tight">
                      {it.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#7d8694] mt-0.5 truncate">
                    {Math.round(it.weight * it.quantity)} lb · {Math.round(it.cubicFeet * it.quantity)} cu ft
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {lowConf ? (
                    <span className="text-[11px] text-amber-400 font-medium">verify</span>
                  ) : (
                    <span className="text-[14px] text-[#00ff88] font-medium">×{it.quantity}</span>
                  )}
                  <button
                    className="opacity-0 group-hover/item:opacity-100 text-white/40 hover:text-white transition-opacity"
                    aria-label="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {others.length > 0 && activeRoomId && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
          {others.map((r) => {
            const count = items.filter((i) => i.roomId === r.id).reduce((s, i) => s + i.quantity, 0);
            return (
              <button
                key={r.id}
                onClick={() => onPickRoom(r.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/[0.03] opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full" style={{ background: r.color }} />
                  <span className="text-[12px] text-white/80">{r.name}</span>
                </div>
                <span
                  className="text-[11px] text-[#00ff88] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(0,255,136,0.08)" }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Stats bar
============================================================ */
function StatsBar({
  items, roomCount, onReview, disabled,
}: {
  items: InventoryItem[];
  roomCount: number;
  onReview: () => void;
  disabled: boolean;
}) {
  const totals = useMemo(() => {
    let qty = 0, wt = 0, cf = 0;
    for (const i of items) {
      qty += i.quantity;
      wt += i.weight * i.quantity;
      cf += i.cubicFeet * i.quantity;
    }
    return { qty, wt, cf };
  }, [items]);

  return (
    <div
      className="rounded-lg flex items-center justify-between"
      style={{
        background:
          "linear-gradient(90deg, rgba(0,255,136,0.04), transparent 50%, rgba(0,255,136,0.04))",
        border: "0.5px solid rgba(0,255,136,0.12)",
        padding: "16px 24px",
        minHeight: 64,
      }}
    >
      <div className="flex items-center gap-5 lg:gap-7">
        <Stat label="Items" value={totals.qty.toString()} />
        <span className="w-px h-7 bg-white/10" />
        <Stat label="Weight" value={`${totals.wt.toLocaleString()} lb`} />
        <span className="w-px h-7 bg-white/10" />
        <Stat label="Volume" value={`${Math.round(totals.cf)} cu ft`} />
        <span className="w-px h-7 bg-white/10" />
        <Stat label="Rooms" value={roomCount.toString()} />
      </div>
      <button
        onClick={onReview}
        disabled={disabled}
        className={cn(
          "rounded-lg font-semibold transition-all flex items-center gap-2",
          disabled
            ? "bg-white/5 text-white/30 cursor-not-allowed"
            : "bg-[#00ff88] text-black hover:bg-[#00ff88] hover:shadow-[0_0_24px_rgba(0,255,136,0.3)]"
        )}
        style={{ height: 44, padding: "0 28px", fontSize: 16 }}
      >
        Review inventory →
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.06em] text-[#7d8694] font-medium leading-tight">
        {label}
      </span>
      <span className="text-[18px] lg:text-[20px] text-white font-medium leading-tight mt-0.5">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   Sample data (for "Try with sample")
============================================================ */
const SAMPLE_PHOTOS = [
  {
    name: "Living Room",
    color: "#3b82f6",
    detections: [
      { name: "3-Seat Sofa", conf: 96, bbox: { x: 0.08, y: 0.45, width: 0.55, height: 0.4 }, cuft: 50, wt: 350 },
      { name: "Coffee Table", conf: 91, bbox: { x: 0.25, y: 0.7, width: 0.3, height: 0.18 }, cuft: 8, wt: 56 },
      { name: "TV Stand", conf: 88, bbox: { x: 0.7, y: 0.5, width: 0.25, height: 0.3 }, cuft: 15, wt: 105 },
      { name: "Floor Lamp", conf: 82, bbox: { x: 0.02, y: 0.15, width: 0.08, height: 0.55 }, cuft: 5, wt: 25 },
    ],
  },
  {
    name: "Bedroom",
    color: "#a855f7",
    detections: [
      { name: "Queen Bed", conf: 97, bbox: { x: 0.15, y: 0.35, width: 0.65, height: 0.5 }, cuft: 65, wt: 455 },
      { name: "Nightstand", conf: 89, bbox: { x: 0.82, y: 0.5, width: 0.15, height: 0.25 }, cuft: 5, wt: 35 },
      { name: "Dresser", conf: 93, bbox: { x: 0.05, y: 0.4, width: 0.18, height: 0.4 }, cuft: 40, wt: 280 },
    ],
  },
  {
    name: "Kitchen",
    color: "#f59e0b",
    detections: [
      { name: "Refrigerator", conf: 98, bbox: { x: 0.6, y: 0.1, width: 0.3, height: 0.75 }, cuft: 60, wt: 420 },
      { name: "Microwave", conf: 84, bbox: { x: 0.15, y: 0.3, width: 0.18, height: 0.15 }, cuft: 4, wt: 28 },
    ],
  },
  {
    name: "Dining Room",
    color: "#fb7185",
    detections: [
      { name: "Dining Table", conf: 95, bbox: { x: 0.2, y: 0.4, width: 0.6, height: 0.35 }, cuft: 35, wt: 245 },
      { name: "Dining Chair", conf: 88, bbox: { x: 0.05, y: 0.5, width: 0.15, height: 0.4 }, cuft: 5, wt: 35 },
      { name: "Dining Chair", conf: 87, bbox: { x: 0.8, y: 0.5, width: 0.15, height: 0.4 }, cuft: 5, wt: 35 },
    ],
  },
  {
    name: "Office",
    color: "#14b8a6",
    detections: [
      { name: "Desk", conf: 94, bbox: { x: 0.1, y: 0.4, width: 0.55, height: 0.35 }, cuft: 30, wt: 210 },
      { name: "Office Chair", conf: 90, bbox: { x: 0.65, y: 0.45, width: 0.22, height: 0.45 }, cuft: 12, wt: 45 },
      { name: "Bookshelf", conf: 86, bbox: { x: 0, y: 0.05, width: 0.18, height: 0.85 }, cuft: 25, wt: 175 },
    ],
  },
];

const SAMPLE_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80",
  "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=900&q=80",
  "https://images.unsplash.com/photo-1593476550610-87baa860004a?w=900&q=80",
];

/* ============================================================
   MAIN PAGE
============================================================ */
export default function InventoryScan() {
  const navigate = useNavigate();
  const [state, setState] = useState<ScannerState>("empty");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [scanCursor, setScanCursor] = useState(0);   // # photos finished
  const [isSample, setIsSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPhotos = photos.length;
  const scanComplete = totalPhotos > 0 && photos.every((p) => p.status === "scanned" || p.status === "failed");
  const etaSec = Math.max(0, (totalPhotos - scanCursor) * 4);
  const activePhoto = photos.find((p) => p.id === activePhotoId) ?? null;

  /* ----- Ensure room exists ----- */
  const ensureRoom = useCallback((roomId: string) => {
    setRooms((prev) => {
      if (prev.find((r) => r.id === roomId)) return prev;
      const palette = ROOM_PALETTE.find((p) => p.id === roomId)
        || { id: roomId, name: roomId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), color: "#9ca3af" };
      return [...prev, { ...palette, detectedAt: Date.now() }];
    });
  }, []);

  /* ----- File handler ----- */
  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const slice = files.slice(0, 50);
    const dims = await Promise.all(slice.map((f) => getImageDimensions(f)));
    const newPhotos: Photo[] = slice.map((file, i) => {
      const { width, height } = dims[i];
      const quality = checkPhotoQuality(file.size, width, height);
      return {
        id: uid(),
        file,
        url: URL.createObjectURL(file),
        roomId: "",
        autoTagged: true,
        status: "pending",
        detections: [],
        width,
        height,
        quality,
        enhanceStatus: "idle",
        qualityDismissed: false,
      };
    });
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (state === "empty") setState("scanning");
    if (!activePhotoId && newPhotos[0]) setActivePhotoId(newPhotos[0].id);
  }, [state, activePhotoId]);

  /* ----- Dismiss / enhance handlers ----- */
  const dismissQuality = useCallback((photoId: string) => {
    setPhotos((prev) => prev.map((p) =>
      p.id === photoId ? { ...p, qualityDismissed: true } : p
    ));
  }, []);

  const enhancePhoto = useCallback(async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo || !photo.file) {
      setPhotos((prev) => prev.map((p) =>
        p.id === photoId ? { ...p, qualityDismissed: true } : p
      ));
      return;
    }
    setPhotos((prev) => prev.map((p) =>
      p.id === photoId ? { ...p, enhanceStatus: "enhancing" } : p
    ));
    try {
      const dataUrl = await fileToDataUrl(photo.file);
      const { data, error } = await supabase.functions.invoke("enhance-image", {
        body: { imageUrl: dataUrl },
      });
      if (error) throw error;
      const enhancedUrl: string | undefined = data?.enhancedUrl;
      if (!enhancedUrl) throw new Error("No enhanced image returned");
      setPhotos((prev) => prev.map((p) =>
        p.id === photoId
          ? { ...p, url: enhancedUrl, dataUrl: enhancedUrl, enhanceStatus: "enhanced", qualityDismissed: true }
          : p
      ));
      toast({ title: "Photo sharpened", description: "We'll use the higher-resolution version for detection." });
    } catch (err: any) {
      console.error("enhance error", err);
      setPhotos((prev) => prev.map((p) =>
        p.id === photoId ? { ...p, enhanceStatus: "failed" } : p
      ));
      toast({ title: "Couldn't enhance photo", description: "We'll continue with the original." });
    }
  }, [photos]);

  /* ----- Sample loader ----- */
  const loadSample = useCallback(() => {
    setIsSample(true);
    const newPhotos: Photo[] = SAMPLE_PHOTOS.map((s, idx) => ({
      id: uid(),
      url: SAMPLE_IMAGE_URLS[idx],
      roomId: "",
      autoTagged: true,
      status: "pending",
      detections: [],
    }));
    setPhotos(newPhotos);
    setActivePhotoId(newPhotos[0].id);
    setState("scanning");
  }, []);

  /* ----- Scan a single real photo via edge function ----- */
  const scanRealPhoto = async (photo: Photo) => {
    if (!photo.file) return;
    setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, status: "scanning" } : p));
    try {
      const dataUrl = await fileToDataUrl(photo.file);
      const { data, error } = await supabase.functions.invoke("detect-inventory", {
        body: { imageUrl: dataUrl },
      });
      if (error) throw error;
      const raw: any[] = data?.items || [];
      const itemNames = raw.map((r) => r.name);

      // Prefer Gemini's room classification when confident enough; otherwise fall back to keyword heuristic.
      const geminiRoom: string | null = typeof data?.room === "string" ? data.room : null;
      const geminiRoomConf: number = typeof data?.roomConfidence === "number" ? data.roomConfidence : 0;
      let roomId: string;
      let auto = true;
      if (geminiRoom && geminiRoomConf >= 0.6) {
        roomId = roomNameToId(geminiRoom);
      } else {
        const fallback = detectRoomFromItems(itemNames);
        roomId = fallback.roomId;
        auto = fallback.auto;
      }
      ensureRoom(roomId);

      const detections: Detection[] = raw.map((it) => ({
        id: uid(),
        itemName: it.name,
        confidence: it.confidence ?? 80,
        bbox: it.box || { x: 0, y: 0, width: 0, height: 0 },
        cubicFeet: it.cubicFeet || 5,
        weight: it.weight || 35,
        photoId: photo.id,
        roomId,
      }));

      setPhotos((prev) => prev.map((p) =>
        p.id === photo.id
          ? { ...p, status: "scanned", detections, dataUrl, roomId, autoTagged: auto }
          : p
      ));

      // Merge into items
      setItems((prev) => {
        const next = [...prev];
        const now = Date.now();
        for (const d of detections) {
          const idx = next.findIndex((i) => i.roomId === roomId && i.name.toLowerCase() === d.itemName.toLowerCase());
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: next[idx].quantity + 1, detectedAt: now };
          } else {
            next.push({
              id: uid(),
              name: d.itemName,
              quantity: 1,
              cubicFeet: d.cubicFeet,
              weight: d.weight,
              roomId,
              confidence: d.confidence,
              detectedAt: now,
            });
          }
        }
        return next;
      });
    } catch (err: any) {
      console.error("scan error", err);
      setPhotos((prev) => prev.map((p) =>
        p.id === photo.id ? { ...p, status: "failed" } : p
      ));
    } finally {
      setScanCursor((c) => c + 1);
    }
  };

  /* ----- Scan a sample photo (no API call) ----- */
  const scanSamplePhoto = async (photo: Photo, sampleIdx: number) => {
    setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, status: "scanning" } : p));
    await new Promise((r) => setTimeout(r, 1200));
    const sample = SAMPLE_PHOTOS[sampleIdx];
    const itemNames = sample.detections.map((d) => d.name);
    const { roomId, auto } = detectRoomFromItems(itemNames);
    ensureRoom(roomId);

    const detections: Detection[] = sample.detections.map((d) => ({
      id: uid(),
      itemName: d.name,
      confidence: d.conf,
      bbox: d.bbox,
      cubicFeet: d.cuft,
      weight: d.wt,
      photoId: photo.id,
      roomId,
    }));

    setPhotos((prev) => prev.map((p) =>
      p.id === photo.id ? { ...p, status: "scanned", detections, roomId, autoTagged: auto } : p
    ));

    setItems((prev) => {
      const next = [...prev];
      const now = Date.now();
      for (const d of detections) {
        const idx = next.findIndex((i) => i.roomId === roomId && i.name.toLowerCase() === d.itemName.toLowerCase());
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1, detectedAt: now };
        } else {
          next.push({
            id: uid(),
            name: d.itemName,
            quantity: 1,
            cubicFeet: d.cubicFeet,
            weight: d.weight,
            roomId,
            confidence: d.confidence,
            detectedAt: now,
          });
        }
      }
      return next;
    });
    setScanCursor((c) => c + 1);
  };

  /* ----- Drive the scan queue ----- */
  const scanningRef = useRef(false);
  useEffect(() => {
    if (state !== "scanning" || scanningRef.current) return;
    const queue = photos.filter((p) => p.status === "pending");
    if (queue.length === 0) return;
    scanningRef.current = true;

    (async () => {
      for (const p of queue) {
        setActivePhotoId(p.id);
        if (isSample) {
          const idx = photos.findIndex((x) => x.id === p.id);
          await scanSamplePhoto(p, idx);
        } else {
          await scanRealPhoto(p);
        }
      }
      scanningRef.current = false;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, photos.length, isSample]);

  /* ----- Manual room reassignment ----- */
  const reassignPhoto = (photoId: string, newRoomId: string) => {
    ensureRoom(newRoomId);
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;
    const oldRoomId = photo.roomId;

    setPhotos((prev) => prev.map((p) => p.id === photoId
      ? { ...p, roomId: newRoomId, autoTagged: false, detections: p.detections.map((d) => ({ ...d, roomId: newRoomId })) }
      : p
    ));

    setItems((prev) => {
      // Move all items from this photo's old room over
      // Simplification: rebuild from detections of all photos
      const allDetections: Detection[] = photos.map((p) =>
        p.id === photoId ? { ...p, roomId: newRoomId, detections: p.detections.map(d => ({ ...d, roomId: newRoomId })) } : p
      ).flatMap((p) => p.detections);

      const merged: InventoryItem[] = [];
      const now = Date.now();
      for (const d of allDetections) {
        const idx = merged.findIndex((m) => m.roomId === d.roomId && m.name.toLowerCase() === d.itemName.toLowerCase());
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + 1 };
        } else {
          merged.push({
            id: uid(), name: d.itemName, quantity: 1,
            cubicFeet: d.cubicFeet, weight: d.weight,
            roomId: d.roomId, confidence: d.confidence,
            detectedAt: now,
          });
        }
      }
      return merged;
    });

    const r = ROOM_PALETTE.find((p) => p.id === newRoomId);
    toast({ title: `Moved to ${r?.name || newRoomId}` });
  };

  /* ----- Add new room (manual) ----- */
  const handleAddRoom = () => {
    const name = window.prompt("Name your new room");
    if (!name) return;
    const id = `custom-${uid()}`;
    setRooms((prev) => [...prev, { id, name, color: "#00ff88", detectedAt: Date.now() }]);
  };

  /* ----- Add more files (during scanning) ----- */
  const triggerAddMore = () => fileInputRef.current?.click();

  const handleReview = () => {
    setState("complete");
    navigate("/online-estimate");
  };

  const itemsFound = items.reduce((s, i) => s + i.quantity, 0);
  const activeStep = state === "empty" || state === "scanning" ? 0 : 1;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <TopBar
        activeStep={activeStep}
        onSaveExit={() => navigate("/")}
      />

      {/* hidden file input for "add more" */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          handleFiles(files);
          e.target.value = "";
        }}
      />

      {state === "empty" && (
        <EmptyState onFiles={handleFiles} onSample={loadSample} />
      )}

      {state === "scanning" && (
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="max-w-[1100px] mx-auto space-y-3">
            <StatusBar
              current={Math.min(scanCursor + (scanComplete ? 0 : 1), totalPhotos)}
              total={totalPhotos}
              itemsFound={itemsFound}
              etaSec={etaSec}
            />

            <MiniDropzone
              uploaded={totalPhotos}
              scanned={photos.filter((p) => p.status === "scanned").length}
              onFiles={handleFiles}
            />

            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 240px" }}>
              {/* LEFT */}
              <div className="space-y-2 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <RoomChips
                    rooms={rooms}
                    items={items}
                    activeRoomId={activeRoomId}
                    onPick={setActiveRoomId}
                    onAdd={handleAddRoom}
                  />
                  <button className="text-[10px] text-white/40 hover:text-white/70 flex items-center gap-1 flex-shrink-0">
                    <HelpCircle className="w-3 h-3" /> How it works
                  </button>
                </div>

                <ScannerCanvas
                  photo={activePhoto}
                  photoIndex={activePhoto ? photos.findIndex((p) => p.id === activePhoto.id) : 0}
                  totalPhotos={totalPhotos}
                  room={rooms.find((r) => r.id === activePhoto?.roomId)}
                  onChangeRoom={(rid) => activePhoto && reassignPhoto(activePhoto.id, rid)}
                  allRooms={rooms}
                  onEnhance={enhancePhoto}
                  onDismissQuality={dismissQuality}
                />

                <PhotoStrip
                  photos={photos}
                  activeId={activePhotoId}
                  onPick={setActivePhotoId}
                  onAddMore={triggerAddMore}
                />
              </div>

              {/* RIGHT */}
              <LiveInventoryFeed
                rooms={rooms}
                items={items}
                activeRoomId={activeRoomId ?? activePhoto?.roomId ?? null}
                onPickRoom={setActiveRoomId}
              />
            </div>

            <StatsBar
              items={items}
              onReview={handleReview}
              disabled={!scanComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
