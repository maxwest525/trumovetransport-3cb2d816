import { useState, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";


function ScrollFadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// Scroll to top on mount
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "AI-Powered Inventory Scanner | TruMove";
  }, []);
};
import { useNavigate, Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import ScanIntroModal from "@/components/estimate/ScanIntroModal";
import EstimatorNavToggle from "@/components/estimate/EstimatorNavToggle";
import LeadGateModal from "@/components/scan/LeadGateModal";
import ResumeVerifyModal from "@/components/scan/ResumeVerifyModal";

import logoImg from "@/assets/logo.png";
import { 
  Scan, Sparkles, ArrowRight, 
  Smartphone, Box, Clock, Shield, Zap, ChevronRight,
  Ruler, Package, Printer, Download, Square, Trash2, ArrowRightLeft,
  Phone, Video, Minus, Plus, X, Upload, ImageIcon, FolderOpen, Lock, User, Mail,
  Sofa, BedDouble, UtensilsCrossed, Bath, Warehouse, Check, Pause, Play,
  Camera, Layers, Info, Eye, Save, Loader2, AlertTriangle, Pencil, FolderPlus,
  MoreVertical, FolderInput, StickyNote
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import previewImage from "@/assets/scan-room-preview.jpg";
import sampleRoomLiving from "@/assets/sample-room-living.jpg";
import sampleRoomBedroom from "@/assets/sample-room-bedroom.jpg";
import sampleRoomKitchen from "@/assets/sample-room-kitchen.jpg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Furniture detection positions for bounding box overlays (matches sampleRoomLiving image)
const DEMO_FURNITURE_POSITIONS = [
  { id: 0, name: "Sofa", confidence: 98, top: "42%", left: "1%", width: "34%", height: "50%" },
  { id: 1, name: "Coffee Table", confidence: 96, top: "64%", left: "32%", width: "22%", height: "16%" },
  { id: 2, name: "TV Console", confidence: 97, top: "32%", left: "28%", width: "36%", height: "26%" },
  { id: 3, name: "Armchair", confidence: 94, top: "42%", left: "70%", width: "24%", height: "42%" },
  { id: 4, name: "Floor Lamp", confidence: 91, top: "16%", left: "60%", width: "7%", height: "44%" },
];

// Simulated detected items for the live demo
const DEMO_ITEMS = [
  // Living Room
  { id: 1, name: "3-Seat Sofa", room: "Living Room", weight: 350, cuft: 45, image: "/inventory/living-room/sofa-3-cushion.png" },
  { id: 2, name: "Coffee Table", room: "Living Room", weight: 45, cuft: 8, image: "/inventory/living-room/coffee-table.png" },
  { id: 3, name: "TV Stand", room: "Living Room", weight: 80, cuft: 12, image: "/inventory/living-room/tv-stand.png" },
  { id: 4, name: "Armchair", room: "Living Room", weight: 85, cuft: 18, image: "/inventory/living-room/armchair.png" },
  // Bedroom
  { id: 5, name: "Queen Bed", room: "Bedroom", weight: 180, cuft: 55, image: "/inventory/bedroom/bed-queen.png" },
  { id: 6, name: "Dresser", room: "Bedroom", weight: 150, cuft: 32, image: "/inventory/bedroom/dresser.png" },
  { id: 7, name: "Nightstand", room: "Bedroom", weight: 35, cuft: 6, image: "/inventory/bedroom/nightstand.png" },
  { id: 8, name: "Chest of Drawers", room: "Bedroom", weight: 120, cuft: 24, image: "/inventory/bedroom/chest-of-drawers.png" },
  // Kitchen
  { id: 9, name: "Kitchen Table", room: "Kitchen", weight: 85, cuft: 18, image: "/inventory/kitchen/kitchen-table.png" },
  { id: 10, name: "Kitchen Chair", room: "Kitchen", weight: 20, cuft: 4, image: "/inventory/kitchen/kitchen-chair.png" },
  { id: 11, name: "Microwave", room: "Kitchen", weight: 35, cuft: 3, image: "/inventory/appliances/microwave.png" },
  { id: 12, name: "Bar Stool", room: "Kitchen", weight: 25, cuft: 5, image: "/inventory/kitchen/bar-stool.png" },
];

// Sample preview items shown before scanning starts
const SAMPLE_PREVIEW_ITEMS = [
  { id: 101, name: "3-Seat Sofa", room: "Living Room", weight: 350, cuft: 45, image: "/inventory/living-room/sofa-3-cushion.png" },
  { id: 102, name: "Coffee Table", room: "Living Room", weight: 45, cuft: 8, image: "/inventory/living-room/coffee-table.png" },
  { id: 103, name: "Floor Lamp", room: "Living Room", weight: 15, cuft: 3, image: "/inventory/living-room/lamp-floor.png" },
  { id: 104, name: "Armchair", room: "Living Room", weight: 85, cuft: 18, image: "/inventory/living-room/armchair.png" },
  { id: 105, name: "TV Stand", room: "Living Room", weight: 80, cuft: 12, image: "/inventory/living-room/tv-stand.png" },
];

export default function ScanRoom() {
  useScrollToTop();
  const navigate = useNavigate();
  // Inventory item shape (allows optional photoId + boxIndex + confidence from AI scans)
  type InventoryItem = (typeof DEMO_ITEMS)[number] & { quantity: number; photoId?: string; boxIndex?: number; confidence?: number };
  type AiBox = { id: number; name: string; confidence: number; x: number; y: number; width: number; height: number };

  // Persistent state — survives refresh, navigation, and tab close (auto-expires after 7 days)
  const STORAGE_KEY = "trumove_scan_room_state_v1";
  const PERSIST_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  type PersistedScanPhoto = { id: string; url: string; name: string; boxes: AiBox[] };
  type PersistedShape = {
    detectedItems?: InventoryItem[];
    isUnlocked?: boolean;
    savedLeadId?: string | null;
    scanHistory?: PersistedScanPhoto[];
    uploadedPhotos?: { id: string; url: string; name: string }[];
    scannedPhotoIds?: string[];
    // Customer-defined folder names. Persisted separately from photos so an
    // empty folder still survives a refresh until the user removes it.
    customFolders?: string[];
    // Per-photo notes keyed by photo id (e.g. "fragile, do not stack").
    // Persisted alongside the photos so notes survive a refresh and the
    // server-side save sends them through to the CRM.
    photoNotes?: Record<string, string>;
    savedAt?: number;
  };
  const loadPersisted = (): PersistedShape | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedShape;
      // Expire stale data so anonymous browser storage doesn't pile up
      if (!parsed.savedAt || Date.now() - parsed.savedAt > PERSIST_TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  };
  const persisted = loadPersisted();

  const [detectedItems, setDetectedItems] = useState<InventoryItem[]>(
    persisted?.detectedItems ?? []
  );

  // Merge helper: if an item with same name+room already exists, bump quantity instead of adding a new row
  const addOrMergeItem = (incoming: Omit<InventoryItem, "quantity"> & { quantity?: number }) => {
    const addQty = incoming.quantity ?? 1;
    setDetectedItems(prev => {
      const key = (n: string, r: string) => `${n.trim().toLowerCase()}|${r.trim().toLowerCase()}`;
      const targetKey = key(incoming.name, incoming.room);
      const idx = prev.findIndex(i => key(i.name, i.room) === targetKey);
      if (idx >= 0) {
        const next = [...prev];
        // Keep highest confidence when merging duplicates
        const mergedConfidence = Math.max(next[idx].confidence ?? 0, incoming.confidence ?? 0) || undefined;
        next[idx] = { ...next[idx], quantity: next[idx].quantity + addQty, confidence: mergedConfidence };
        return next;
      }
      return [...prev, { ...incoming, quantity: addQty } as InventoryItem];
    });
  };
  const [isScanning, setIsScanning] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  // Confirmation gate for deleting a custom folder that still has photos.
  // Holds the folder name pending confirmation; null when no dialog is open.
  // Empty folders bypass this and delete immediately (nothing to lose).
  const [pendingDeleteFolder, setPendingDeleteFolder] = useState<string | null>(null);
  
  // Demo step state: 0=idle, 1=photo added to library, 2=photo in scanner, 3+=items detecting
  const [demoStep, setDemoStep] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const isDemoActive = demoStep > 0;
  const DEMO_TOTAL_STEPS = 2 + DEMO_ITEMS.length;
  
  // Lead capture state — AI scan is locked until visitor provides contact info
  const [isUnlocked, setIsUnlocked] = useState(persisted?.isUnlocked ?? false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  // Action to perform once the gate is unlocked (e.g. open uploader, start scan)
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
  
  // Sample room photos for the library demo
  const samplePhotos = [
    { id: 'sample-1', url: sampleRoomLiving, name: 'Living Room' },
    { id: 'sample-2', url: sampleRoomBedroom, name: 'Master Bedroom' },
    { id: 'sample-3', url: sampleRoomKitchen, name: 'Kitchen' },
  ];
  
  const [uploadedPhotos, setUploadedPhotos] = useState<{ id: string; url: string; name: string }[]>([]);
  const [scannedPhotoIds, setScannedPhotoIds] = useState<Set<string>>(new Set());
  const [pendingRoomLabel, setPendingRoomLabel] = useState<string>("");
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  // Tracks an in-app drag of an existing library photo (not an OS file drop).
  // We use a separate flag from isDraggingFiles so the file-drop overlay
  // doesn't fire when the customer is just reorganizing folders.
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  // Multi-select state for batch operations (drag many photos into a folder
  // at once). `selectionMode` toggles persistent checkboxes; without it,
  // shift-click on tiles still works to build an ad-hoc selection.
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  // Anchor for shift-click range selection within the visible flat list.
  const [lastSelectedPhotoId, setLastSelectedPhotoId] = useState<string | null>(null);
  // Mobile fallback for HTML5 drag (touch devices don't fire dragstart). A
  // 500ms press on any tile opens the per-tile "Move to..." dropdown, giving
  // phone users the same reclassify capability as desktop drag.
  const [longPressMenuPhotoId, setLongPressMenuPhotoId] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  // Customer-defined folders (e.g. "Garage Loft", "Office"). Stored separately
  // from photos so an empty folder still renders until removed. Seeded from
  // persisted state so the list survives a refresh.
  const [customFolders, setCustomFolders] = useState<string[]>(persisted?.customFolders ?? []);
  // Inline UI state for the header "+ Folder" affordance and per-folder rename.
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderDraft, setNewFolderDraft] = useState("");
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  // Per-photo notes keyed by photo id. Free-text the customer types about a
  // specific photo (e.g. "fragile, do not stack"). Seeded from persisted state
  // so notes survive a refresh, and sent to the CRM via save-scan-room.
  const [photoNotes, setPhotoNotes] = useState<Record<string, string>>(persisted?.photoNotes ?? {});
  // Which tile currently has its note popover open. Drives the controlled
  // Popover so we can also clear it after save.
  const [openNotePhotoId, setOpenNotePhotoId] = useState<string | null>(null);
  // Working draft inside the popover textarea (kept separate from photoNotes
  // so cancelling doesn't lose the saved value).
  const [noteDraft, setNoteDraft] = useState("");
  const roomUploadRef = useRef<HTMLInputElement>(null);
  const allUploadRef = useRef<HTMLInputElement>(null);

  // Folders the customer cannot rename or delete: "All" is the protected
  // default bucket; KNOWN_ROOMS are canonical labels parsed from photo names.
  const KNOWN_ROOMS = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Garage", "Storage"];
  const PROTECTED_FOLDERS = new Set(["All", ...KNOWN_ROOMS]);
  const parseRoom = (name: string) => {
    const sep = name.indexOf(" - ");
    if (sep === -1) return "All";
    const candidate = name.slice(0, sep).trim();
    return candidate.length > 0 ? candidate : "All";
  };

  // Move a photo into a different folder by rewriting its `name` to the
  // "<Room> - <rest>" prefix that parseRoom() reads. This is what gets
  // persisted to localStorage in the autosave effect, so the new grouping
  // survives a refresh. Dropping into "All" strips the prefix entirely.
  // (single-photo reclassify removed; reclassifyPhotosToFolder handles both)

  // Batch variant for moving many selected photos in a single drag op.
  // Done in one setState pass so localStorage autosave fires once.
  const reclassifyPhotosToFolder = (photoIds: Set<string>, targetRoom: string) => {
    if (photoIds.size === 0) return;
    setUploadedPhotos((prev) =>
      prev.map((p) => {
        if (!photoIds.has(p.id)) return p;
        const sep = p.name.indexOf(" - ");
        const baseName = sep === -1 ? p.name : p.name.slice(sep + 3);
        const cleanBase = baseName.trim() || "photo";
        const newName = targetRoom === "All" ? cleanBase : `${targetRoom} - ${cleanBase}`;
        return { ...p, name: newName };
      })
    );
  };

  // Add a new custom folder. Names are normalized (trim + collapse spaces),
  // case-insensitively de-duped against existing folders + photo-derived
  // groups, and capped at 40 chars to keep the UI compact.
  const addCustomFolder = (rawName: string) => {
    const cleaned = rawName.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!cleaned) return;
    const existing = new Set([
      ...PROTECTED_FOLDERS,
      ...customFolders,
      ...uploadedPhotos.map((p) => parseRoom(p.name)),
    ].map((n) => n.toLowerCase()));
    if (existing.has(cleaned.toLowerCase())) {
      toast({ title: "Folder already exists", description: `"${cleaned}" is already in your library.` });
      return;
    }
    setCustomFolders((prev) => [...prev, cleaned]);
    toast({ title: `Folder "${cleaned}" added`, description: "Drag photos here to organize them." });
  };

  // Rename a folder: update the customFolders list AND rewrite every photo's
  // name prefix so the grouping moves with the rename. "All" and known rooms
  // are protected to avoid accidentally orphaning canonical buckets.
  const renameFolderTo = (oldName: string, rawNewName: string) => {
    const cleaned = rawNewName.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!cleaned || cleaned === oldName) {
      setRenamingFolder(null);
      return;
    }
    if (PROTECTED_FOLDERS.has(oldName)) {
      toast({ title: "This folder cannot be renamed", description: `"${oldName}" is a default folder.` });
      setRenamingFolder(null);
      return;
    }
    const conflict = new Set([
      ...PROTECTED_FOLDERS,
      ...customFolders.filter((n) => n !== oldName),
      ...uploadedPhotos.map((p) => parseRoom(p.name)).filter((n) => n !== oldName),
    ].map((n) => n.toLowerCase()));
    if (conflict.has(cleaned.toLowerCase())) {
      toast({ title: "Name already in use", description: `Pick a different name than "${cleaned}".` });
      return;
    }
    setCustomFolders((prev) => prev.map((n) => (n === oldName ? cleaned : n)));
    setUploadedPhotos((prev) =>
      prev.map((p) => {
        if (parseRoom(p.name) !== oldName) return p;
        const sep = p.name.indexOf(" - ");
        const baseName = sep === -1 ? p.name : p.name.slice(sep + 3);
        return { ...p, name: `${cleaned} - ${baseName.trim() || "photo"}` };
      })
    );
    setRenamingFolder(null);
    toast({ title: `Renamed to "${cleaned}"`, description: "Photos in this folder were updated." });
  };

  // Remove a custom folder. If it still contains photos, those photos fall
  // back into "All" by stripping their room prefix.
  const removeCustomFolder = (name: string) => {
    if (PROTECTED_FOLDERS.has(name)) return;
    setCustomFolders((prev) => prev.filter((n) => n !== name));
    setUploadedPhotos((prev) =>
      prev.map((p) => {
        if (parseRoom(p.name) !== name) return p;
        const sep = p.name.indexOf(" - ");
        const baseName = sep === -1 ? p.name : p.name.slice(sep + 3);
        return { ...p, name: baseName.trim() || "photo" };
      })
    );
    toast({ title: `Folder "${name}" removed`, description: "Any photos inside moved to All." });
  };

  const handleRoomClick = (roomLabel: string) => {
    // Gate uploads behind the lead capture form
    if (!isUnlocked) {
      setPendingAction(() => () => handleRoomClick(roomLabel));
      setShowLeadGate(true);
      return;
    }
    setPendingRoomLabel(roomLabel);
    if (roomUploadRef.current) {
      roomUploadRef.current.value = "";
      roomUploadRef.current.click();
    }
  };

  // Default upload path - dumps everything into the "All" folder
  const handleAllUploadClick = () => {
    if (!isUnlocked) {
      setPendingAction(() => () => handleAllUploadClick());
      setShowLeadGate(true);
      return;
    }
    if (allUploadRef.current) {
      allUploadRef.current.value = "";
      allUploadRef.current.click();
    }
  };

  const ingestFiles = (files: FileList | File[], roomLabel: string) => {
    // Count what we actually accepted (image/video only) so the toast reflects
    // reality, not the raw file count which may include unsupported types.
    let acceptedCount = 0;
    const targetFolder = roomLabel || "All";
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
      acceptedCount += 1;
      const url = URL.createObjectURL(file);
      setUploadedPhotos((prev) => [
        ...prev,
        {
          id: `photo-${Date.now()}-${Math.random()}`,
          url,
          name: `${targetFolder} - ${file.name}`,
        },
      ]);
    });
    if (acceptedCount > 0) {
      toast({
        title: `Saved ${acceptedCount} ${acceptedCount === 1 ? "photo" : "photos"} to ${targetFolder}`,
        description: "Your upload is captured and ready to scan.",
      });
    }
  };

  const handleRoomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) ingestFiles(files, pendingRoomLabel || "All");
    setPendingRoomLabel("");
  };

  const handleAllUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) ingestFiles(files, "All");
  };

  // Drag-and-drop handlers - dropped files always land in "All"
  const handleLibraryDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDraggingFiles) setIsDraggingFiles(true);
  };
  const handleLibraryDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) setIsDraggingFiles(false);
  };
  const handleLibraryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    if (!isUnlocked) {
      setPendingAction(() => () => handleAllUploadClick());
      setShowLeadGate(true);
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      ingestFiles(e.dataTransfer.files, "All");
    }
  };

  // Demo step handler
  const handleNextDemoStep = () => {
    const nextStep = demoStep + 1;
    if (nextStep === 1) {
      // Step 1: Add sample photo to library
      setUploadedPhotos([{ id: 'demo-photo', url: sampleRoomLiving, name: 'Living Room' }]);
      setDetectedItems([]);
      setDemoStep(1);
    } else if (nextStep === 2) {
      // Step 2: Photo moves to scanner
      setScannedPhotoIds(new Set(['demo-photo']));
      setIsScanning(true);
      setDemoStep(2);
    } else if (nextStep <= DEMO_TOTAL_STEPS) {
      // Steps 3+: Add items one by one
      const itemIndex = nextStep - 3;
      addOrMergeItem({ ...DEMO_ITEMS[itemIndex] });
      setDemoStep(nextStep);
      if (nextStep === DEMO_TOTAL_STEPS) {
        setIsScanning(false);
      }
    }
  };

  const handleStopDemo = () => {
    setDemoStep(0);
    setDemoPlaying(false);
    setIsScanning(false);
    setUploadedPhotos(prev => prev.filter(p => p.id !== 'demo-photo'));
    setScannedPhotoIds(new Set());
    setActiveScanPhoto(null);
    setAiBoxes([]);
    setRevealedBoxCount(0);
    setScanHistory([]);
    setDetectionView(null);
  };

  // Auto-advance demo when playing
  useEffect(() => {
    if (demoPlaying && isDemoActive && demoStep < DEMO_TOTAL_STEPS) {
      const delay = demoStep === 0 ? 800 : demoStep < 3 ? 1500 : 2000;
      const timer = setTimeout(() => {
        handleNextDemoStep();
      }, delay);
      return () => clearTimeout(timer);
    }
    if (demoStep >= DEMO_TOTAL_STEPS) {
      setDemoPlaying(false);
    }
  }, [demoPlaying, demoStep]);

  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanProgress, setAiScanProgress] = useState({ current: 0, total: 0 });
  // Active photo being scanned (drives the live preview in the scanner panel)
  const [activeScanPhoto, setActiveScanPhoto] = useState<{ id: string; url: string; name: string } | null>(null);
  // AI-detected bounding boxes for the active photo (revealed progressively)
  const [aiBoxes, setAiBoxes] = useState<AiBox[]>([]);
  const [revealedBoxCount, setRevealedBoxCount] = useState(0);
  // History of every photo scanned by the AI (for thumbnails + per-item detection viewer)
  type ScannedPhotoEntry = { id: string; url: string; name: string; boxes: AiBox[] };
  const [scanHistory, setScanHistory] = useState<ScannedPhotoEntry[]>(persisted?.scanHistory ?? []);
  // Detection viewer modal state
  const [detectionView, setDetectionView] = useState<{ photo: ScannedPhotoEntry; boxId: number } | null>(null);

  // Auto-save state — every AI scan automatically pushes to the CRM
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedLeadId, setSavedLeadId] = useState<string | null>(persisted?.savedLeadId ?? null);

  // Resume banner — shown on initial load when persisted scan data was found
  const [hasResumableScan, setHasResumableScan] = useState<boolean>(
    !!persisted && (persisted.detectedItems?.length ?? 0) > 0
  );
  const [savedAtMs, setSavedAtMs] = useState<number | null>(persisted?.savedAt ?? null);
  // Tick every minute so "Saved X ago" stays fresh while the page is open
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (!hasResumableScan) return;
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [hasResumableScan]);

  // Human friendly "Saved X ago" string from a timestamp
  const formatSavedAgo = (ts: number) => {
    const diffMs = Math.max(0, nowTick - ts);
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return "Saved just now";
    if (mins < 60) return `Saved ${mins} minute${mins === 1 ? "" : "s"} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Saved ${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `Saved ${days} day${days === 1 ? "" : "s"} ago`;
  };

  // Saved scans are auto-purged after 7 days. Warn the user once they pass 5.
  const SCAN_TTL_DAYS = 7;
  const SCAN_STALE_WARN_DAYS = 5;
  const scanAgeDays = savedAtMs ? (nowTick - savedAtMs) / (1000 * 60 * 60 * 24) : 0;
  const isScanStale = !!savedAtMs && scanAgeDays >= SCAN_STALE_WARN_DAYS;
  const daysUntilExpiry = Math.max(0, Math.ceil(SCAN_TTL_DAYS - scanAgeDays));


  // Clear every trace of the previous scan from state + localStorage
  const startFreshScan = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDetectedItems([]);
    setScanHistory([]);
    setUploadedPhotos([]);
    setScannedPhotoIds(new Set());
    setActiveScanPhoto(null);
    setAiBoxes([]);
    setRevealedBoxCount(0);
    setSavedLeadId(null);
    setAutoSaveStatus("idle");
    setHasResumableScan(false);
    toast({ title: "Started a fresh scan", description: "Previous scan data was cleared." });
  };

  // Persist key state across refreshes / navigation / tab close
  useEffect(() => {
    try {
      // Strip volatile blob: URLs from items (they don't survive refresh anyway).
      // Permanent Supabase Storage URLs are kept so thumbnails reload after refresh.
      const isVolatile = (u?: string) => !u || u.startsWith("blob:");
      const slimItems = detectedItems.map(({ image, ...rest }) => ({
        ...rest,
        image: isVolatile(image) ? "" : image,
      }));
      // Only keep scan-history entries whose photo URL survives a refresh (i.e. uploaded to Storage)
      const slimHistory = scanHistory
        .filter((p) => !isVolatile(p.url))
        .map((p) => ({ id: p.id, url: p.url, name: p.name, boxes: p.boxes }));
      const slimUploaded = uploadedPhotos
        .filter((p) => !isVolatile(p.url) && p.id !== "demo-photo")
        .map((p) => ({ id: p.id, url: p.url, name: p.name }));
      const stamp = Date.now();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          detectedItems: slimItems,
          isUnlocked,
          savedLeadId,
          scanHistory: slimHistory,
          uploadedPhotos: slimUploaded,
          scannedPhotoIds: Array.from(scannedPhotoIds).filter((id) => id !== "demo-photo"),
          customFolders,
          savedAt: stamp,
        })
      );
      setSavedAtMs(stamp);
    } catch {
      // Quota or serialization failure — non-fatal
    }
  }, [detectedItems, isUnlocked, savedLeadId, scanHistory, uploadedPhotos, scannedPhotoIds, customFolders]);

  // Rehydrate uploadedPhotos + scannedPhotoIds on mount (separate so they don't fight initial demo state)
  useEffect(() => {
    if (persisted?.uploadedPhotos?.length) {
      setUploadedPhotos((prev) => (prev.length === 0 ? persisted.uploadedPhotos! : prev));
    }
    if (persisted?.scannedPhotoIds?.length) {
      setScannedPhotoIds((prev) => (prev.size === 0 ? new Set(persisted.scannedPhotoIds) : prev));
    }
    // customFolders is already seeded from persisted via useState initializer,
    // but if rehydration ever happens after mount we ensure it's not blown away.
    if (persisted?.customFolders?.length) {
      setCustomFolders((prev) => (prev.length === 0 ? persisted.customFolders! : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resume-link redemption is now a two-step flow:
  //   1. Hit the function with just the token to learn what verification
  //      challenge to render (last-4 of phone, or email on file).
  //   2. Show the modal, collect the answer, and call the function again
  //      with { token, verification }. On success, rehydrate state.
  const [resumeToken, setResumeToken] = useState<string | null>(null);
  const [resumeChallenge, setResumeChallenge] = useState<"phone_last4" | "email" | null>(null);
  const [resumeEmailHint, setResumeEmailHint] = useState<string | null>(null);
  const [resumeVerifying, setResumeVerifying] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resume");
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "redeem-scan-resume-token",
          { body: { token } },
        );
        if (cancelled) return;
        if (error || !data || data.error) {
          toast({
            title: "Could not restore scan",
            description: data?.error || error?.message || "Link is invalid or expired.",
            variant: "destructive",
          });
          // Strip the bad token so refreshing doesn't retry endlessly
          const url = new URL(window.location.href);
          url.searchParams.delete("resume");
          window.history.replaceState({}, "", url.toString());
          return;
        }
        if (data.challenge) {
          setResumeToken(token);
          setResumeChallenge(data.challenge);
          setResumeEmailHint(data.emailHintMasked || null);
        }
      } catch (e) {
        console.error("Resume challenge fetch failed:", e);
        if (!cancelled) {
          toast({
            title: "Could not restore scan",
            description: "Please try the link again or contact your agent.",
            variant: "destructive",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2 of resume: customer answered the verification challenge. Re-call
  // the redeem function with the answer; on success, rehydrate the scan.
  const handleResumeVerify = async (answer: string) => {
    if (!resumeToken) return;
    setResumeVerifying(true);
    setResumeError(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "redeem-scan-resume-token",
        { body: { token: resumeToken, verification: answer } },
      );
      if (error || !data || data.error) {
        setResumeError(data?.error || error?.message || "Verification failed.");
        return;
      }

      const restoredItems: InventoryItem[] = (data.inventory ?? []).map(
        (it: any, idx: number) => ({
          id: 1_000_000 + idx,
          name: it.item_name,
          room: it.room || "Living Room",
          weight: Number(it.weight) || 0,
          cuft: Number(it.cubic_feet) || 0,
          image: "",
          quantity: Number(it.quantity) || 1,
          confidence: it.confidence ?? undefined,
        }),
      );

      const restoredHistory: ScannedPhotoEntry[] = (data.photos ?? []).map(
        (p: any) => ({
          id: p.id,
          url: p.photo_url,
          name: p.room_label || "Room",
          boxes: Array.isArray(p.detected_boxes) ? p.detected_boxes : [],
        }),
      );

      const restoredUploaded = (data.photos ?? []).map((p: any) => ({
        id: p.id,
        url: p.photo_url,
        name: p.room_label || "Room",
      }));

      setDetectedItems(restoredItems);
      setScanHistory(restoredHistory);
      setUploadedPhotos(restoredUploaded);
      setScannedPhotoIds(new Set(restoredUploaded.map((p) => p.id)));
      setSavedLeadId(data.leadId ?? null);
      setIsUnlocked(true);
      setHasResumableScan(restoredItems.length > 0);
      setSavedAtMs(Date.now());

      // Tear down the modal + strip the token from the URL
      setResumeToken(null);
      setResumeChallenge(null);
      setResumeEmailHint(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("resume");
      window.history.replaceState({}, "", url.toString());

      toast({
        title: "Scan restored",
        description: `${restoredItems.length} item${restoredItems.length === 1 ? "" : "s"} loaded from your saved session.`,
      });
    } catch (e) {
      console.error("Resume verification failed:", e);
      setResumeError("Could not verify. Please try again.");
    } finally {
      setResumeVerifying(false);
    }
  };

  const handleResumeCancel = () => {
    setResumeToken(null);
    setResumeChallenge(null);
    setResumeEmailHint(null);
    setResumeError(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("resume");
    window.history.replaceState({}, "", url.toString());
  };

  // Convert image URL (blob:) to base64 data URL for AI vision
  const urlToDataUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Run real Lovable AI vision detection on user uploaded photos.
  // Optional `folderName` scopes the scan to a single folder (e.g. "Living Room"
  // or a custom folder), which powers the per-folder "Scan this room" button.
  // Without it, every unscanned real photo is processed.
  const runRealAiScan = async (folderName?: string) => {
    const realPhotos = uploadedPhotos.filter(p => {
      if (p.id === 'demo-photo') return false;
      if (scannedPhotoIds.has(p.id)) return false;
      if (folderName && parseRoom(p.name) !== folderName) return false;
      return true;
    });
    if (realPhotos.length === 0) {
      toast({
        title: folderName ? `No new photos in "${folderName}"` : "No new photos to scan",
        description: folderName
          ? "Every photo in this folder has already been scanned, or the folder is empty."
          : "Upload room photos first.",
      });
      return;
    }

    setIsAiScanning(true);
    setIsScanning(true);
    setAiScanProgress({ current: 0, total: realPhotos.length });

    let nextId = Date.now();
    const allDetected: InventoryItem[] = [];
    let totalDetectedCount = 0;

    for (let i = 0; i < realPhotos.length; i++) {
      const photo = realPhotos[i];
      setAiScanProgress({ current: i + 1, total: realPhotos.length });
      // Show this photo in the scanner panel + reset boxes
      setActiveScanPhoto({ id: photo.id, url: photo.url, name: photo.name });
      setAiBoxes([]);
      setRevealedBoxCount(0);
      try {
        // Photo name often starts with "Living Room - filename.jpg"
        const roomHint = photo.name.includes(' - ') ? photo.name.split(' - ')[0] : undefined;
        const dataUrl = await urlToDataUrl(photo.url);
        const { data, error } = await supabase.functions.invoke('detect-inventory', {
          body: { imageUrl: dataUrl, roomHint },
        });

        if (error) {
          console.error('AI scan error', error);
          toast({ title: "Scan failed", description: error.message || "Could not analyze photo", variant: "destructive" });
          continue;
        }

        const items = (data?.items || []) as Array<{ name: string; room: string; quantity: number; cubicFeet: number; weight: number; confidence: number; box?: { x: number; y: number; width: number; height: number } }>;

        // Build the bounding boxes list (one box per detected item, regardless of quantity)
        const boxes: AiBox[] = items
          .filter(it => it.box && it.box.width > 0 && it.box.height > 0)
          .map((it, idx) => ({
            id: idx,
            name: it.name,
            confidence: it.confidence,
            x: it.box!.x,
            y: it.box!.y,
            width: it.box!.width,
            height: it.box!.height,
          }));
        setAiBoxes(boxes);

        // Save to scan history (so user can re-open this photo's detections)
        setScanHistory(prev => {
          const without = prev.filter(p => p.id !== photo.id);
          return [...without, { id: photo.id, url: photo.url, name: photo.name, boxes }];
        });

        // Progressively reveal boxes one-by-one, then add/merge the corresponding inventory rows
        for (let b = 0; b < boxes.length; b++) {
          await new Promise(res => setTimeout(res, 350));
          setRevealedBoxCount(b + 1);
          const it = items[b];
          if (!it) continue;
          const qty = Math.max(1, it.quantity || 1);
          const row: InventoryItem = {
            id: nextId++,
            name: it.name,
            room: it.room,
            weight: it.weight,
            cuft: it.cubicFeet,
            image: '',
            quantity: qty,
            photoId: photo.id,
            boxIndex: b,
            confidence: typeof it.confidence === 'number' ? it.confidence : undefined,
          };
          allDetected.push(row);
          addOrMergeItem(row);
          totalDetectedCount += qty;
        }

        // For any items without boxes (rare), still add them to inventory
        items.slice(boxes.length).forEach(it => {
          const qty = Math.max(1, it.quantity || 1);
          const row: InventoryItem = {
            id: nextId++,
            name: it.name,
            room: it.room,
            weight: it.weight,
            cuft: it.cubicFeet,
            image: '',
            quantity: qty,
            photoId: photo.id,
            confidence: typeof it.confidence === 'number' ? it.confidence : undefined,
          };
          allDetected.push(row);
          addOrMergeItem(row);
          totalDetectedCount += qty;
        });

        setScannedPhotoIds(prev => new Set([...prev, photo.id]));
        // Brief pause so the user can see the completed boxes before next photo
        await new Promise(res => setTimeout(res, 600));
      } catch (e) {
        console.error('Scan exception', e);
        toast({ title: "Scan error", description: "Something went wrong analyzing this photo.", variant: "destructive" });
      }
    }

    setIsAiScanning(false);
    setIsScanning(false);
    toast({
      title: `Scan complete!`,
      description: `Detected ${totalDetectedCount} items across ${realPhotos.length} photo(s).`,
    });

    // Auto-save the scan to the CRM in the background — silent, no UI prompt.
    // We rebuild the latest snapshots since React state from inside this loop is stale.
    setDetectedItems((current) => {
      setScanHistory((history) => {
        const totals = {
          weight: current.reduce((s, i) => s + i.weight * i.quantity, 0),
          cuft: current.reduce((s, i) => s + i.cuft * i.quantity, 0),
        };
        // Fire and forget
        autoSaveScanToCrm(current, history, totals);
        return history;
      });
      return current;
    });
  };

  // Per-folder scan: same lead-gate as the global "Scan Your Home" button,
  // but the AI detector only runs against photos inside this folder.
  const handleScanFolderClick = (folderName: string) => {
    if (isAiScanning) return;
    const folderHasUnscanned = uploadedPhotos.some(
      (p) => p.id !== 'demo-photo' && !scannedPhotoIds.has(p.id) && parseRoom(p.name) === folderName
    );
    if (!folderHasUnscanned) {
      toast({
        title: `Nothing new in "${folderName}"`,
        description: "Add photos here or scan a different folder.",
      });
      return;
    }
    if (!isUnlocked) {
      setPendingAction(() => () => runRealAiScan(folderName));
      setShowLeadGate(true);
      return;
    }
    runRealAiScan(folderName);
  };

  const handleStartScanClick = () => {
    const hasRealPhotos = uploadedPhotos.some(p => p.id !== 'demo-photo' && !scannedPhotoIds.has(p.id));
    if (hasRealPhotos && !isDemoActive) {
      // Real AI scan path — gate behind lead capture
      if (!isUnlocked) {
        setPendingAction(() => () => runRealAiScan());
        setShowLeadGate(true);
        return;
      }
      runRealAiScan();
    } else if (uploadedPhotos.length > 0 && !isDemoActive) {
      if (!isUnlocked) {
        setPendingAction(() => () => setShowIntroModal(true));
        setShowLeadGate(true);
        return;
      }
      setShowIntroModal(true);
    } else {
      // Demo stays free — no gate so visitors can preview the experience
      setDemoPlaying(true);
      handleNextDemoStep();
    }
  };

  const startDemo = () => {
    setDetectedItems([]);
    setIsScanning(true);
    setScannedPhotoIds(new Set(uploadedPhotos.map(p => p.id)));
  };

  const totalWeight = detectedItems.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const totalCuFt = detectedItems.reduce((sum, item) => sum + item.cuft * item.quantity, 0);

  const handlePrint = () => {
    window.print();
  };

  // Auto-persist scanned photos + detected inventory to a lead in the CRM (no UI prompt).
  // Merges into the visitor's anonymous lead when present, otherwise creates a placeholder lead.
  const autoSaveScanToCrm = async (
    itemsSnapshot: InventoryItem[],
    historySnapshot: ScannedPhotoEntry[],
    totals: { weight: number; cuft: number }
  ) => {
    if (itemsSnapshot.length === 0) return;
    setAutoSaveStatus("saving");

    try {
      // Pull contact info from any existing lead form data the visitor filled in
      let contact: { firstName?: string; lastName?: string; email?: string; phone?: string } = {};
      try {
        const stored = localStorage.getItem("tm_lead");
        if (stored) {
          const parsed = JSON.parse(stored);
          contact = {
            firstName: parsed.firstName || parsed.first_name,
            lastName: parsed.lastName || parsed.last_name,
            email: parsed.email,
            phone: parsed.phone,
          };
        }
      } catch {
        // ignore parse errors
      }
      const anonymousLeadId = localStorage.getItem("tm_anonymous_lead_id") || undefined;

      // Build photo payload from the AI scan history (only photos that produced inventory)
      const photoIds = Array.from(new Set(itemsSnapshot.map((it) => it.photoId).filter(Boolean) as string[]));
      const photoEntries = historySnapshot.filter((p) => photoIds.includes(p.id));

      const photos = await Promise.all(
        photoEntries.map(async (p) => {
          const dataUrl = await urlToDataUrl(p.url);
          const itemCount = itemsSnapshot.filter((it) => it.photoId === p.id).length;
          return {
            id: p.id,
            dataUrl,
            name: p.name,
            roomLabel: p.name?.includes(" - ") ? p.name.split(" - ")[0] : p.name,
            boxes: p.boxes,
            itemCount,
          };
        })
      );

      const items = itemsSnapshot.map((it) => {
        let detectionBox: { x: number; y: number; width: number; height: number } | undefined;
        if (it.photoId && typeof it.boxIndex === "number") {
          const photo = historySnapshot.find((p) => p.id === it.photoId);
          const box = photo?.boxes.find((b) => b.id === it.boxIndex);
          if (box) detectionBox = { x: box.x, y: box.y, width: box.width, height: box.height };
        }
        return {
          name: it.name,
          room: it.room,
          weight: it.weight,
          cubicFeet: it.cuft,
          quantity: it.quantity,
          confidence: it.confidence,
          photoLocalId: it.photoId,
          detectionBox,
        };
      });

      const { data, error } = await supabase.functions.invoke("save-scan-room", {
        body: {
          anonymousLeadId,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          photos,
          items,
          totalWeight: totals.weight,
          totalCubicFeet: totals.cuft,
          // Send the customer-defined folder list so it's mirrored on the lead
          // row in the CRM. Empty folders the customer created (but hasn't
          // filed photos into) still survive the round trip this way.
          customFolders,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Save failed");

      setSavedLeadId(data.leadId);
      setAutoSaveStatus("saved");

      // Swap volatile blob: URLs for permanent Supabase Storage URLs so thumbnails + history
      // survive a refresh. The edge function returns a localId -> publicUrl map.
      const photoMap = (data.photoMap || {}) as Record<string, string>;
      if (Object.keys(photoMap).length > 0) {
        setScanHistory((prev) =>
          prev.map((p) => (photoMap[p.id] ? { ...p, url: photoMap[p.id] } : p))
        );
        setUploadedPhotos((prev) =>
          prev.map((p) => (photoMap[p.id] ? { ...p, url: photoMap[p.id] } : p))
        );
        if (activeScanPhoto && photoMap[activeScanPhoto.id]) {
          setActiveScanPhoto({ ...activeScanPhoto, url: photoMap[activeScanPhoto.id] });
        }
      }
    } catch (e) {
      console.error("Auto-save scan to CRM failed:", e);
      setAutoSaveStatus("error");
    }
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const currentDate = format(new Date(), "MMMM d, yyyy");
    
    // Header - Green header bar
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Logo text
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("TruMove", 14, 16);
    
    // Date on right
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${currentDate}`, pageWidth - 14, 16, { align: "right" });
    
    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("AI Scanned Inventory", 14, 40);

    // Helper function to load image as base64
    const loadImageAsBase64 = (url: string): Promise<string | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#f5f5f5';
              ctx.fillRect(0, 0, 32, 32);
              const scale = Math.min(28 / img.width, 28 / img.height);
              const scaledWidth = img.width * scale;
              const scaledHeight = img.height * scale;
              const x = (32 - scaledWidth) / 2;
              const y = (32 - scaledHeight) / 2;
              ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
              resolve(canvas.toDataURL('image/png'));
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    // Pre-load all images
    const imagePromises = detectedItems.map(async (item) => {
      if (item.image) {
        const base64 = await loadImageAsBase64(item.image);
        return { id: item.id, base64 };
      }
      return { id: item.id, base64: null };
    });
    
    const loadedImages = await Promise.all(imagePromises);
    const imageMap = new Map(loadedImages.map(img => [img.id, img.base64]));
    
    // Table data
    const tableData = detectedItems.map((item, index) => [
      (index + 1).toString(),
      '',
      item.name,
      item.room,
      `${item.quantity}`,
      `${item.weight}`,
      `${item.cuft}`,
      `${item.weight * item.quantity}`,
      `${item.cuft * item.quantity}`
    ]);
    
    autoTable(doc, {
      startY: 50,
      head: [['#', '', 'Item', 'Room', 'Qty', 'Weight', 'Cu Ft', 'Total Wt', 'Total Cu Ft']],
      body: tableData,
      foot: [[
        '', '', '', '', 'Totals:', '-', '-', 
        `${totalWeight.toLocaleString()} lbs`, 
        `${totalCuFt} cu ft`
      ]],
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
      },
      footStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
        minCellHeight: 12,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 14 },
        2: { cellWidth: 38 },
        3: { cellWidth: 28 },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 16, halign: 'center' },
        7: { cellWidth: 22, halign: 'center' },
        8: { cellWidth: 22, halign: 'center' },
      },
      styles: {
        overflow: 'linebreak',
        lineColor: [230, 230, 230],
        lineWidth: 0.5,
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.5,
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const item = detectedItems[data.row.index];
          if (item) {
            const base64 = imageMap.get(item.id);
            if (base64) {
              try {
                const imgSize = 10;
                const x = data.cell.x + (data.cell.width - imgSize) / 2;
                const y = data.cell.y + (data.cell.height - imgSize) / 2;
                doc.addImage(base64, 'PNG', x, y, imgSize, imgSize);
              } catch (e) {
                // Silently fail
              }
            }
          }
        }
      },
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Generated by TruMove - AI-powered moving quotes", 14, finalY + 12);
    doc.text("www.trumove.com", 14, finalY + 18);
    
    doc.save('trumove-ai-scan-inventory.pdf');
  };

  return (
    <SiteShell hideTrustStrip>
      <div className="tru-scan-page">

        {/* Hero */}
        <section className="py-10 md:py-14 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-6">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-3">AI-Powered</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-8 bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="h-px w-8 bg-primary/40" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                AI Room <span className="text-primary">Scan</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg font-light leading-relaxed mt-4">
                Simply scan your rooms and our AI will identify, measure, and catalog every item automatically.
              </p>
            </div>

            <EstimatorNavToggle />

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6">
              {[
                { icon: Camera, label: "Photo & Video Upload" },
                { icon: Sparkles, label: "AI Detection" },
                { icon: Layers, label: "Auto Inventory" },
                { icon: Shield, label: "Instant Quote" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resume previous scan banner — appears when persisted scan data is detected on load */}
        {hasResumableScan && (
          <section className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto -mt-4 mb-6">
              <div className="rounded-xl border border-primary/30 bg-primary/[0.06] backdrop-blur p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">Welcome back - your previous scan is ready</p>
                      {savedAtMs && (
                        <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                          {formatSavedAgo(savedAtMs)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {detectedItems.length} item{detectedItems.length === 1 ? "" : "s"} detected
                      {scanHistory.length > 0 && ` across ${scanHistory.length} photo${scanHistory.length === 1 ? "" : "s"}`}
                      . Saved scans expire after 7 days.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setHasResumableScan(false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Continue scan
                  </button>
                  <button
                    onClick={startFreshScan}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Start fresh
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stale-scan warning banner — appears once persisted data is older than 5 days */}
        {isScanStale && detectedItems.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto -mt-2 mb-6">
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/[0.08] backdrop-blur p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        Your saved scan is getting old
                      </p>
                      {savedAtMs && (
                        <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                          {formatSavedAgo(savedAtMs)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {daysUntilExpiry === 0
                        ? "This scan expires today. Finish reviewing or start fresh before it auto-deletes."
                        : `This scan auto-deletes in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}. Finish reviewing or start fresh to keep your inventory accurate.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={startFreshScan}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-amber-500/40 bg-background text-xs font-semibold text-foreground hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Start fresh
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main scan workspace */}
        <section className="px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 lg:gap-6">

              {/* Center: Demo & Actions */}
              <div className="flex flex-col items-center justify-center gap-4 border border-border rounded-2xl bg-background shadow-[0_4px_20px_-4px_hsl(var(--tm-ink)/0.08)] relative overflow-hidden">
                {/* Scanner content - show image when demo is active OR live AI scan running */}
                {(demoStep >= 2 || activeScanPhoto) ? (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="relative w-full flex-1 overflow-hidden rounded-t-2xl">
                      <img
                        src={activeScanPhoto ? activeScanPhoto.url : sampleRoomLiving}
                        alt="Scanning room"
                        className="w-full h-full object-cover"
                      />
                      {isScanning && (
                        <div className="tru-ai-scanner-overlay">
                          <div className="tru-ai-scanner-line" />
                        </div>
                      )}
                      {/* Live AI bounding boxes (real Gemini detections) */}
                      {activeScanPhoto && aiBoxes.slice(0, revealedBoxCount).map((item) => (
                        <div
                          key={item.id}
                          className="tru-ai-detection-box"
                          style={{
                            top: `${item.y * 100}%`,
                            left: `${item.x * 100}%`,
                            width: `${item.width * 100}%`,
                            height: `${item.height * 100}%`,
                          }}
                        >
                          <span className="tru-ai-detection-corner tru-ai-corner-tl" />
                          <span className="tru-ai-detection-corner tru-ai-corner-tr" />
                          <span className="tru-ai-detection-corner tru-ai-corner-bl" />
                          <span className="tru-ai-detection-corner tru-ai-corner-br" />
                          <span className="tru-ai-detection-label">
                            {item.name}
                            <span className="tru-ai-detection-confidence">{item.confidence}%</span>
                          </span>
                        </div>
                      ))}
                      {/* Demo bounding boxes - only when running scripted demo */}
                      {!activeScanPhoto && DEMO_FURNITURE_POSITIONS.slice(0, Math.max(0, demoStep - 2)).map((item) => (
                        <div
                          key={item.id}
                          className="tru-ai-detection-box"
                          style={{
                            top: item.top,
                            left: item.left,
                            width: item.width,
                            height: item.height,
                          }}
                        >
                          <span className="tru-ai-detection-corner tru-ai-corner-tl" />
                          <span className="tru-ai-detection-corner tru-ai-corner-tr" />
                          <span className="tru-ai-detection-corner tru-ai-corner-bl" />
                          <span className="tru-ai-detection-corner tru-ai-corner-br" />
                          <span className="tru-ai-detection-label">
                            {item.name}
                            <span className="tru-ai-detection-confidence">{item.confidence}%</span>
                          </span>
                        </div>
                      ))}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-foreground/80 text-background rounded-full px-2.5 py-1 z-20">
                        <Scan className="w-3 h-3" />
                        <span className="text-[10px] font-semibold">
                          {isScanning ? "Scanning..." : "Complete"}
                        </span>
                      </div>
                      {activeScanPhoto && aiScanProgress.total > 1 && (
                        <div className="absolute top-2 right-2 bg-foreground/80 text-background rounded-full px-2.5 py-1 z-20">
                          <span className="text-[10px] font-semibold">
                            Photo {aiScanProgress.current} / {aiScanProgress.total}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center px-4">
                      {activeScanPhoto
                        ? (isAiScanning
                            ? (revealedBoxCount === 0
                                ? "Gemini is analyzing the photo..."
                                : `Detected ${revealedBoxCount} of ${aiBoxes.length} items in this photo...`)
                            : `Found ${aiBoxes.length} items in this photo`)
                        : (isScanning
                            ? `Detected ${detectedItems.length} of ${DEMO_ITEMS.length} items...`
                            : `Found ${detectedItems.length} items`)
                      }
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                      <Scan className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">AI Room Scanner</h3>
                    <p className="text-sm text-muted-foreground max-w-[240px]">
                      Upload your room photos or videos and our AI will detect every item automatically.
                    </p>
                  </div>
                )}

                {/* Scanned-photo thumbnail strip - click to re-open detections */}
                {scanHistory.length > 0 && (
                  <div className="w-full px-4 pb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Scanned Photos ({scanHistory.length})
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {scanHistory.map(p => {
                        const isActive = activeScanPhoto?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveScanPhoto(p);
                              setAiBoxes(p.boxes);
                              setRevealedBoxCount(p.boxes.length);
                            }}
                            title={`${p.name} - ${p.boxes.length} item${p.boxes.length === 1 ? '' : 's'} detected`}
                            className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                              isActive ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'
                            }`}
                          >
                            <img src={p.url} alt={p.name} className="w-16 h-12 object-cover" />
                            <span className="absolute bottom-0 right-0 bg-foreground/80 text-background text-[9px] font-bold px-1 rounded-tl">
                              {p.boxes.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Demo step info */}
                {isDemoActive && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                    Step {demoStep} of {DEMO_TOTAL_STEPS}
                    {demoStep === 1 && " - Photo added to library"}
                    {demoStep === 2 && " - Scanning started"}
                    {demoStep > 2 && demoStep < DEMO_TOTAL_STEPS && " - Detecting items"}
                    {demoStep === DEMO_TOTAL_STEPS && " - Complete!"}
                  </p>
                )}

                {/* AI Scanning indicator */}
                {isAiScanning && (
                  <div className="w-full max-w-[320px] px-4">
                    <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                      <span className="text-xs font-semibold text-foreground">
                        Analyzing photo {aiScanProgress.current} of {aiScanProgress.total}...
                      </span>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col items-stretch gap-2 w-full max-w-[320px] px-4">
                  {!isDemoActive ? (
                    <>
                      <button
                        onClick={handleStartScanClick}
                        disabled={isAiScanning}
                        className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        {isAiScanning
                          ? "Scanning..."
                          : uploadedPhotos.some(p => p.id !== 'demo-photo' && !scannedPhotoIds.has(p.id))
                            ? "Scan Your Home"
                            : uploadedPhotos.length > 0
                              ? "Start Scanning"
                              : "Watch Demo"}
                      </button>
                      <button
                        onClick={() => navigate('/online-estimate')}
                        disabled={isAiScanning}
                        className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/40 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        Add Items Manually
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      {demoStep < DEMO_TOTAL_STEPS && (
                        <button
                          onClick={() => setDemoPlaying(prev => !prev)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
                        >
                          {demoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {demoPlaying ? "Pause" : "Play"}
                        </button>
                      )}
                      <button
                        onClick={handleStopDemo}
                        className="flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Stop
                      </button>
                    </div>
                  )}
                </div>


                {/* Progress Bar */}
                {(isDemoActive || isAiScanning) && (
                  <div className="w-full max-w-[320px] px-4">
                    <div className="tru-scan-progress-bar">
                      <div 
                        className="tru-scan-progress-fill"
                        style={{
                          width: isAiScanning && aiScanProgress.total > 0
                            ? `${(aiScanProgress.current / aiScanProgress.total) * 100}%`
                            : `${(demoStep / DEMO_TOTAL_STEPS) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Photo Library - Compact */}
              <div
                className={`tru-scan-library-panel tru-scan-library-compact relative transition-colors ${isDraggingFiles ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                onDragOver={handleLibraryDragOver}
                onDragLeave={handleLibraryDragLeave}
                onDrop={handleLibraryDrop}
              >
                {/* Drag overlay - covers the whole panel while dragging files in */}
                {isDraggingFiles && (
                  <div className="absolute inset-0 z-20 rounded-[inherit] bg-primary/10 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <Upload className="w-8 h-8 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Drop to add to All</p>
                    <p className="text-[11px] text-muted-foreground">Photos & videos accepted</p>
                  </div>
                )}

                <div className="tru-scan-library-header">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Library</span>
                  <span className="tru-scan-library-count">{uploadedPhotos.length}</span>
                  {/* Multi-select toggle. When on, every tile shows a checkbox
                      and click toggles selection (shift-click extends a range
                      from the last anchor across the visible flat list).
                      Selected photos drag together into any folder. */}
                  {uploadedPhotos.length > 0 && (
                    selectionMode ? (
                      <div className="ml-auto flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                          {selectedPhotoIds.size} selected
                        </span>
                        {selectedPhotoIds.size > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPhotoIds(new Set());
                              setLastSelectedPhotoId(null);
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider transition-colors"
                            title="Clear selection"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectionMode(false);
                            setSelectedPhotoIds(new Set());
                            setLastSelectedPhotoId(null);
                          }}
                          className="inline-flex items-center justify-center rounded-md border border-primary/30 bg-primary/[0.06] hover:bg-primary/[0.12] px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider transition-colors"
                          title="Exit multi-select"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectionMode(true)}
                        className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-background hover:bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider transition-colors"
                        title="Select multiple photos to drag together"
                      >
                        <Check className="w-3 h-3" />
                        Select
                      </button>
                    )
                  )}
                  {/* Inline "+ Folder" affordance. Toggles a tiny input row so
                      customers can name a custom folder without leaving the
                      library. Persisted with the saved scan. */}
                  {!isAddingFolder ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingFolder(true);
                        setNewFolderDraft("");
                      }}
                      className={`${uploadedPhotos.length > 0 ? "" : "ml-auto"} inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/[0.06] hover:bg-primary/[0.12] px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider transition-colors`}
                      title="Create a custom folder"
                    >
                      <FolderPlus className="w-3 h-3" />
                      Folder
                    </button>
                  ) : (
                    <div className="ml-auto flex items-center gap-1">
                      <input
                        autoFocus
                        type="text"
                        value={newFolderDraft}
                        onChange={(e) => setNewFolderDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addCustomFolder(newFolderDraft);
                            setIsAddingFolder(false);
                            setNewFolderDraft("");
                          } else if (e.key === "Escape") {
                            setIsAddingFolder(false);
                            setNewFolderDraft("");
                          }
                        }}
                        placeholder="Folder name"
                        maxLength={40}
                        className="h-6 w-28 rounded-md border border-primary/40 bg-background px-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addCustomFolder(newFolderDraft);
                          setIsAddingFolder(false);
                          setNewFolderDraft("");
                        }}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        title="Add folder"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingFolder(false);
                          setNewFolderDraft("");
                        }}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-muted text-muted-foreground hover:bg-muted/70 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested folders: one-tap chips for common rooms beyond the
                    canonical six (Living Room/Bedroom/Kitchen/Bathroom/Garage/
                    Storage). We hide any suggestion that already exists as a
                    custom folder OR as a parsed photo group, so the row shrinks
                    as the customer's library grows and disappears entirely
                    once they've added them all. */}
                {(() => {
                  const SUGGESTED = ["Office", "Garage Loft", "Patio", "Basement"];
                  const taken = new Set(
                    [
                      ...PROTECTED_FOLDERS,
                      ...customFolders,
                      ...uploadedPhotos.map((p) => parseRoom(p.name)),
                    ].map((n) => n.toLowerCase())
                  );
                  const remaining = SUGGESTED.filter((s) => !taken.has(s.toLowerCase()));
                  if (remaining.length === 0) return null;
                  return (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Suggested
                      </span>
                      {remaining.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => addCustomFolder(name)}
                          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background hover:bg-primary/[0.08] hover:border-primary/40 hover:text-primary px-2 py-0.5 text-[11px] text-muted-foreground transition-colors"
                          title={`Add "${name}" folder`}
                        >
                          <Plus className="w-2.5 h-2.5" />
                          {name}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* Hidden inputs for both upload paths */}
                <input
                  ref={roomUploadRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleRoomUpload}
                />
                <input
                  ref={allUploadRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleAllUpload}
                />

                <div className="tru-scan-library-grid tru-scan-library-grid-compact">
                  {uploadedPhotos.length === 0 ? (
                    <div className="tru-scan-library-empty tru-scan-library-empty-compact flex flex-col items-center gap-3 py-3">
                      {/* Primary drop zone - the "easy path" */}
                      <button
                        type="button"
                        onClick={handleAllUploadClick}
                        className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08] hover:border-primary/60 transition-colors px-4 py-6 cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                          <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Drop photos & videos here</p>
                        <p className="text-[11px] text-muted-foreground">
                          or <span className="text-primary font-semibold underline underline-offset-2">click to browse</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mt-1">
                          <FolderOpen className="w-3 h-3" /> Goes into "All" folder by default
                        </p>
                      </button>

                      {/* Auto-save reassurance */}
                      <div className="w-full flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/70">
                        <Check className="w-3 h-3 text-primary" />
                        <span>Auto-saved as you go - resume anytime within 7 days</span>
                      </div>

                      {/* Optional room organization */}
                      <div className="w-full">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center mb-1.5">
                          Or sort by room (optional)
                        </p>
                        <div className="grid grid-cols-3 gap-1.5 w-full px-1">
                          {[
                            { icon: Sofa, label: "Living", room: "Living Room" },
                            { icon: BedDouble, label: "Bed", room: "Bedroom" },
                            { icon: UtensilsCrossed, label: "Kitchen", room: "Kitchen" },
                            { icon: Bath, label: "Bath", room: "Bathroom" },
                            { icon: Warehouse, label: "Garage", room: "Garage" },
                            { icon: Box, label: "Storage", room: "Storage" },
                          ].map(({ icon: Icon, label, room }) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => handleRoomClick(room)}
                              className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-2.5 text-[11px] font-medium text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      // Group photos by folder. "All" is the default landing
                      // bucket and is always pinned to the top, even when empty,
                      // so customers see a clear home for any new uploads.
                      const KNOWN_ROOMS = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Garage", "Storage"];
                      const parseRoom = (name: string) => {
                        const sep = name.indexOf(" - ");
                        if (sep === -1) return "All";
                        const candidate = name.slice(0, sep).trim();
                        return candidate.length > 0 ? candidate : "All";
                      };
                      const groups = new Map<string, typeof uploadedPhotos>();
                      // Seed All so it always renders first
                      groups.set("All", []);
                      // Seed customer-defined folders so empty ones still render
                      // (they survive a refresh via the persisted customFolders list).
                      customFolders.forEach((f) => {
                        if (!groups.has(f)) groups.set(f, []);
                      });
                      uploadedPhotos.forEach((p) => {
                        const room = parseRoom(p.name);
                        if (!groups.has(room)) groups.set(room, []);
                        groups.get(room)!.push(p);
                      });
                      // Order: All first, then known rooms, then custom rooms alphabetically
                      const orderedKeys = [
                        "All",
                        ...KNOWN_ROOMS.filter((r) => groups.has(r)),
                        ...[...groups.keys()]
                          .filter((k) => !KNOWN_ROOMS.includes(k) && k !== "All")
                          .sort((a, b) => a.localeCompare(b)),
                      ];
                      // Flat photo order across visible folders. Used for
                      // shift-click range selection in the library grid.
                      const flatPhotoOrder: string[] = [];
                      orderedKeys.forEach((room) => {
                        (groups.get(room) ?? []).forEach((p) => flatPhotoOrder.push(p.id));
                      });
                      return (
                        <>
                          {/* Compact "add more" strip stays visible while photos exist */}
                          <button
                            type="button"
                            onClick={handleAllUploadClick}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08] px-3 py-2 text-[11px] font-semibold text-primary transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Add more (drop or click)
                          </button>
                          {orderedKeys.map((room) => {
                            const photos = groups.get(room) ?? [];
                            const isAllFolder = room === "All";
                            const isDropTarget = dragOverFolder === room;
                            // A photo can't be dropped into the folder it's already in.
                            const draggedPhoto = draggedPhotoId
                              ? uploadedPhotos.find((p) => p.id === draggedPhotoId)
                              : null;
                            const draggedPhotoCurrentRoom = draggedPhoto ? parseRoom(draggedPhoto.name) : null;
                            const canAcceptDrop = draggedPhotoId !== null && draggedPhotoCurrentRoom !== room;

                            return (
                              <div
                                key={room}
                                className={`tru-scan-library-folder transition-colors rounded-lg ${
                                  isDropTarget && canAcceptDrop
                                    ? "ring-2 ring-primary bg-primary/[0.06]"
                                    : draggedPhotoId && canAcceptDrop
                                      ? "ring-1 ring-dashed ring-primary/30"
                                      : ""
                                }`}
                                onDragOver={(e) => {
                                  if (!draggedPhotoId) return;
                                  e.preventDefault();
                                  e.stopPropagation();
                                  e.dataTransfer.dropEffect = canAcceptDrop ? "move" : "none";
                                  if (canAcceptDrop && dragOverFolder !== room) setDragOverFolder(room);
                                }}
                                onDragLeave={(e) => {
                                  // Only clear when leaving the folder element entirely, not when
                                  // moving across child tiles inside it.
                                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                                  if (dragOverFolder === room) setDragOverFolder(null);
                                }}
                                onDrop={(e) => {
                                  if (!draggedPhotoId) return;
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (canAcceptDrop) {
                                    // If the dragged photo is part of an active
                                    // multi-selection, move the entire batch in
                                    // one update so the user can drop many at once.
                                    const batch = selectedPhotoIds.has(draggedPhotoId) && selectedPhotoIds.size > 1
                                      ? selectedPhotoIds
                                      : new Set([draggedPhotoId]);
                                    reclassifyPhotosToFolder(batch, room);
                                    toast({
                                      title: batch.size > 1
                                        ? `Moved ${batch.size} photos to ${room}`
                                        : `Moved to ${room}`,
                                      description: "Folder updated - your scan is auto-saved.",
                                    });
                                    if (batch.size > 1) {
                                      setSelectedPhotoIds(new Set());
                                      setLastSelectedPhotoId(null);
                                    }
                                  }
                                  setDraggedPhotoId(null);
                                  setDragOverFolder(null);
                                }}
                              >
                                <div className="flex items-center gap-1.5 px-1 pt-2 pb-1 group/folderhead">
                                  <FolderOpen className={`w-3 h-3 ${isAllFolder ? "text-primary" : "text-muted-foreground/70"}`} />
                                  {renamingFolder === room ? (
                                    <input
                                      autoFocus
                                      type="text"
                                      value={renameDraft}
                                      onChange={(e) => setRenameDraft(e.target.value)}
                                      onBlur={() => renameFolderTo(room, renameDraft)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") renameFolderTo(room, renameDraft);
                                        else if (e.key === "Escape") setRenamingFolder(null);
                                      }}
                                      maxLength={40}
                                      className="h-5 flex-1 min-w-0 rounded border border-primary/40 bg-background px-1 text-[10px] font-semibold uppercase tracking-wider text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  ) : (
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isAllFolder ? "text-primary" : "text-muted-foreground/70"}`}>
                                      {room}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-muted-foreground/50">
                                    {photos.length}
                                  </span>
                                  {/* Per-folder "Scan this room" — only shown when the folder
                                      has at least one unscanned real photo. For the "All" bucket
                                      we still scope the run to its own photos, which matches
                                      what the customer sees in this group. Hidden during an
                                      active scan to avoid kicking off overlapping runs. */}
                                  {(() => {
                                    if (renamingFolder === room) return null;
                                    const unscannedCount = photos.filter(
                                      (p) => p.id !== 'demo-photo' && !scannedPhotoIds.has(p.id)
                                    ).length;
                                    if (unscannedCount === 0) return null;
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => handleScanFolderClick(room)}
                                        disabled={isAiScanning}
                                        className="ml-1 inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/[0.06] hover:bg-primary/[0.12] disabled:opacity-50 disabled:cursor-not-allowed px-1.5 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider transition-colors"
                                        title={`Scan ${unscannedCount} unscanned photo${unscannedCount === 1 ? '' : 's'} in ${room}`}
                                      >
                                        <Sparkles className="w-2.5 h-2.5" />
                                        Scan
                                      </button>
                                    );
                                  })()}
                                  {isAllFolder ? (
                                    <span className="ml-auto text-[9px] uppercase tracking-wider text-primary/70 font-semibold">
                                      Default
                                    </span>
                                  ) : (
                                    // Rename + delete are only available on customer-defined folders
                                    // and inferred custom rooms (anything not in PROTECTED_FOLDERS).
                                    // Hidden until hover so the folder header stays clean.
                                    !PROTECTED_FOLDERS.has(room) && renamingFolder !== room && (
                                      <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover/folderhead:opacity-100 transition-opacity">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRenamingFolder(room);
                                            setRenameDraft(room);
                                          }}
                                          className="inline-flex items-center justify-center w-4 h-4 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                          title="Rename folder"
                                        >
                                          <Pencil className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            // If the folder still has photos, ask before destroying
                                            // the customer's organization. Empty folders go straight
                                            // through (nothing to lose).
                                            if (photos.length > 0) {
                                              setPendingDeleteFolder(room);
                                            } else {
                                              removeCustomFolder(room);
                                            }
                                          }}
                                          className="inline-flex items-center justify-center w-4 h-4 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                          title={photos.length > 0
                                            ? `Remove folder (${photos.length} photo${photos.length === 1 ? '' : 's'} will move to All)`
                                            : "Remove folder"}
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                                {photos.length === 0 ? (
                                  <p className="text-[10px] text-muted-foreground/50 italic px-1 pb-2">
                                    {draggedPhotoId && canAcceptDrop
                                      ? `Drop here to move into ${room}`
                                      : "Drop photos here - or drag from another folder"}
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {photos.map((photo) => {
                                      const isScanned = scannedPhotoIds.has(photo.id);
                                      const isSelected = selectedPhotoIds.has(photo.id);
                                      // While dragging a multi-selection, dim every selected
                                      // tile (not just the one the OS attached the ghost to).
                                      const isPartOfActiveDrag = draggedPhotoId === photo.id
                                        || (draggedPhotoId !== null && isSelected && selectedPhotoIds.has(draggedPhotoId) && selectedPhotoIds.size > 1);

                                      // Toggle / range-select handler. Shift-click extends from
                                      // the last anchor across the flat ordering of all visible
                                      // folders. Plain click in selectionMode toggles a single tile.
                                      const handleTileClick = (e: React.MouseEvent) => {
                                        const usingShift = e.shiftKey;
                                        if (!selectionMode && !usingShift) return; // tile click is a no-op outside multi-select
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (usingShift && lastSelectedPhotoId && lastSelectedPhotoId !== photo.id) {
                                          const start = flatPhotoOrder.indexOf(lastSelectedPhotoId);
                                          const end = flatPhotoOrder.indexOf(photo.id);
                                          if (start !== -1 && end !== -1) {
                                            const [a, b] = start < end ? [start, end] : [end, start];
                                            const range = flatPhotoOrder.slice(a, b + 1);
                                            setSelectedPhotoIds((prev) => {
                                              const next = new Set(prev);
                                              range.forEach((id) => next.add(id));
                                              return next;
                                            });
                                            // Shift-click implies the user wants multi-select even
                                            // if they hadn't toggled the mode yet.
                                            if (!selectionMode) setSelectionMode(true);
                                            setLastSelectedPhotoId(photo.id);
                                            return;
                                          }
                                        }
                                        setSelectedPhotoIds((prev) => {
                                          const next = new Set(prev);
                                          if (next.has(photo.id)) next.delete(photo.id);
                                          else next.add(photo.id);
                                          return next;
                                        });
                                        setLastSelectedPhotoId(photo.id);
                                      };

                                      return (
                                        <div
                                          key={photo.id}
                                          draggable
                                          onClick={handleTileClick}
                                          onDragStart={(e) => {
                                            // If user starts dragging an unselected tile while
                                            // a selection exists, treat the drag as a single-photo
                                            // move (don't silently drag the unrelated selection).
                                            if (selectedPhotoIds.size > 0 && !selectedPhotoIds.has(photo.id)) {
                                              setSelectedPhotoIds(new Set());
                                              setLastSelectedPhotoId(null);
                                            }
                                            setDraggedPhotoId(photo.id);
                                            e.dataTransfer.effectAllowed = "move";
                                            // Required for Firefox to actually start the drag
                                            try { e.dataTransfer.setData("text/plain", photo.id); } catch { /* noop */ }
                                          }}
                                          onDragEnd={() => {
                                            setDraggedPhotoId(null);
                                            setDragOverFolder(null);
                                          }}
                                          // ----- Mobile long-press fallback for drag-and-drop -----
                                          // HTML5 drag events don't fire on touch devices, so we
                                          // open the per-tile "Move to..." dropdown after a 500ms
                                          // hold. Cancelled if the finger moves (scroll) or lifts
                                          // before the timer fires. A small haptic pulse signals
                                          // the menu is opening.
                                          onTouchStart={() => {
                                            longPressTriggeredRef.current = false;
                                            if (longPressTimerRef.current) {
                                              window.clearTimeout(longPressTimerRef.current);
                                            }
                                            longPressTimerRef.current = window.setTimeout(() => {
                                              longPressTriggeredRef.current = true;
                                              setLongPressMenuPhotoId(photo.id);
                                              if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                                                try { navigator.vibrate?.(15); } catch { /* noop */ }
                                              }
                                            }, 500);
                                          }}
                                          onTouchMove={() => {
                                            if (longPressTimerRef.current) {
                                              window.clearTimeout(longPressTimerRef.current);
                                              longPressTimerRef.current = null;
                                            }
                                          }}
                                          onTouchEnd={(e) => {
                                            if (longPressTimerRef.current) {
                                              window.clearTimeout(longPressTimerRef.current);
                                              longPressTimerRef.current = null;
                                            }
                                            // If long-press already fired, swallow the synthetic
                                            // click that follows so it doesn't toggle selection.
                                            if (longPressTriggeredRef.current) {
                                              e.preventDefault();
                                            }
                                          }}
                                          onTouchCancel={() => {
                                            if (longPressTimerRef.current) {
                                              window.clearTimeout(longPressTimerRef.current);
                                              longPressTimerRef.current = null;
                                            }
                                          }}
                                          // Suppress the OS context menu on long-press (iOS image
                                          // preview, Android "Save image") so our menu wins.
                                          onContextMenu={(e) => {
                                            if (longPressTriggeredRef.current) e.preventDefault();
                                          }}
                                          className={`tru-scan-library-item tru-scan-library-item-compact relative cursor-grab active:cursor-grabbing select-none ${isScanned ? 'opacity-50 grayscale' : ''} ${isPartOfActiveDrag ? 'opacity-30' : ''} ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background rounded-md' : ''}`}
                                          style={{ WebkitTouchCallout: "none" }}
                                          title={selectionMode ? "Click to select - drag any selected photo to move them all" : "Drag (or long-press on mobile) to move to another folder"}
                                        >
                                          <img src={photo.url} alt={photo.name} draggable={false} />
                                          {/* Selection checkbox - shown in selection mode OR
                                              when the photo is already part of an ad-hoc
                                              shift-click selection. */}
                                          {(selectionMode || isSelected) && (
                                            <div
                                              className={`absolute top-1 left-1 w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors ${
                                                isSelected
                                                  ? "bg-primary border-primary text-primary-foreground"
                                                  : "bg-background/80 border-border"
                                              }`}
                                            >
                                              {isSelected && <Check className="w-2.5 h-2.5" />}
                                            </div>
                                          )}
                                          {isScanned && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 rounded-[inherit]">
                                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="w-3 h-3 text-primary-foreground" />
                                              </div>
                                            </div>
                                          )}
                                          {/* Three-dot "Move to..." menu - lets customers
                                              reclassify a photo without dragging. Shows
                                              every other folder; current folder is excluded.
                                              Stops propagation so the trigger click doesn't
                                              toggle selection or start a drag. */}
                                          <DropdownMenu
                                            open={longPressMenuPhotoId === photo.id ? true : undefined}
                                            onOpenChange={(open) => {
                                              // Clear the long-press latch whenever the menu closes
                                              // so a new long-press elsewhere can open its own menu.
                                              if (!open && longPressMenuPhotoId === photo.id) {
                                                setLongPressMenuPhotoId(null);
                                              }
                                            }}
                                          >
                                            <DropdownMenuTrigger asChild>
                                              <button
                                                type="button"
                                                onClick={(e) => e.stopPropagation()}
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                className="absolute bottom-1 right-1 z-10 inline-flex items-center justify-center w-5 h-5 rounded-md bg-background/85 hover:bg-background border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors"
                                                title="More options"
                                                aria-label="Photo options"
                                              >
                                                <MoreVertical className="w-3 h-3" />
                                              </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                              align="end"
                                              side="top"
                                              className="w-48"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                Move to folder
                                              </DropdownMenuLabel>
                                              <DropdownMenuSeparator />
                                              {orderedKeys.filter((k) => k !== room).length === 0 ? (
                                                <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                                                  No other folders yet
                                                </div>
                                              ) : (
                                                orderedKeys
                                                  .filter((k) => k !== room)
                                                  .map((targetRoom) => (
                                                    <DropdownMenuItem
                                                      key={targetRoom}
                                                      onSelect={() => {
                                                        reclassifyPhotosToFolder(new Set([photo.id]), targetRoom);
                                                        toast({
                                                          title: `Moved to ${targetRoom}`,
                                                          description: "Folder updated - your scan is auto-saved.",
                                                        });
                                                      }}
                                                      className="text-xs cursor-pointer"
                                                    >
                                                      <FolderInput className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                                      {targetRoom}
                                                    </DropdownMenuItem>
                                                  ))
                                              )}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setUploadedPhotos(prev => prev.filter(p => p.id !== photo.id));
                                              setSelectedPhotoIds((prev) => {
                                                if (!prev.has(photo.id)) return prev;
                                                const next = new Set(prev);
                                                next.delete(photo.id);
                                                return next;
                                              });
                                            }}
                                            className="tru-scan-library-remove tru-scan-library-remove-compact"
                                          >
                                            <X className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      );
                    })()
                  )}
                </div>
                <button
                  onClick={() => {
                    const hasReal = uploadedPhotos.some(p => p.id !== 'demo-photo' && !scannedPhotoIds.has(p.id));
                    if (hasReal) {
                      runRealAiScan();
                    } else {
                      setShowIntroModal(true);
                    }
                  }}
                  disabled={isScanning || isAiScanning || uploadedPhotos.length === 0 || uploadedPhotos.every(p => p.id === 'demo-photo' || scannedPhotoIds.has(p.id))}
                  className="tru-scan-library-analyze-btn tru-scan-library-analyze-btn-compact"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAiScanning ? "Analyzing..." : isScanning ? "Scanning..." : "Start Scanning"}
                </button>
              </div>
            </div>

            {/* Inventory Stats Bar - Always visible */}
            <div className="tru-scan-floating-bar">
              <div className="tru-scan-floating-bar-item">
                <Package className="w-4 h-4 text-primary" />
                <span className="tru-scan-floating-bar-value">{detectedItems.length}</span>
                <span className="tru-scan-floating-bar-label">items</span>
              </div>
              <div className="tru-scan-floating-bar-divider" />
              <div className="tru-scan-floating-bar-item">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                <span className="tru-scan-floating-bar-value">{totalWeight.toLocaleString()}</span>
                <span className="tru-scan-floating-bar-label">lbs</span>
              </div>
              <div className="tru-scan-floating-bar-divider" />
              <div className="tru-scan-floating-bar-item">
                <Box className="w-4 h-4 text-muted-foreground" />
                <span className="tru-scan-floating-bar-value">{totalCuFt}</span>
                <span className="tru-scan-floating-bar-label">cu ft</span>
              </div>
              {detectedItems.length > 0 && (
                <Link to="/online-estimate" className="tru-scan-floating-bar-btn">
                  <ArrowRight className="w-4 h-4" />
                  View All
                </Link>
              )}
            </div>


            {/* Inventory Table Below Video */}
            <div className="tru-scan-table-panel">
              <div className="tru-scan-table-header">
                <h3>Your Move <span className="tru-scan-headline-accent">Inventory</span></h3>
              </div>
              
              {detectedItems.length === 0 ? (
                <div className="tru-scan-table-empty">
                  <Scan className="w-8 h-8" />
                  <p>Items will appear here as they're detected</p>
                  <span>Click "Start Scanning" above to begin</span>
                </div>
              ) : (
                <>
                  <div className="tru-scan-table-wrapper">
                    <table className="tru-scan-table">
                      <thead>
                        <tr>
                          <th>ORDER</th>
                          <th>ITEM</th>
                          <th>ROOM</th>
                          <th>QTY</th>
                          <th>WEIGHT (LBS)</th>
                          <th>CU FT</th>
                          <th>CONFIDENCE</th>
                          <th>TOTAL WEIGHT</th>
                          <th>TOTAL CU FT</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {detectedItems.map((item, idx) => (
                          <tr key={item.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                            <td className="tru-scan-table-order">{idx + 1}</td>
                            <td className="tru-scan-table-item">
                              <img src={item.image} alt={item.name} />
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{item.name}</span>
                                {item.photoId ? (
                                  <span
                                    className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none"
                                    title="Detected by AI vision"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    AI
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none"
                                    title="Added manually"
                                  >
                                    Manual
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{item.room}</td>
                            <td>
                              <div className={`tru-scan-qty-controls ${!isUnlocked ? 'tru-scan-qty-disabled' : ''}`}>
                                <button 
                                  onClick={() => {
                                    if (!isUnlocked) return;
                                    setDetectedItems(prev => prev.flatMap(i => {
                                      if (i.id !== item.id) return [i];
                                      const next = i.quantity - 1;
                                      return next <= 0 ? [] : [{ ...i, quantity: next }];
                                    }));
                                  }}
                                  className="tru-scan-qty-btn"
                                  title={isUnlocked ? "Decrease quantity" : "Unlock to edit"}
                                  disabled={!isUnlocked}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="tru-scan-qty-value">{item.quantity}</span>
                                <button 
                                  onClick={() => {
                                    if (!isUnlocked) return;
                                    setDetectedItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
                                  }}
                                  className="tru-scan-qty-btn"
                                  title={isUnlocked ? "Increase quantity" : "Unlock to edit"}
                                  disabled={!isUnlocked}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td>{item.weight}</td>
                            <td>{item.cuft}</td>
                            <td>
                              {typeof item.confidence === 'number' ? (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${
                                    item.confidence >= 85
                                      ? 'bg-primary/15 text-primary'
                                      : item.confidence >= 65
                                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                      : 'bg-destructive/15 text-destructive'
                                  }`}
                                  title={`AI confidence: ${item.confidence}%`}
                                >
                                  {item.confidence}%
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="tru-scan-table-total">{item.weight * item.quantity}</td>
                            <td className="tru-scan-table-total">{item.cuft * item.quantity}</td>
                            <td>
                              <div className="flex items-center gap-1">
                                {item.photoId && (
                                  <button
                                    onClick={() => {
                                      const photo = scanHistory.find(p => p.id === item.photoId);
                                      if (photo) setDetectionView({ photo, boxId: item.boxIndex ?? -1 });
                                    }}
                                    className="tru-scan-remove-btn"
                                    title="View AI detection in source photo"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => isUnlocked && setDetectedItems(prev => prev.filter(i => i.id !== item.id))}
                                  className={`tru-scan-remove-btn ${!isUnlocked ? 'tru-scan-remove-disabled' : ''}`}
                                  title={isUnlocked ? "Remove item" : "Unlock to edit"}
                                  disabled={!isUnlocked}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={6}></td>
                          <td className="tru-scan-table-footer-label">Totals:</td>
                          <td className="tru-scan-table-footer-value">{totalWeight.toLocaleString()} lbs</td>
                          <td className="tru-scan-table-footer-value">{totalCuFt} cu ft</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="tru-scan-table-actions">
                    <button
                      type="button"
                      onClick={handlePrint}
                      disabled={detectedItems.length === 0 || !isUnlocked}
                      className="tru-scan-action-btn"
                    >
                      <Printer className="w-4 h-4" />
                      Print inventory
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={detectedItems.length === 0 || !isUnlocked}
                      className="tru-scan-action-btn"
                    >
                      <Download className="w-4 h-4" />
                      Download as PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearDialog(true)}
                      disabled={detectedItems.length === 0 || !isUnlocked}
                      className="tru-scan-action-btn tru-scan-action-btn-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                    {/* Save to CRM is automatic in the background — no customer-facing button. */}
                    <button
                      type="button"
                      onClick={() => {
                        // Save to localStorage for manual builder sync
                        const inventoryForBuilder = detectedItems.map((item) => ({
                          id: `scanned-${item.id}-${Date.now()}`,
                          name: item.name,
                          room: item.room,
                          quantity: item.quantity,
                          weightEach: item.weight,
                          cubicFeet: item.cuft,
                          imageUrl: item.image,
                        }));
                        localStorage.setItem('tm_scanned_inventory', JSON.stringify(inventoryForBuilder));
                        toast({
                          title: "Inventory Migrated Successfully!",
                          description: `${detectedItems.length} items have been synced to the manual builder.`,
                        });
                        navigate('/online-estimate');
                      }}
                      disabled={detectedItems.length === 0}
                      className="tru-scan-btn-dark"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      Migrate to Manual Builder
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="tru-scan-bottom-cta">
          <div className="tru-scan-bottom-buttons">
            <button
              onClick={() => navigate("/online-estimate")}
              className="tru-scan-alt-btn"
            >
              <Sparkles className="w-4 h-4" />
              Build Inventory Manually
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="tru-scan-bottom-secondary">
            <a href="tel:1-800-555-0123" className="tru-secondary-action-btn">
              <Phone className="w-4 h-4" />
              Prefer to talk?
            </a>
            <Link to="/book" className="tru-secondary-action-btn">
              <Video className="w-4 h-4" />
              Book Video Consult
            </Link>
          </div>
        </section>

        {/* Clear All Confirmation Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Items?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all {detectedItems.length} items from your scanned inventory. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setDetectedItems([]);
                  toast({
                    title: "Inventory Cleared",
                    description: "All scanned items have been removed.",
                  });
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Custom Folder Delete Confirmation - only shown when the folder
            still contains photos. The count tells the customer exactly how
            many tiles will be unfiled back into "All". */}
        <AlertDialog
          open={pendingDeleteFolder !== null}
          onOpenChange={(open) => { if (!open) setPendingDeleteFolder(null); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete folder "{pendingDeleteFolder}"?</AlertDialogTitle>
              <AlertDialogDescription>
                {(() => {
                  const count = pendingDeleteFolder
                    ? uploadedPhotos.filter((p) => parseRoom(p.name) === pendingDeleteFolder).length
                    : 0;
                  return (
                    <>
                      <strong>{count}</strong> photo{count === 1 ? '' : 's'} will move back to <strong>All</strong> and lose this folder label. The photos themselves are kept - only the folder organization is removed.
                    </>
                  );
                })()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep folder</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingDeleteFolder) {
                    removeCustomFolder(pendingDeleteFolder);
                    setPendingDeleteFolder(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete folder
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Detection viewer modal - shows source photo with the item's box highlighted */}
        {detectionView && (
          <div
            className="fixed inset-0 z-[100] bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDetectionView(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-background rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Detection Source
                  </p>
                  <h3 className="text-sm font-semibold text-foreground">{detectionView.photo.name}</h3>
                </div>
                <button
                  onClick={() => setDetectionView(null)}
                  className="rounded-full p-1.5 hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative bg-muted">
                <img
                  src={detectionView.photo.url}
                  alt={detectionView.photo.name}
                  className="w-full max-h-[70vh] object-contain"
                />
                {detectionView.photo.boxes.map((box) => {
                  const isTarget = box.id === detectionView.boxId;
                  return (
                    <div
                      key={box.id}
                      className="absolute pointer-events-none"
                      style={{
                        top: `${box.y * 100}%`,
                        left: `${box.x * 100}%`,
                        width: `${box.width * 100}%`,
                        height: `${box.height * 100}%`,
                        border: isTarget ? '3px solid hsl(var(--primary))' : '1px solid hsl(var(--foreground) / 0.3)',
                        boxShadow: isTarget ? '0 0 0 9999px hsl(var(--foreground) / 0.5)' : 'none',
                        borderRadius: '4px',
                        transition: 'all 200ms',
                      }}
                    >
                      {isTarget && (
                        <span
                          className="absolute -top-7 left-0 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap"
                        >
                          {box.name} - {box.confidence}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>{detectionView.photo.boxes.length} items detected in this photo</span>
                <button
                  onClick={() => setDetectionView(null)}
                  className="rounded-full px-3 py-1 bg-foreground text-background text-xs font-semibold hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Scan to CRM is now automatic — runs after every AI scan, no UI. */}

        {/* Lead capture gate — required before AI scanning */}
        <LeadGateModal
          isOpen={showLeadGate}
          onClose={() => { setShowLeadGate(false); setPendingAction(null); }}
          onUnlock={() => {
            setIsUnlocked(true);
            setShowLeadGate(false);
            toast({ title: "AI Scan Unlocked", description: "Your lead has been saved. Continue with your room scan." });
            const action = pendingAction;
            setPendingAction(null);
            // Defer so state flushes (isUnlocked) before re-running the gated action
            setTimeout(() => { try { action?.(); } catch (e) { console.error(e); } }, 50);
          }}
        />

        {/* Verification gate for resume links — proves the visitor owns the lead */}
        {resumeToken && resumeChallenge && (
          <ResumeVerifyModal
            open={!!resumeToken}
            challenge={resumeChallenge}
            emailHintMasked={resumeEmailHint}
            loading={resumeVerifying}
            errorMessage={resumeError}
            onSubmit={handleResumeVerify}
            onCancel={handleResumeCancel}
          />
        )}
      </div>
    </SiteShell>
  );
}
