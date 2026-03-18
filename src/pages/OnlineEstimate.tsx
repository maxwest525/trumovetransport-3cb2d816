import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Scroll to top on mount
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
import { format } from "date-fns";
import { Lock, Package, Truck, Calculator, Scan, Sparkles, Shield, BadgeCheck, Clock } from "lucide-react";
import logoImg from "@/assets/logo.png";
import ChatModal from "@/components/chat/ChatModal";
import SiteShell from "@/components/layout/SiteShell";
import InventoryBuilder from "@/components/estimate/InventoryBuilder";
import InventoryTable from "@/components/estimate/InventoryTable";
import InventoryIntroModal from "@/components/estimate/InventoryIntroModal";
import EstimateWizard, { type ExtendedMoveDetails } from "@/components/estimate/EstimateWizard";
import QuoteSnapshotVertical from "@/components/estimate/QuoteSnapshotVertical";
import QuoteSnapshot from "@/components/estimate/QuoteSnapshot";
import CompactInventoryList from "@/components/estimate/CompactInventoryList";
import FloatingInventoryHelper from "@/components/estimate/FloatingInventoryHelper";


import { type InventoryItem, type MoveDetails, calculateTotalWeight, calculateTotalCubicFeet, formatCurrency, calculateEstimate, determineMoveType, ROOM_SUGGESTIONS } from "@/lib/priceCalculator";
import { calculateDistance } from "@/lib/distanceCalculator";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Helper function to map homepage size values to wizard values
function mapHomeSize(size: string): string {
  const sizeMap: Record<string, string> = {
    'Studio': 'studio',
    '1 Bedroom': '1br',
    '2 Bedroom': '2br',
    '3 Bedroom': '3br',
    '4+ Bedroom': '4br+',
    'Office': '2br',
  };
  return sizeMap[size] || '';
}

