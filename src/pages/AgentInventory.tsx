import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, ArrowLeft, Package, Upload, Wrench, Plus, Minus, Trash2, Search, X,
  Scale, Box, DollarSign, Save, Loader2, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ROOM_SUGGESTIONS, type ItemDefinition, calculateTotalCubicFeet, calculateTotalWeight, DENSITY_FACTOR } from "@/lib/priceCalculator";
import { cn } from "@/lib/utils";
import MoveSummaryPanel from "@/components/agent/MoveSummaryPanel";
import { 
  Sofa, Bed, UtensilsCrossed, Tv, Laptop, Baby, TreePine, Dumbbell,
  type LucideIcon 
} from "lucide-react";

const ROOM_CONFIG = [
  { id: 'Living Room', label: 'Living Room', icon: Sofa },
  { id: 'Bedroom', label: 'Bedroom', icon: Bed },
  { id: 'Dining Room', label: 'Dining Room', icon: UtensilsCrossed },
  { id: 'Kitchen', label: 'Kitchen', icon: UtensilsCrossed },
  { id: 'Appliances', label: 'Appliances', icon: Tv },
  { id: 'Office', label: 'Office', icon: Laptop },
  { id: 'Nursery', label: 'Nursery', icon: Baby },
  { id: 'Patio & Outdoor', label: 'Outdoor', icon: TreePine },
  { id: 'Garage', label: 'Garage', icon: Wrench },
  { id: 'Exercise & Sports', label: 'Exercise', icon: Dumbbell },
  { id: 'Boxes & Cartons', label: 'Boxes', icon: Box },
];

interface InventoryEntry {
  tempId: string;
  name: string;
  room: string;
  quantity: number;
  cubicFeet: number;
  weight: number;
  imageUrl?: string;
}

