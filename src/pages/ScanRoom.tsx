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
  Sofa, BedDouble, UtensilsCrossed, Bath, Warehouse, Check
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

  // Simulate live detection with slower speed for better demo experience
  useEffect(() => {
    if (isScanning && detectedItems.length < DEMO_ITEMS.length) {
      const timer = setTimeout(() => {
        setDetectedItems(prev => [...prev, DEMO_ITEMS[prev.length]]);
      }, 2500);
      return () => clearTimeout(timer);
    } else if (detectedItems.length >= DEMO_ITEMS.length && isScanning) {
      setIsScanning(false);
    }
  }, [isScanning, detectedItems]);


  const handleStartScanClick = () => {
    setShowIntroModal(true);
  };

  const startDemo = () => {
    setDetectedItems([]);
    setIsScanning(true);
    // Mark all current photos as being scanned
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
        {/* Sticky Command Center Header - matches OnlineEstimate */}
        <div className="sticky top-[102px] z-40">
          <header className="tracking-header">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="TruMove" className="h-6 brightness-0 invert" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
                AI Move Estimator
              </span>
            </div>
            <EstimatorNavToggle />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[11px] text-white/80 uppercase tracking-wider">AI Scanner</div>
                <div className="text-sm font-mono text-white">Beta</div>
              </div>
            </div>
          </header>
        </div>

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
        </section>

        {/* Scan Intro Modal */}
        <ScanIntroModal 
          isOpen={showIntroModal}
          onClose={() => setShowIntroModal(false)}
          onStartScan={startDemo}
        />

        {/* How It Works - Compact Inline Steps with scroll animation */}
        <section className="container max-w-3xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-0">
            {[
              { num: "1", title: "Upload", desc: "Photos or videos" },
              { num: "2", title: "AI Scans", desc: "Detects every item" },
              { num: "3", title: "Get Quote", desc: "Instant estimate" },
            ].map((step, i) => (
              <ScrollFadeIn key={step.num} delay={i * 0.15}>
                <div className="flex items-center gap-2.5 px-4 py-2.5">
                  <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {step.num}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground leading-tight">{step.title}</span>
                    <span className="text-[10px] text-muted-foreground/60 leading-tight">{step.desc}</span>
                  </div>
                  {i < 2 && <span className="hidden sm:block text-muted-foreground/30 ml-3 mr-1">→</span>}
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </section>

        {/* Room Inventory Analysis Section */}
        <section className="tru-scan-split-demo">
          <div className="container max-w-6xl mx-auto px-4">

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
                <div className="tru-scan-upload-tips">
                  <p>📸 Capture entire rooms</p>
                  <p>💡 Good lighting helps</p>
                  <p>📐 Multiple angles work best</p>
                </div>
              </div>

              {/* Center: Demo & Actions */}
              <div className="flex flex-col items-center justify-center gap-6 py-8 border border-border rounded-2xl bg-background shadow-[0_4px_20px_-4px_hsl(var(--tm-ink)/0.08)]">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                    <Scan className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">AI Room Scanner</h3>
                  <p className="text-sm text-muted-foreground max-w-[240px]">
                    Upload your room photos or videos and our AI will detect every item automatically.
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-[220px]">
                  <button
                    onClick={handleStartScanClick}
                    disabled={isScanning}
                    className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isScanning ? "Scanning..." : "Watch Demo"}
                  </button>

                </div>


                {/* Progress Bar - Only show during scanning */}
                {isScanning && (
                  <div className="w-full max-w-[220px]">
                    <div className="tru-scan-progress-bar">
                      <div 
                        className="tru-scan-progress-fill"
                        style={{ width: `${(detectedItems.length / DEMO_ITEMS.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 block text-center">
                      {Math.round((detectedItems.length / DEMO_ITEMS.length) * 100)}% Complete
                    </span>
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
                  onClick={() => handleStartScanClick()}
                  disabled={isScanning}
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
      </div>
    </SiteShell>
  );
}