export default function OnlineEstimate() {
  useScrollToTop();
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [wizardComplete, setWizardComplete] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [specialHandling, setSpecialHandling] = useState(false);
  const [extendedDetails, setExtendedDetails] = useState<ExtendedMoveDetails | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const inventoryRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  
  const totalCubicFeet = useMemo(() => calculateTotalCubicFeet(items), [items]);
  const totalWeight = useMemo(() => calculateTotalWeight(items), [items]);

  const scrollToInventory = useCallback(() => {
    inventoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToTable = useCallback(() => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Auto-populate from homepage data stored in localStorage (including name/email/phone)
  useEffect(() => {
    const storedLead = localStorage.getItem("tm_lead");
    if (storedLead && !extendedDetails) {
      try {
        const lead = JSON.parse(storedLead);
        
        // Pre-populate extendedDetails with ALL homepage data including contact info
        setExtendedDetails({
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          fromLocation: lead.fromCity ? `${lead.fromCity} ${lead.fromZip}` : lead.fromZip || '',
          toLocation: lead.toCity ? `${lead.toCity} ${lead.toZip}` : lead.toZip || '',
          homeSize: mapHomeSize(lead.size) || '',
          toHomeSize: '',
          moveDate: lead.moveDate ? new Date(lead.moveDate) : null,
          fromPropertyType: lead.propertyType || 'house',
          toPropertyType: 'house',
          fromFloor: lead.floor || 1,
          toFloor: 1,
          fromHasElevator: lead.hasElevator || false,
          toHasElevator: false,
          hasVehicleTransport: false,
          needsPackingService: false,
          isMultiStop: false,
          pickupLocations: [],
          dropoffLocations: [],
          optimizedRoute: null,
        });
      } catch (e) {
        console.error("Failed to parse stored lead data:", e);
      }
    }
  }, [extendedDetails]);

  // Auto-import scanned inventory from AI Scan and bypass the wizard form
  useEffect(() => {
    const scannedData = localStorage.getItem('tm_scanned_inventory');
    if (scannedData) {
      try {
        const scannedItems = JSON.parse(scannedData) as Array<{
          id: string; name: string; room: string; quantity: number;
          weightEach: number; cubicFeet: number; specialHandling: boolean; imageUrl?: string;
        }>;
        if (scannedItems.length > 0) {
          setItems(scannedItems);
          setWizardComplete(true); // Skip the wizard — go straight to inventory builder
          localStorage.removeItem('tm_scanned_inventory'); // Consume so it doesn't re-import
          toast({
            title: "Scanned inventory loaded",
            description: `${scannedItems.length} items imported from AI Scan.`,
          });
        }
      } catch (e) {
        console.error("Failed to parse scanned inventory:", e);
      }
    }
  }, []);
  
  // Derived move details for pricing
  const moveDetails = useMemo<MoveDetails>(() => {
    if (!extendedDetails) {
      return {
        fromLocation: '',
        toLocation: '',
        distance: 0,
        moveType: 'auto' as const,
        moveDate: '',
        homeSize: '' as MoveDetails['homeSize'],
      };
    }
    
    // Extract ZIP codes for distance calculation
    const fromZip = extendedDetails.fromLocation.match(/\d{5}/)?.[0] || '';
    const toZip = extendedDetails.toLocation.match(/\d{5}/)?.[0] || '';
    const distance = calculateDistance(fromZip, toZip);
    const moveType = determineMoveType(distance);
    
    return {
      fromLocation: extendedDetails.fromLocation,
      toLocation: extendedDetails.toLocation,
      distance,
      moveType,
      moveDate: extendedDetails.moveDate ? format(extendedDetails.moveDate, 'yyyy-MM-dd') : '',
      homeSize: extendedDetails.homeSize as MoveDetails['homeSize'],
    };
  }, [extendedDetails]);

  const handleAddItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    setItems(prev => {
      // Check if identical item exists (same name, room, weight, cubicFeet)
      const existingIndex = prev.findIndex(existing => 
        existing.name === item.name && 
        existing.room === item.room && 
        existing.weightEach === item.weightEach &&
        existing.cubicFeet === item.cubicFeet
      );
      
      if (existingIndex !== -1) {
        // Increment quantity of existing item
        return prev.map((existing, index) => 
          index === existingIndex 
            ? { ...existing, quantity: existing.quantity + (item.quantity || 1) }
            : existing
        );
      }
      
      // Add as new item
      const newItem: InventoryItem = {
        ...item,
        id: crypto.randomUUID(),
      };
      return [...prev, newItem];
    });
  }, []);

  const handleUpdateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.id !== id));
    } else {
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setItems([]);
  }, []);

  const handleReorder = useCallback((reorderedItems: InventoryItem[]) => {
    setItems(reorderedItems);
  }, []);

  // AI Estimate handler - calls edge function to get suggested items based on home size
  const handleAIEstimate = useCallback(async () => {
    const homeSize = extendedDetails?.homeSize || '1br';
    setIsEstimating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('estimate-inventory', {
        body: { homeSize }
      });
      
      if (error) {
        console.error('AI Estimate error:', error);
        toast({
          title: "Estimation failed",
          description: "Unable to generate inventory suggestions. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      if (data?.suggestions && Array.isArray(data.suggestions)) {
        // Add each suggested item to inventory
        for (const suggestion of data.suggestions) {
          // Find the item in ROOM_SUGGESTIONS
          const roomItems = ROOM_SUGGESTIONS[suggestion.room];
          if (roomItems) {
            const itemDef = roomItems.find(i => i.name === suggestion.name);
            if (itemDef) {
              // Add the item with the suggested quantity
              const newItem: Omit<InventoryItem, 'id'> = {
                name: itemDef.name,
                room: suggestion.room,
                quantity: suggestion.quantity || 1,
                weightEach: itemDef.defaultWeight,
                cubicFeet: itemDef.cubicFeet || Math.ceil(itemDef.defaultWeight / 7),
                specialHandling: false,
                imageUrl: itemDef.imageUrl,
              };
              handleAddItem(newItem);
            }
          }
        }
        
        toast({
          title: "Inventory populated!",
          description: `Added ${data.suggestions.length} items based on your ${homeSize} home.`,
        });
      }
    } catch (err) {
      console.error('AI Estimate error:', err);
      toast({
        title: "Estimation failed",
        description: "Unable to generate inventory suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEstimating(false);
    }
  }, [extendedDetails?.homeSize, handleAddItem]);

  const handleWizardComplete = (details: ExtendedMoveDetails) => {
    setExtendedDetails(details);
    setShowIntroModal(true);
  };

  const handleCloseModal = () => {
    setShowIntroModal(false);
    setWizardComplete(true);
  };

  const handleSubmit = () => {
    if (!extendedDetails) return;
    
    const totalWeight = calculateTotalWeight(items);
    const effectiveMoveType = moveDetails.moveType === 'auto' 
      ? (moveDetails.distance >= 150 ? 'long-distance' : 'local')
      : moveDetails.moveType;
    const estimate = calculateEstimate(totalWeight, moveDetails.distance, effectiveMoveType);
    
    const inventoryList = items.map(item => 
      `• ${item.name} (${item.room}) - Qty: ${item.quantity}, Weight: ${item.quantity * item.weightEach} lbs`
    ).join('\n');

    const subject = encodeURIComponent(`TruMove Quote Request - ${extendedDetails.name}`);
    const body = encodeURIComponent(`
TruMove Moving Quote Request

CONTACT INFORMATION
Name: ${extendedDetails.name}
Email: ${extendedDetails.email}
Phone: ${extendedDetails.phone}

MOVE DETAILS
From: ${extendedDetails.fromLocation}
  Type: ${extendedDetails.fromPropertyType}${extendedDetails.fromPropertyType === 'apartment' ? ` (Floor ${extendedDetails.fromFloor}, ${extendedDetails.fromHasElevator ? 'Elevator' : 'Stairs'})` : ''}

To: ${extendedDetails.toLocation}
  Type: ${extendedDetails.toPropertyType}${extendedDetails.toPropertyType === 'apartment' ? ` (Floor ${extendedDetails.toFloor}, ${extendedDetails.toHasElevator ? 'Elevator' : 'Stairs'})` : ''}

Distance: ${moveDetails.distance} miles
Move Type: ${effectiveMoveType}
Target Date: ${extendedDetails.moveDate ? format(extendedDetails.moveDate, 'MMMM d, yyyy') : 'Not specified'}
Home Size: ${extendedDetails.homeSize}

INVENTORY (${items.length} items, ${totalWeight.toLocaleString()} lbs total)
${inventoryList}

ESTIMATED RANGE: ${formatCurrency(estimate.min)} - ${formatCurrency(estimate.max)}

---
Generated by TruMove Online Estimate Tool
    `.trim());

    window.location.href = `mailto:quotes@trumove.com?subject=${subject}&body=${body}`;
  };

  return (
    <SiteShell hideTrustStrip>
      {/* Sticky Command Center Header - matches Connect With Us & Shipment Tracking */}
      <div className="sticky top-[102px] z-40">
        <header className="tracking-header">
          {/* Left - Logo & Title */}
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="TruMove" 
              className="h-6 brightness-0 invert"
            />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
              AI Move Estimator
            </span>
          </div>

          {/* Center - Trust Indicators */}
          <div className="tracking-header-trust">
            <span className="tracking-header-trust-item">
              <Calculator className="w-3.5 h-3.5 text-primary" />
              200+ ITEMS
            </span>
            <span className="tracking-header-trust-dot">•</span>
            <span className="tracking-header-trust-item">
              <Scan className="w-3.5 h-3.5 text-primary" />
              AI POWERED
            </span>
            <span className="tracking-header-trust-dot">•</span>
            <span className="tracking-header-trust-item">
              <Shield className="w-3.5 h-3.5 text-primary" />
              INSTANT QUOTE
            </span>
          </div>

          {/* Right - Estimate ID */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-white/80 uppercase tracking-wider">Estimate ID</div>
              <div className="text-sm font-mono text-white">TM-EST-{String(Date.now()).slice(-8)}</div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[1440px] mx-auto">

          {/* Section Header - centered with mb-10 matching Connect With Us */}
          <div className="flex flex-col items-center justify-center text-center mb-10 max-w-xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3">
              Build Your <span className="tru-qb-title-accent">Move</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add your household items or scan your rooms so we can accurately model what you are moving and plan your route with confidence.
            </p>
          </div>

          {/* Conditional Layout: 3-column when locked, 2-column when unlocked */}
          {!wizardComplete ? (
            // LOCKED STATE: Three-Column Layout - Form (left) | Inventory (expanded center) | Summary (right)
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_240px] gap-4 items-start">
            {/* Left Column - Wizard */}
            <div className="space-y-4">
              <div className="tru-floating-form-card tru-floating-form-compact tru-estimate-card-frame">
                <EstimateWizard onComplete={handleWizardComplete} initialDetails={extendedDetails} />
              </div>
            </div>

            {/* Center Column - Inventory Builder (locked, takes full remaining width) */}
            <div className="relative w-full min-w-0">
              {/* Locked Overlay */}
              <div className="tru-inventory-locked-overlay">
                <div className="tru-inventory-locked-content">
                  <div className="tru-inventory-locked-icon">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="tru-inventory-locked-title">Inventory Builder</span>
                  <span className="tru-inventory-locked-subtitle">Complete the form to unlock</span>
                </div>
              </div>
              
              {/* Inventory Builder (blurred) with muted header */}
              <div className="rounded-2xl border border-border/60 bg-card shadow-lg tru-inventory-locked w-full overflow-hidden tru-estimate-card-frame">
                {/* Muted Header - maintains black/green aesthetic but blurred */}
                <div className="tru-summary-header-large border-b border-border/40 opacity-50 dark:!bg-[hsl(220,15%,8%)]">
                  <div className="text-center flex-1">
                    <h3 className="text-lg font-black text-foreground">
                      Build Your <span className="tru-qb-title-accent">Move</span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Add items or scan your rooms</p>
                  </div>
                </div>
                
                <div className="p-5">
                  <InventoryBuilder 
                    onAddItem={handleAddItem} 
                    inventoryItems={items}
                    onUpdateQuantity={handleUpdateQuantity}
                    onClearAll={handleClearAll}
                    specialHandling={specialHandling}
                    onSpecialHandlingChange={setSpecialHandling}
                    isLocked={true}
                    onAIEstimate={handleAIEstimate}
                    isEstimating={isEstimating}
                    homeSize={extendedDetails?.homeSize}
                    hasVehicleTransport={extendedDetails?.hasVehicleTransport ?? false}
                    onVehicleTransportChange={(val) => setExtendedDetails(prev => prev ? { ...prev, hasVehicleTransport: val } : prev)}
                    needsPackingService={extendedDetails?.needsPackingService ?? false}
                    onPackingServiceChange={(val) => setExtendedDetails(prev => prev ? { ...prev, needsPackingService: val } : prev)}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Summary (far right) */}
            <div className="hidden lg:block lg:sticky lg:top-6">
              <QuoteSnapshotVertical items={items} moveDetails={moveDetails} extendedDetails={extendedDetails} onEdit={() => {}} />
            </div>
          </div>
        ) : (
          /* UNLOCKED STATE: Two-Column Layout - Inventory Builder | Sidebar */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
            {/* Left Column - Expanded Inventory Builder + Inventory List with thumbnails */}
            <div className="space-y-6">
              
              {/* Inventory Builder */}
              <div ref={inventoryRef} className="rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden tru-estimate-card-frame">
                {/* Header - Enlarged and Centered */}
                <div className="tru-summary-header-large border-b border-border/40 dark:!bg-[hsl(220,15%,8%)]">
                  <div className="text-center flex-1">
                    <h3 className="text-lg font-black text-foreground">
                      Build Your <span className="tru-qb-title-accent">Move</span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Add items or scan your rooms</p>
                  </div>
                </div>
                
                <div className="p-5">
                  <InventoryBuilder 
                    onAddItem={handleAddItem} 
                    inventoryItems={items}
                    onUpdateQuantity={handleUpdateQuantity}
                    onClearAll={handleClearAll}
                    specialHandling={specialHandling}
                    onSpecialHandlingChange={setSpecialHandling}
                    isLocked={false}
                    onAIEstimate={handleAIEstimate}
                    isEstimating={isEstimating}
                    homeSize={extendedDetails?.homeSize}
                    hasVehicleTransport={extendedDetails?.hasVehicleTransport ?? false}
                    onVehicleTransportChange={(val) => setExtendedDetails(prev => prev ? { ...prev, hasVehicleTransport: val } : prev)}
                    needsPackingService={extendedDetails?.needsPackingService ?? false}
                    onPackingServiceChange={(val) => setExtendedDetails(prev => prev ? { ...prev, needsPackingService: val } : prev)}
                  />
                </div>
              </div>

              {/* Unified Inventory Table with thumbnails */}
              {items.length > 0 && (
                <div ref={tableRef} className="tru-estimate-card-frame rounded-2xl overflow-hidden">
                  <InventoryTable 
                    items={items}
                    onUpdateItem={handleUpdateItem}
                    onRemoveItem={handleRemoveItem}
                    onClear={handleClearAll}
                    onReorder={handleReorder}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Move Summary (details) + Weather + Inventory Summary (room counts) + Finalize */}
            <div className="space-y-4 lg:sticky lg:top-6">
              {/* Move Summary - Full details from customer */}
              <QuoteSnapshotVertical items={items} moveDetails={moveDetails} extendedDetails={extendedDetails} onEdit={() => setWizardComplete(false)} />


              {/* Finalize Section */}
              {items.length > 0 && (
                <section className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm tru-estimate-card-frame">
                  {/* Header - Enlarged and Centered */}
                  <div className="tru-summary-header-large border-b border-border/40">
                    <div className="text-center flex-1">
                      <h3 className="text-lg font-black text-foreground">
                        Finalize Your <span className="tru-qb-title-accent">Estimate</span>
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="tru-qb-continue w-full"
                    >
                      Send My Estimate Request →
                    </button>
                    
                    {/* View Route Button */}
                    {extendedDetails?.fromLocation && extendedDetails?.toLocation && (
                      <button
                        type="button"
                        className="w-full py-2.5 text-sm text-muted-foreground hover:text-primary border border-dashed border-border/50 hover:border-primary/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        onClick={() => {
                          localStorage.setItem('trumove_pending_route', JSON.stringify({
                            originAddress: extendedDetails.fromLocation,
                            destAddress: extendedDetails.toLocation,
                          }));
                          navigate('/site/track');
                        }}
                      >
                        <Truck className="w-4 h-4" />
                        <span>View Route on Map</span>
                      </button>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Floating Inventory Helper - shows when items exist and wizard complete */}
      {wizardComplete && (
        <FloatingInventoryHelper 
          items={items} 
          onScrollToBottom={scrollToTable}
        />
      )}

      {/* Intro Modal */}
      <InventoryIntroModal
        isOpen={showIntroModal}
        onClose={handleCloseModal}
        distance={moveDetails.distance}
        moveType={moveDetails.moveType}
      />


      {/* Chat Modal */}
      <ChatModal 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        initialFromLocation={extendedDetails?.fromLocation || ''}
        initialToLocation={extendedDetails?.toLocation || ''}
      />
    </SiteShell>
  );
}