export default function AgentInventory() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState('Living Room');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [pricePerCuFt, setPricePerCuFt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [leadData, setLeadData] = useState<any>(null);

  // Fetch lead data for the summary panel
  useEffect(() => {
    if (!leadId) return;
    supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single()
      .then(({ data }) => {
        if (data) setLeadData(data);
      });
  }, [leadId]);

  const suggestions = ROOM_SUGGESTIONS[activeRoom] || [];

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return suggestions;
    const q = searchQuery.toLowerCase();
    return suggestions.filter(s => s.name.toLowerCase().includes(q));
  }, [suggestions, searchQuery]);

  // All items search across rooms
  const allSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: Array<ItemDefinition & { room: string }> = [];
    for (const [room, items] of Object.entries(ROOM_SUGGESTIONS)) {
      for (const item of items) {
        if (item.name.toLowerCase().includes(q)) {
          results.push({ ...item, room });
        }
      }
    }
    return results.slice(0, 20);
  }, [searchQuery]);

  const addItem = useCallback((item: ItemDefinition, room: string) => {
    setInventory(prev => {
      const existing = prev.find(e => e.name === item.name && e.room === room);
      if (existing) {
        return prev.map(e => 
          e.tempId === existing.tempId ? { ...e, quantity: e.quantity + 1 } : e
        );
      }
      return [...prev, {
        tempId: crypto.randomUUID(),
        name: item.name,
        room,
        quantity: 1,
        cubicFeet: item.cubicFeet,
        weight: item.defaultWeight,
        imageUrl: item.imageUrl,
      }];
    });
  }, []);

  const updateEntry = useCallback((tempId: string, field: keyof InventoryEntry, value: number) => {
    setInventory(prev => prev.map(e => 
      e.tempId === tempId ? { ...e, [field]: value } : e
    ));
  }, []);

  const removeEntry = useCallback((tempId: string) => {
    setInventory(prev => prev.filter(e => e.tempId !== tempId));
  }, []);

  const getItemQty = (name: string, room: string) => {
    return inventory.find(e => e.name === name && e.room === room)?.quantity || 0;
  };

  const totalCuFt = inventory.reduce((sum, e) => sum + e.cubicFeet * e.quantity, 0);
  const totalWeight = inventory.reduce((sum, e) => sum + e.weight * e.quantity, 0);
  const totalItems = inventory.reduce((sum, e) => sum + e.quantity, 0);
  const estimatedCost = pricePerCuFt ? totalCuFt * Number(pricePerCuFt) : 0;

  // Room counts for sidebar badges
  const roomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of inventory) {
      counts[item.room] = (counts[item.room] || 0) + item.quantity;
    }
    return counts;
  }, [inventory]);

  const handleSave = async () => {
    if (!leadId) return;
    setIsSaving(true);
    try {
      // Save inventory items
      if (inventory.length > 0) {
        const rows = inventory.map(e => ({
          lead_id: leadId,
          item_name: e.name,
          room: e.room,
          quantity: e.quantity,
          cubic_feet: e.cubicFeet,
          weight: e.weight,
          image_url: e.imageUrl || null,
        }));
        const { error } = await supabase.from("lead_inventory").insert(rows);
        if (error) throw error;
      }

      // Save price per cu ft on lead
      if (pricePerCuFt) {
        const { error } = await supabase
          .from("leads")
          .update({ price_per_cuft: Number(pricePerCuFt) } as any)
          .eq("id", leadId);
        if (error) throw error;
      }

      toast.success("Inventory saved");
      navigate(`/agent/payment?leadId=${leadId}`);
    } catch (err: any) {
      console.error("Error saving inventory:", err);
      toast.error("Failed to save inventory", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    navigate(`/agent/payment?leadId=${leadId}`);
  };

  return (
    <AgentShell breadcrumb=" / Inventory">
      <div className="p-4 h-[calc(100vh-3.5rem)] flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
        {/* Workflow breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <button
            onClick={() => navigate("/agent/new-customer")}
            className="flex items-center gap-1 text-primary hover:underline font-semibold"
          >
            <ArrowLeft className="w-3 h-3" />
            New Lead
          </button>
          <ArrowRight className="w-3 h-3" />
          <span className="text-primary font-semibold">Inventory</span>
          <ArrowRight className="w-3 h-3" />
          <span>Customer Detail</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Build Inventory
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Add items manually or import from website estimate</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip}>Skip for Now</Button>
            <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isSaving ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-fit">
            <TabsTrigger value="manual" className="gap-1.5 text-xs">
              <Wrench className="w-3.5 h-3.5" /> Build Manually
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-1.5 text-xs">
              <Upload className="w-3.5 h-3.5" /> Import from Website
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="flex-1 mt-3">
            <Card className="h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Import from Website</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  If the customer already completed an inventory on the website, you can import it here automatically.
                </p>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="flex-1 mt-3 min-h-0">
            <div className="flex gap-4 h-full min-h-0">
              {/* LEFT: Room sidebar + Item grid */}
              <div className="flex gap-3 flex-1 min-h-0">
                {/* Room sidebar */}
                <div className="w-36 flex-shrink-0 space-y-1 overflow-y-auto">
                  <div className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground mb-2 px-2">
                    Rooms
                  </div>
                  {ROOM_CONFIG.map((room) => {
                    const Icon = room.icon;
                    const count = roomCounts[room.id] || 0;
                    const isActive = activeRoom === room.id;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => { setActiveRoom(room.id); setSearchQuery(''); }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all text-xs",
                          isActive 
                            ? "border border-primary bg-primary/5 text-foreground font-semibold" 
                            : "border border-transparent hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate flex-1">{room.label}</span>
                        {count > 0 && (
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Item grid */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={`Search ${activeRoom} items...`}
                      className="pl-10 h-9 text-xs"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Items grid */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                      {(searchQuery ? allSearchResults : filteredSuggestions).map((item) => {
                        const room = 'room' in item ? (item as any).room : activeRoom;
                        const qty = getItemQty(item.name, room);
                        return (
                          <div
                            key={`${room}-${item.name}`}
                            className={cn(
                              "flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer group",
                              qty > 0 
                                ? "border-primary/40 bg-primary/5" 
                                : "border-border/60 hover:border-primary/30 hover:bg-muted/40"
                            )}
                            onClick={() => addItem(item, room)}
                          >
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain flex-shrink-0" />
                            ) : (
                              <Box className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium truncate">{item.name}</p>
                              <p className="text-[9px] text-muted-foreground">
                                {item.cubicFeet} cu ft · {item.defaultWeight} lbs
                              </p>
                            </div>
                            {qty > 0 ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const entry = inventory.find(en => en.name === item.name && en.room === room);
                                    if (entry) {
                                      if (entry.quantity <= 1) removeEntry(entry.tempId);
                                      else updateEntry(entry.tempId, 'quantity', entry.quantity - 1);
                                    }
                                  }}
                                  className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-destructive/20"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold min-w-[16px] text-center">{qty}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); addItem(item, room); }}
                                  className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center hover:bg-primary/30"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Inventory list with editable fields */}
              <div className="w-[380px] flex-shrink-0 flex flex-col min-h-0 border-l pl-4">
                {/* Price per cu ft */}
                <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-muted/50 border border-border/60">
                  <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Price per Cu Ft</Label>
                    <Input
                      type="number"
                      value={pricePerCuFt}
                      onChange={e => setPricePerCuFt(e.target.value)}
                      placeholder="e.g. 7.50"
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  {pricePerCuFt && totalCuFt > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Est. Total</p>
                      <p className="text-sm font-bold text-primary">${estimatedCost.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* Summary bar */}
                <div className="flex items-center gap-4 mb-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold">{totalItems}</span>
                    <span className="text-muted-foreground">items</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold">{totalCuFt.toLocaleString()}</span>
                    <span className="text-muted-foreground">cu ft</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold">{totalWeight.toLocaleString()}</span>
                    <span className="text-muted-foreground">lbs</span>
                  </div>
                </div>

                {/* Inventory list */}
                <div className="flex-1 overflow-y-auto space-y-1.5">
                  {inventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Package className="w-10 h-10 mb-3 opacity-40" />
                      <p className="text-sm font-medium">No items yet</p>
                      <p className="text-xs mt-1">Click items on the left to add them</p>
                    </div>
                  ) : (
                    inventory.map((entry) => (
                      <div
                        key={entry.tempId}
                        className="p-2.5 rounded-lg border border-border/60 bg-card space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{entry.name}</p>
                            <p className="text-[9px] text-muted-foreground">{entry.room}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.tempId)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-[9px] text-muted-foreground">Qty</Label>
                            <Input
                              type="number"
                              min={1}
                              value={entry.quantity}
                              onChange={e => updateEntry(entry.tempId, 'quantity', Math.max(1, Number(e.target.value)))}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[9px] text-muted-foreground">Cu Ft</Label>
                            <Input
                              type="number"
                              min={0}
                              value={entry.cubicFeet}
                              onChange={e => updateEntry(entry.tempId, 'cubicFeet', Number(e.target.value))}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[9px] text-muted-foreground">Weight (lbs)</Label>
                            <Input
                              type="number"
                              min={0}
                              value={entry.weight}
                              onChange={e => updateEntry(entry.tempId, 'weight', Number(e.target.value))}
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>

        {/* Move Summary sidebar */}
        {leadData && <MoveSummaryPanel lead={leadData} />}
      </div>
    </AgentShell>
  );
}
