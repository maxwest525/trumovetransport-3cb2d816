import { useState, useEffect, useRef, type ReactNode } from "react";


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
  }, []);
};
import { useNavigate, Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import ScanIntroModal from "@/components/estimate/ScanIntroModal";
import EstimatorNavToggle from "@/components/estimate/EstimatorNavToggle";

import logoImg from "@/assets/logo.png";
import { 
  Scan, Sparkles, ArrowRight, 
  Smartphone, Box, Clock, Shield, Zap, ChevronRight,
  Ruler, Package, Printer, Download, Square, Trash2, ArrowRightLeft,
  Phone, Video, Minus, Plus, X, Upload, ImageIcon, FolderOpen, Lock, User, Mail,
  Sofa, BedDouble, UtensilsCrossed, Bath, Warehouse, Check, Pause, Play,
  Camera, Layers, Info
} from "lucide-react";
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
  const [detectedItems, setDetectedItems] = useState<typeof DEMO_ITEMS>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  // Demo step state: 0=idle, 1=photo added to library, 2=photo in scanner, 3+=items detecting
  const [demoStep, setDemoStep] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const isDemoActive = demoStep > 0;
  const DEMO_TOTAL_STEPS = 2 + DEMO_ITEMS.length;
  
  // Lead capture state
  const [isUnlocked, setIsUnlocked] = useState(true);
  
  // Sample room photos for the library demo
  const samplePhotos = [
    { id: 'sample-1', url: sampleRoomLiving, name: 'Living Room' },
    { id: 'sample-2', url: sampleRoomBedroom, name: 'Master Bedroom' },
    { id: 'sample-3', url: sampleRoomKitchen, name: 'Kitchen' },
  ];
  
  const [uploadedPhotos, setUploadedPhotos] = useState<{ id: string; url: string; name: string }[]>([]);
  const [scannedPhotoIds, setScannedPhotoIds] = useState<Set<string>>(new Set());
  const [pendingRoomLabel, setPendingRoomLabel] = useState<string>("");
  const roomUploadRef = useRef<HTMLInputElement>(null);

  const handleRoomClick = (roomLabel: string) => {
    setPendingRoomLabel(roomLabel);
    if (roomUploadRef.current) {
      roomUploadRef.current.value = "";
      roomUploadRef.current.click();
    }
  };

  const handleRoomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        setUploadedPhotos(prev => [...prev, {
          id: `photo-${Date.now()}-${Math.random()}`,
          url,
          name: `${pendingRoomLabel} - ${file.name}`
        }]);
      });
    }
    setPendingRoomLabel("");
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
      setDetectedItems(prev => [...prev, DEMO_ITEMS[itemIndex]]);
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

  const handleStartScanClick = () => {
    if (uploadedPhotos.length > 0 && !isDemoActive) {
      setShowIntroModal(true);
    } else {
      // Start demo in auto-play mode
      setDemoPlaying(true);
      handleNextDemoStep();
    }
  };

  const startDemo = () => {
    setDetectedItems([]);
    setIsScanning(true);
    setScannedPhotoIds(new Set(uploadedPhotos.map(p => p.id)));
  };

  const totalWeight = detectedItems.reduce((sum, item) => sum + item.weight, 0);
  const totalCuFt = detectedItems.reduce((sum, item) => sum + item.cuft, 0);

  const handlePrint = () => {
    window.print();
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
      '1',
      `${item.weight}`,
      `${item.cuft}`,
      `${item.weight}`,
      `${item.cuft}`
    ]);
    
    autoTable(doc, {
      startY: 50,
      head: [['#', '', 'Item', 'Room', 'Qty', 'Weight', 'Cu Ft', 'Total Wt', 'Total Cu Ft']],
      body: tableData,
      foot: [[
        '', '', '', '', 'Totals:', '—', '—', 
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
        

        {/* Centered Header Section */}
        <section className="tru-scan-header-section">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h1 className="tru-scan-main-headline">
              AI Room <span className="tru-scan-headline-accent">Inventory Scan</span>
            </h1>
            <p className="tru-scan-main-subheadline">
              Simply scan your rooms and our AI will identify, measure, and catalog every item automatically.
            </p>
          </div>
          <EstimatorNavToggle />
        </section>

        {/* Scan Intro Modal */}
        <ScanIntroModal 
          isOpen={showIntroModal}
          onClose={() => setShowIntroModal(false)}
          onStartScan={startDemo}
        />

        {/* How It Works - Compact Inline Steps with scroll animation */}
        <section className="container max-w-4xl mx-auto px-4 py-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-0">
            {[
              { num: "1", title: "Upload Photos or Videos", desc: "Capture each room showing all furniture and items" },
              { num: "2", title: "AI Detects & Measures", desc: "Our AI identifies items and calculates weight & volume" },
              { num: "3", title: "Review & Get Quote", desc: "Verify your inventory and receive an instant estimate" },
            ].map((step, i) => (
              <ScrollFadeIn key={step.num} delay={i * 0.15}>
                <div className="flex items-center gap-3 px-5 py-3">
                  <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {step.num}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground leading-tight">{step.title}</span>
                    <span className="text-xs text-muted-foreground/60 leading-tight">{step.desc}</span>
                  </div>
                  {i < 2 && <span className="hidden sm:block text-muted-foreground/30 ml-4 mr-1">→</span>}
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </section>

        {/* Room Inventory Analysis Section */}
        <section className="tru-scan-split-demo">
          <div className="container max-w-7xl mx-auto px-4">

            {/* Three Column Layout: Upload | Scanner | Photo Library */}
            <div className="tru-scan-analysis-grid">
              {/* Left: Upload Area */}
              <div className="tru-scan-upload-panel">
                <div className="tru-scan-upload-header">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photos or Videos</span>
                </div>
                <div className="tru-scan-upload-zone">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        Array.from(files).forEach(file => {
                          const url = URL.createObjectURL(file);
                          setUploadedPhotos(prev => [...prev, {
                            id: `photo-${Date.now()}-${Math.random()}`,
                            url,
                            name: file.name
                          }]);
                        });
                      }
                    }}
                  />
                  <label htmlFor="photo-upload" className="tru-scan-upload-dropzone">
                    <div className="tru-scan-upload-icon">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="tru-scan-upload-text">
                      Drag & drop photos or videos here
                    </p>
                    <span className="tru-scan-upload-hint">or click to browse</span>
                    <span className="tru-scan-upload-formats">JPG, PNG, HEIC, MP4, MOV</span>
                  </label>
                </div>
                <div className="tru-scan-upload-tips mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                    <Info className="w-3 h-3" />
                    <span>Quick Tips</span>
                  </div>
                  <div className="space-y-2 pl-1">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground/90">
                      <Camera className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                      <span>Capture entire rooms</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground/90">
                      <Zap className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                      <span>Good lighting helps</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground/90">
                      <Layers className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                      <span>Multiple angles work best</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Demo & Actions */}
              <div className="flex flex-col items-center justify-center gap-4 border border-border rounded-2xl bg-background shadow-[0_4px_20px_-4px_hsl(var(--tm-ink)/0.08)] relative overflow-hidden">
                {/* Scanner content - show image when demo step >= 2 */}
                {demoStep >= 2 ? (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="relative w-full flex-1 overflow-hidden rounded-t-2xl">
                      <img src={sampleRoomLiving} alt="Scanning room" className="w-full h-full object-cover" />
                      {isScanning && (
                        <div className="tru-ai-scanner-overlay">
                          <div className="tru-ai-scanner-line" />
                        </div>
                      )}
                      {/* Detection bounding boxes - appear as items are detected */}
                      {DEMO_FURNITURE_POSITIONS.slice(0, Math.max(0, demoStep - 2)).map((item) => (
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
                    </div>
                    <p className="text-xs text-muted-foreground text-center px-4">
                      {isScanning 
                        ? `Detected ${detectedItems.length} of ${DEMO_ITEMS.length} items...`
                        : `Found ${detectedItems.length} items`
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

                {/* Demo step info */}
                {isDemoActive && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                    Step {demoStep} of {DEMO_TOTAL_STEPS}
                    {demoStep === 1 && " — Photo added to library"}
                    {demoStep === 2 && " — Scanning started"}
                    {demoStep > 2 && demoStep < DEMO_TOTAL_STEPS && " — Detecting items"}
                    {demoStep === DEMO_TOTAL_STEPS && " — Complete!"}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-2 w-full max-w-[280px] px-4">
                  {!isDemoActive ? (
                    <button
                      onClick={handleStartScanClick}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
                    >
                      <Sparkles className="w-4 h-4" />
                      {uploadedPhotos.length > 0 ? "Start Scanning" : "Watch Demo"}
                    </button>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>


                {/* Progress Bar */}
                {isDemoActive && (
                  <div className="w-full max-w-[280px] px-4">
                    <div className="tru-scan-progress-bar">
                      <div 
                        className="tru-scan-progress-fill"
                        style={{ width: `${(demoStep / DEMO_TOTAL_STEPS) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Photo Library - Compact */}
              <div className="tru-scan-library-panel tru-scan-library-compact">
                <div className="tru-scan-library-header">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Library</span>
                  <span className="tru-scan-library-count">{uploadedPhotos.length}</span>
                </div>
                <div className="tru-scan-library-grid tru-scan-library-grid-compact">
                  {uploadedPhotos.length === 0 ? (
                    <div className="tru-scan-library-empty tru-scan-library-empty-compact flex flex-col items-center gap-3 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Tap a room to upload</p>
                      <input
                        ref={roomUploadRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={handleRoomUpload}
                      />
                      <div className="grid grid-cols-3 gap-1.5 w-full px-1">
                        {[
                          { icon: Sofa, label: "Living", room: "Living Room" },
                          { icon: BedDouble, label: "Bed", room: "Bedroom" },
                          { icon: UtensilsCrossed, label: "Kitchen", room: "Kitchen" },
                          { icon: Bath, label: "Bath", room: "Bathroom" },
                          { icon: Warehouse, label: "Garage", room: "Garage" },
                          { icon: Box, label: "Storage", room: "Storage" },
                          { icon: Plus, label: "Other", room: "__other__" },
                        ].map(({ icon: Icon, label, room }) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => {
                              if (room === "__other__") {
                                const custom = window.prompt("Enter room name:");
                                if (custom?.trim()) handleRoomClick(custom.trim());
                              } else {
                                handleRoomClick(room);
                              }
                            }}
                            className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-3.5 text-xs font-medium text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground/40 flex items-center gap-1"><Video className="w-3 h-3" /> Photos or videos accepted</p>
                    </div>
                  ) : (
                    uploadedPhotos.map(photo => {
                      const isScanned = scannedPhotoIds.has(photo.id);
                      return (
                        <div key={photo.id} className={`tru-scan-library-item tru-scan-library-item-compact relative ${isScanned ? 'opacity-50 grayscale' : ''}`}>
                          <img src={photo.url} alt={photo.name} />
                          {isScanned && (
                            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 rounded-[inherit]">
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => setUploadedPhotos(prev => prev.filter(p => p.id !== photo.id))}
                            className="tru-scan-library-remove tru-scan-library-remove-compact"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowIntroModal(true);
                  }}
                  disabled={isScanning || uploadedPhotos.length === 0 || uploadedPhotos.every(p => p.id === 'demo-photo')}
                  className="tru-scan-library-analyze-btn tru-scan-library-analyze-btn-compact"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isScanning ? "Scanning..." : "Start Scanning"}
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
                <Link to="/site/online-estimate" className="tru-scan-floating-bar-btn">
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
                              <span>{item.name}</span>
                            </td>
                            <td>{item.room}</td>
                            <td>
                              <div className={`tru-scan-qty-controls ${!isUnlocked ? 'tru-scan-qty-disabled' : ''}`}>
                                <button 
                                  onClick={() => isUnlocked && setDetectedItems(prev => prev.filter(i => i.id !== item.id))}
                                  className="tru-scan-qty-btn"
                                  title={isUnlocked ? "Remove item" : "Unlock to edit"}
                                  disabled={!isUnlocked}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="tru-scan-qty-value">1</span>
                                <button 
                                  onClick={() => {
                                    if (!isUnlocked) return;
                                    // Duplicate item with new ID
                                    const newItem = { ...item, id: Date.now() + Math.random() };
                                    setDetectedItems(prev => [...prev, newItem]);
                                  }}
                                  className="tru-scan-qty-btn"
                                  title={isUnlocked ? "Add another" : "Unlock to edit"}
                                  disabled={!isUnlocked}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td>{item.weight}</td>
                            <td>{item.cuft}</td>
                            <td className="tru-scan-table-total">{item.weight}</td>
                            <td className="tru-scan-table-total">{item.cuft}</td>
                            <td>
                              <button
                                onClick={() => isUnlocked && setDetectedItems(prev => prev.filter(i => i.id !== item.id))}
                                className={`tru-scan-remove-btn ${!isUnlocked ? 'tru-scan-remove-disabled' : ''}`}
                                title={isUnlocked ? "Remove item" : "Unlock to edit"}
                                disabled={!isUnlocked}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={5}></td>
                          <td className="tru-scan-table-footer-label">Totals:</td>
                          <td>—</td>
                          <td className="tru-scan-table-footer-value">{totalWeight.toLocaleString()} lbs</td>
                          <td className="tru-scan-table-footer-value">{totalCuFt} cu ft</td>
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
                    <button
                      type="button"
                      onClick={() => {
                        // Save to localStorage for manual builder sync
                        const inventoryForBuilder = detectedItems.map((item, idx) => ({
                          id: `scanned-${item.id}-${Date.now()}`,
                          name: item.name,
                          room: item.room,
                          quantity: 1,
                          weightEach: item.weight,
                          cubicFeet: item.cuft,
                          imageUrl: item.image,
                        }));
                        localStorage.setItem('tm_scanned_inventory', JSON.stringify(inventoryForBuilder));
                        toast({
                          title: "Inventory Migrated Successfully!",
                          description: `${detectedItems.length} items have been synced to the manual builder.`,
                        });
                        navigate('/site/online-estimate');
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
              onClick={() => navigate("/site/online-estimate")}
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
            <Link to="/site/book" className="tru-secondary-action-btn">
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
      </div>
    </SiteShell>
  );
}
