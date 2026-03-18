import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Minus, 
  Search, 
  X, 
  Sofa, 
  Bed, 
  UtensilsCrossed, 
  Tv, 
  Box, 
  Dumbbell, 
  TreePine, 
  Wrench, 
  Baby, 
  Laptop,
  Trash2,
  ShieldCheck,
  Lamp,
  Armchair,
  Music,
  Snowflake,
  BookOpen,
  Archive,
  Table,
  Coffee,
  Utensils,
  Monitor,
  FileBox,
  Hammer,
  Package,
  Bath,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Scale,
  Sparkles,
  Camera,
  Wand2,
  Car,
  type LucideIcon
} from "lucide-react";
import { ROOM_SUGGESTIONS, type InventoryItem, type ItemDefinition } from "@/lib/priceCalculator";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CustomItemModal } from "./CustomItemModal";
import { InventoryItemImage } from "./InventoryItemImage";
import scanRoomPreview from "@/assets/scan-room-preview.jpg";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

interface InventoryBuilderProps {
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  inventoryItems?: InventoryItem[];
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onClearAll?: () => void;
  specialHandling?: boolean;
  onSpecialHandlingChange?: (value: boolean) => void;
  isLocked?: boolean;
  onAIEstimate?: () => void;
  isEstimating?: boolean;
  homeSize?: string;
  hasVehicleTransport?: boolean;
  onVehicleTransportChange?: (value: boolean) => void;
  needsPackingService?: boolean;
  onPackingServiceChange?: (value: boolean) => void;
}

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

// Popular items for quick access (most commonly moved)
const POPULAR_ITEMS = [
  { name: 'Sofa, 3 Cushion', room: 'Living Room' },
  { name: 'Bed, Queen (complete)', room: 'Bedroom' },
  { name: 'Dining Table', room: 'Dining Room' },
  { name: 'Refrigerator (22+ cu ft)', room: 'Appliances' },
  { name: 'Medium Box', room: 'Boxes & Cartons' },
  { name: 'Dresser, Triple', room: 'Bedroom' },
  { name: 'TV, Plasma/LCD', room: 'Living Room' },
  { name: 'Desk', room: 'Office' },
  { name: 'Coffee Table', room: 'Living Room' },
  { name: 'Wardrobe Box', room: 'Boxes & Cartons' },
  { name: 'Dining Chair', room: 'Dining Room' },
  { name: 'Bookcase, Medium', room: 'Living Room' },
];

// Room presets for quick setup
const ROOM_PRESETS: Record<string, Array<{ name: string; room: string; quantity: number }>> = {
  'studio': [
    { name: 'Bed, Full (complete)', room: 'Bedroom', quantity: 1 },
    { name: 'Dresser, Single', room: 'Bedroom', quantity: 1 },
    { name: 'Night Stand', room: 'Bedroom', quantity: 1 },
    { name: 'Sofa, Loveseat', room: 'Living Room', quantity: 1 },
    { name: 'Coffee Table', room: 'Living Room', quantity: 1 },
    { name: 'TV, Plasma/LCD', room: 'Living Room', quantity: 1 },
    { name: 'Kitchen Table', room: 'Kitchen', quantity: 1 },
    { name: 'Kitchen Chair', room: 'Kitchen', quantity: 2 },
    { name: 'Medium Box', room: 'Boxes & Cartons', quantity: 15 },
    { name: 'Small Box', room: 'Boxes & Cartons', quantity: 10 },
  ],
  '1br': [
    { name: 'Bed, Queen (complete)', room: 'Bedroom', quantity: 1 },
    { name: 'Dresser, Triple', room: 'Bedroom', quantity: 1 },
    { name: 'Night Stand', room: 'Bedroom', quantity: 2 },
    { name: 'Sofa, 3 Cushion', room: 'Living Room', quantity: 1 },
    { name: 'Coffee Table', room: 'Living Room', quantity: 1 },
    { name: 'TV, Plasma/LCD', room: 'Living Room', quantity: 1 },
    { name: 'End Table', room: 'Living Room', quantity: 2 },
    { name: 'Dining Table', room: 'Dining Room', quantity: 1 },
    { name: 'Dining Chair', room: 'Dining Room', quantity: 4 },
    { name: 'Refrigerator (22+ cu ft)', room: 'Appliances', quantity: 1 },
    { name: 'Washer, Front Load', room: 'Appliances', quantity: 1 },
    { name: 'Dryer, Front Load', room: 'Appliances', quantity: 1 },
    { name: 'Medium Box', room: 'Boxes & Cartons', quantity: 20 },
    { name: 'Small Box', room: 'Boxes & Cartons', quantity: 15 },
    { name: 'Wardrobe Box', room: 'Boxes & Cartons', quantity: 2 },
  ],
  '2br': [
    { name: 'Bed, Queen (complete)', room: 'Bedroom', quantity: 1 },
    { name: 'Bed, Full (complete)', room: 'Bedroom', quantity: 1 },
    { name: 'Dresser, Triple', room: 'Bedroom', quantity: 2 },
    { name: 'Night Stand', room: 'Bedroom', quantity: 4 },
    { name: 'Sofa, 3 Cushion', room: 'Living Room', quantity: 1 },
    { name: 'Chair, Overstuffed', room: 'Living Room', quantity: 1 },
    { name: 'Coffee Table', room: 'Living Room', quantity: 1 },
    { name: 'TV, Plasma/LCD', room: 'Living Room', quantity: 2 },
    { name: 'End Table', room: 'Living Room', quantity: 2 },
    { name: 'Bookcase, Medium', room: 'Living Room', quantity: 1 },
    { name: 'Dining Table', room: 'Dining Room', quantity: 1 },
    { name: 'Dining Chair', room: 'Dining Room', quantity: 6 },
    { name: 'Refrigerator (22+ cu ft)', room: 'Appliances', quantity: 1 },
    { name: 'Washer, Front Load', room: 'Appliances', quantity: 1 },
    { name: 'Dryer, Front Load', room: 'Appliances', quantity: 1 },
    { name: 'Desk', room: 'Office', quantity: 1 },
    { name: 'Office Chair', room: 'Office', quantity: 1 },
    { name: 'Medium Box', room: 'Boxes & Cartons', quantity: 30 },
    { name: 'Small Box', room: 'Boxes & Cartons', quantity: 20 },
    { name: 'Large Box', room: 'Boxes & Cartons', quantity: 10 },
    { name: 'Wardrobe Box', room: 'Boxes & Cartons', quantity: 4 },
  ],
  '3br': [
    { name: 'Bed, King (complete)', room: 'Bedroom', quantity: 1 },
    { name: 'Bed, Queen (complete)', room: 'Bedroom', quantity: 1 },
    { name: 'Bed, Full (complete)', room: 'Bedroom', quantity: 1 },
    { name: 'Dresser, Triple', room: 'Bedroom', quantity: 2 },
    { name: 'Dresser, Double', room: 'Bedroom', quantity: 1 },
    { name: 'Night Stand', room: 'Bedroom', quantity: 6 },
    { name: 'Chest of Drawers', room: 'Bedroom', quantity: 2 },
    { name: 'Sofa, Sectional', room: 'Living Room', quantity: 1 },
    { name: 'Chair, Overstuffed', room: 'Living Room', quantity: 2 },
    { name: 'Coffee Table', room: 'Living Room', quantity: 1 },
    { name: 'TV, Plasma/LCD', room: 'Living Room', quantity: 3 },
    { name: 'TV Stand', room: 'Living Room', quantity: 2 },
    { name: 'End Table', room: 'Living Room', quantity: 2 },
    { name: 'Bookcase, Large', room: 'Living Room', quantity: 1 },
    { name: 'Dining Table', room: 'Dining Room', quantity: 1 },
    { name: 'Dining Chair', room: 'Dining Room', quantity: 8 },
    { name: 'Buffet/Hutch', room: 'Dining Room', quantity: 1 },
    { name: 'Refrigerator (22+ cu ft)', room: 'Appliances', quantity: 1 },
    { name: 'Washer, Front Load', room: 'Appliances', quantity: 1 },
    { name: 'Dryer, Front Load', room: 'Appliances', quantity: 1 },
    { name: 'Desk', room: 'Office', quantity: 2 },
    { name: 'Office Chair', room: 'Office', quantity: 2 },
    { name: 'File Cabinet, 2 Drawer', room: 'Office', quantity: 1 },
    { name: 'Medium Box', room: 'Boxes & Cartons', quantity: 45 },
    { name: 'Small Box', room: 'Boxes & Cartons', quantity: 30 },
    { name: 'Large Box', room: 'Boxes & Cartons', quantity: 15 },
    { name: 'Wardrobe Box', room: 'Boxes & Cartons', quantity: 6 },
    { name: 'Dish Pack', room: 'Boxes & Cartons', quantity: 4 },
  ],
};

// Icon mapping for inventory items based on item name keywords
const getItemIcon = (itemName: string, roomId: string): LucideIcon => {
  const name = itemName.toLowerCase();
  
  // Specific item keywords - Seating
  if (name.includes('sofa') || name.includes('couch') || name.includes('loveseat') || name.includes('sectional')) return Sofa;
  if (name.includes('armchair') || name.includes('recliner') || name.includes('rocker') || name.includes('overstuffed')) return Armchair;
  
  // Beds
  if (name.includes('bed') || name.includes('mattress') || name.includes('bunk')) return Bed;
  
  // Entertainment & Electronics
  if (name.includes('tv') || name.includes('television') || name.includes('entertainment') || name.includes('stereo')) return Tv;
  if (name.includes('computer') || name.includes('monitor') || name.includes('printer') || name.includes('scanner')) return Monitor;
  
  // Lighting
  if (name.includes('lamp') || name.includes('light')) return Lamp;
  
  // Office & Desk
  if (name.includes('desk')) return Laptop;
  if (name.includes('bookcase') || name.includes('bookshelf') || name.includes('shelf')) return BookOpen;
  if (name.includes('file cabinet') || name.includes('credenza')) return FileBox;
  
  // Kitchen & Appliances
  if (name.includes('refrigerator') || name.includes('freezer')) return Snowflake;
  if (name.includes('washer') || name.includes('dryer')) return Archive;
  if (name.includes('microwave') || name.includes('dishwasher') || name.includes('stove') || name.includes('oven') || name.includes('range')) return Utensils;
  if (name.includes('coffee')) return Coffee;
  
  // Musical Instruments
  if (name.includes('piano') || name.includes('organ') || name.includes('keyboard')) return Music;
  
  // Storage & Furniture
  if (name.includes('dresser') || name.includes('chest') || name.includes('wardrobe') || name.includes('armoire')) return Archive;
  if (name.includes('table') || name.includes('nightstand') || name.includes('stand')) return Table;
  if (name.includes('chair')) return Armchair;
  if (name.includes('mirror')) return Monitor;
  
  // Exercise & Sports
  if (name.includes('treadmill') || name.includes('elliptical') || name.includes('weight') || name.includes('gym') || name.includes('bike')) return Dumbbell;
  
  // Baby & Nursery
  if (name.includes('crib') || name.includes('changing') || name.includes('highchair') || name.includes('stroller') || name.includes('playpen')) return Baby;
  
  // Outdoor & Patio
  if (name.includes('grill') || name.includes('patio') || name.includes('outdoor') || name.includes('umbrella') || name.includes('lawn')) return TreePine;
  
  // Garage & Tools
  if (name.includes('tool') || name.includes('workbench') || name.includes('mower') || name.includes('ladder')) return Hammer;
  
  // Boxes & Packaging
  if (name.includes('box') || name.includes('carton')) return Package;
  
  // Bathroom
  if (name.includes('bath') || name.includes('hamper') || name.includes('medicine')) return Bath;
  
  // Fallback to room-based icon
  const roomConfig = ROOM_CONFIG.find(r => r.id === roomId);
  return roomConfig?.icon || Box;
};

const ITEMS_PER_PAGE_OPTIONS = [8, 12, 16, 24];

export default function InventoryBuilder({ 
  onAddItem, 
  inventoryItems = [], 
  onUpdateQuantity,
  onClearAll,
  specialHandling = false,
  onSpecialHandlingChange,
  isLocked = false,
  onAIEstimate,
  isEstimating = false,
  homeSize,
  hasVehicleTransport = false,
  onVehicleTransportChange,
  needsPackingService = false,
  onPackingServiceChange
}: InventoryBuilderProps) {
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState('Living Room');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const prevTotalRef = useRef(0);

  // Get all items for search with room info
  const allItemsWithRoom = useMemo(() => {
    const result: Array<{ name: string; cubicFeet: number; defaultWeight: number; room: string; imageUrl?: string }> = [];
    for (const [room, items] of Object.entries(ROOM_SUGGESTIONS)) {
      for (const item of items) {
        result.push({ ...item, room });
      }
    }
    return result;
  }, []);

  // Filter items based on search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allItemsWithRoom
      .filter(item => item.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [searchQuery, allItemsWithRoom]);

  // Get room item counts from actual inventory
  const roomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of inventoryItems) {
      counts[item.room] = (counts[item.room] || 0) + item.quantity;
    }
    return counts;
  }, [inventoryItems]);

  const suggestions = ROOM_SUGGESTIONS[activeRoom] || [];
  
  // Pagination
  const totalPages = Math.ceil(suggestions.length / itemsPerPage);
  const paginatedSuggestions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return suggestions.slice(start, start + itemsPerPage);
  }, [suggestions, currentPage, itemsPerPage]);

  // Reset page when room changes
  const handleRoomChange = (roomId: string) => {
    setActiveRoom(roomId);
    setCurrentPage(1);
  };

  const getItemQuantity = (itemName: string, room: string) => {
    const key = `${room}-${itemName}`;
    return itemQuantities[key] || 0;
  };

  const handleQuantityChange = (item: { name: string; defaultWeight: number; cubicFeet?: number; imageUrl?: string }, room: string, delta: number) => {
    const key = `${room}-${item.name}`;
    const currentQty = itemQuantities[key] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    setItemQuantities(prev => ({ ...prev, [key]: newQty }));
    
    // Trigger animation
    if (delta > 0) {
      setRecentlyUpdated(key);
      setTimeout(() => setRecentlyUpdated(null), 300);
    }
    
    if (delta > 0) {
      // Adding item
      onAddItem({
        name: item.name,
        room: room,
        quantity: 1,
        weightEach: item.defaultWeight,
        cubicFeet: item.cubicFeet,
        specialHandling: specialHandling,
        imageUrl: item.imageUrl,
      });
    } else if (delta < 0 && onUpdateQuantity) {
      // Removing item - find matching item in inventoryItems and update/remove
      const matchingItem = inventoryItems.find(
        inv => inv.name === item.name && inv.room === room
      );
      if (matchingItem) {
        if (matchingItem.quantity <= 1) {
          // Remove the item entirely if quantity would go to 0
          onUpdateQuantity(matchingItem.id, 0);
        } else {
          // Decrease quantity by 1
          onUpdateQuantity(matchingItem.id, matchingItem.quantity - 1);
        }
      }
    }
  };

  // Quick add from search/popular items
  const handleQuickAdd = (itemName: string, room: string) => {
    const roomItems = ROOM_SUGGESTIONS[room] || [];
    const item = roomItems.find(i => i.name === itemName);
    if (item) {
      handleQuantityChange(item, room, 1);
    }
    setSearchQuery('');
    setSearchOpen(false);
  };

  // Apply room preset
  const handleApplyPreset = () => {
    if (!selectedPreset) return;
    
    // Clear existing inventory
    setItemQuantities({});
    onClearAll?.();
    
    // Add preset items
    const presetItems = ROOM_PRESETS[selectedPreset] || [];
    for (const presetItem of presetItems) {
      const roomItems = ROOM_SUGGESTIONS[presetItem.room] || [];
      const item = roomItems.find(i => i.name === presetItem.name);
      if (item) {
        const key = `${presetItem.room}-${presetItem.name}`;
        setItemQuantities(prev => ({ ...prev, [key]: presetItem.quantity }));
        onAddItem({
          name: item.name,
          room: presetItem.room,
          quantity: presetItem.quantity,
          weightEach: item.defaultWeight,
          cubicFeet: item.cubicFeet,
          specialHandling: false,
          imageUrl: item.imageUrl,
        });
      }
    }
    
    setPresetDialogOpen(false);
    setSelectedPreset(null);
  };

  const handleAddCustomItem = (customItem: {
    name: string;
    room: string;
    weight: number;
    cubicFeet: number;
    quantity: number;
    fragile: boolean;
  }) => {
    const key = `${customItem.room}-${customItem.name}`;
    setItemQuantities(prev => ({ ...prev, [key]: (prev[key] || 0) + customItem.quantity }));
    setRecentlyUpdated(key);
    setTimeout(() => setRecentlyUpdated(null), 300);
    
    onAddItem({
      name: customItem.name,
      room: customItem.room,
      quantity: customItem.quantity,
      weightEach: customItem.weight,
      cubicFeet: customItem.cubicFeet,
      specialHandling: customItem.fragile,
    });
  };

  const handleClearAll = () => {
    setItemQuantities({});
    onClearAll?.();
  };

  const totalItems = Object.values(itemQuantities).reduce((sum, qty) => sum + qty, 0);
  
  // Calculate total weight for floating summary
  const totalWeight = useMemo(() => {
    let weight = 0;
    for (const [key, qty] of Object.entries(itemQuantities)) {
      if (qty <= 0) continue;
      const [room, ...nameParts] = key.split('-');
      const itemName = nameParts.join('-');
      const roomItems = ROOM_SUGGESTIONS[room] || [];
      const item = roomItems.find(i => i.name === itemName);
      if (item) {
        weight += item.defaultWeight * qty;
      }
    }
    return weight;
  }, [itemQuantities]);

  return (
    <div className="flex gap-4 min-h-[400px]">
      {/* Left Sidebar - Room Navigation */}
      <div className="w-44 flex-shrink-0 space-y-1">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
            My Inventory
          </div>
          {totalItems > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        {ROOM_CONFIG.map((room) => {
          const Icon = room.icon;
          const count = roomCounts[room.id] || 0;
          const isActive = activeRoom === room.id;
          
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => handleRoomChange(room.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all",
                isActive 
                  ? "border-2 border-primary bg-primary/5 text-foreground shadow-md" 
                  : "border-2 border-transparent hover:bg-muted/60 text-foreground/70 hover:text-foreground shadow-sm hover:shadow-md"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-semibold truncate flex-1">{room.label}</span>
              {count > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                  isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Content - Item Grid */}
      <div className="flex-1 space-y-3">
      {/* Scan Room Preview */}
        <div>
          <button
            type="button"
            onClick={() => navigate("/site/scan-room")}
            className="relative flex items-center gap-4 p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all text-left cursor-pointer shadow-sm hover:shadow-lg group overflow-hidden w-full"
          >
            {/* Preview thumbnail */}
            <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-primary/20 flex-shrink-0">
              <img 
                src={scanRoomPreview} 
                alt="AI Room Scanner preview" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary drop-shadow-sm" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground">Scan Your Room</span>
              </div>
              <span className="text-[11px] text-muted-foreground block">Point your camera and auto-detect items instantly</span>
              <span className="text-[10px] text-primary font-semibold mt-1 inline-flex items-center gap-1 group-hover:underline">
                Try it now →
              </span>
            </div>
          </button>
        </div>
        
        {/* Search Bar & Special Handling Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Command-based Search */}
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim()) {
                      setSearchOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery.trim()) {
                      setSearchOpen(true);
                    }
                  }}
                  placeholder="Search all items..."
                  className="w-full h-10 pl-10 pr-10 rounded-lg border border-border/60 bg-card text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandList>
                  {searchResults.length === 0 ? (
                    <CommandEmpty>No items found.</CommandEmpty>
                  ) : (
                    <CommandGroup heading={`${searchResults.length} results`}>
                      {searchResults.map((item) => (
                        <CommandItem
                          key={`${item.room}-${item.name}`}
                          value={item.name}
                          onSelect={() => handleQuickAdd(item.name, item.room)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{item.room}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Special Handling Toggle */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
            specialHandling 
              ? "border-amber-500/50 bg-amber-500/10" 
              : "border-border/60 bg-card"
          )}>
            <ShieldCheck className={cn(
              "w-4 h-4",
              specialHandling ? "text-amber-600" : "text-muted-foreground"
            )} />
            <Label 
              htmlFor="special-handling" 
              className={cn(
                "text-xs font-semibold cursor-pointer whitespace-nowrap",
                specialHandling ? "text-amber-700" : "text-muted-foreground"
              )}
            >
              Fragile Items
            </Label>
            <Switch
              id="special-handling"
              checked={specialHandling}
              onCheckedChange={onSpecialHandlingChange}
              className="ml-1 scale-90"
            />
          </div>
        </div>

        {/* Additional Services Row */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-[10px] font-black tracking-[0.15em] uppercase text-muted-foreground">
            Add-ons:
          </span>
          
          {/* Vehicle Transport Toggle */}
          <button
            type="button"
            onClick={() => onVehicleTransportChange?.(!hasVehicleTransport)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold",
              hasVehicleTransport 
                ? "border-primary/50 bg-primary/10 text-primary" 
                : "border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicle Transport</span>
          </button>
          
          {/* Packing Service Toggle */}
          <button
            type="button"
            onClick={() => onPackingServiceChange?.(!needsPackingService)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold",
              needsPackingService 
                ? "border-primary/50 bg-primary/10 text-primary" 
                : "border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Packing Service</span>
          </button>
        </div>

        {/* Room Section Header with View Controls */}
        {!searchQuery && (
          <>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 flex-1">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                  {activeRoom}
                </span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              
              {/* View Toggle & Items Per Page */}
              <div className="flex items-center gap-2 ml-3">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === 'grid' 
                        ? "border border-primary bg-card text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === 'list' 
                        ? "border border-primary bg-card text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Items Per Page Selector */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-7 px-2 text-[10px] font-semibold rounded-md border border-border/60 bg-muted/30 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map(num => (
                    <option key={num} value={num}>{num} items</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Item Grid/List - Only show active room items */}
            {suggestions.length > 0 ? (
              <>
            {viewMode === 'grid' ? (
                  <div className="grid grid-cols-4 gap-2">
                    {paginatedSuggestions.map((item) => {
                      const key = `${activeRoom}-${item.name}`;
                      return (
                        <ItemCard
                          key={item.name}
                          item={item}
                          room={activeRoom}
                          quantity={getItemQuantity(item.name, activeRoom)}
                          onAdd={() => handleQuantityChange(item, activeRoom, 1)}
                          onRemove={() => handleQuantityChange(item, activeRoom, -1)}
                          icon={getItemIcon(item.name, activeRoom)}
                          isAnimating={recentlyUpdated === key}
                        />
                      );
                    })}
                    
                    {/* Add Custom Item Card - only on last page or if less than itemsPerPage */}
                    {currentPage === totalPages && (
                      <button
                        type="button"
                        onClick={() => setCustomModalOpen(true)}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all min-h-[100px] text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[10px] font-semibold text-center">Add Custom</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paginatedSuggestions.map((item) => {
                      const key = `${activeRoom}-${item.name}`;
                      return (
                        <ItemListRow
                          key={item.name}
                          item={item}
                          room={activeRoom}
                          quantity={getItemQuantity(item.name, activeRoom)}
                          onAdd={() => handleQuantityChange(item, activeRoom, 1)}
                          onRemove={() => handleQuantityChange(item, activeRoom, -1)}
                          icon={getItemIcon(item.name, activeRoom)}
                          isAnimating={recentlyUpdated === key}
                        />
                      );
                    })}
                    
                    {/* Add Custom Item Row - only on last page */}
                    {currentPage === totalPages && (
                      <button
                        type="button"
                        onClick={() => setCustomModalOpen(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-sm font-semibold">Add Custom Item</span>
                      </button>
                    )}
                  </div>
                )}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        currentPage === 1 
                          ? "text-muted-foreground/40 cursor-not-allowed" 
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-7 h-7 rounded-lg text-xs font-semibold transition-all",
                            page === currentPage 
                              ? "border border-border bg-muted text-foreground" 
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        currentPage === totalPages 
                          ? "text-muted-foreground/40 cursor-not-allowed" 
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Room Presets - Inline */}
                <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-border/40">
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-muted-foreground">
                    Presets
                  </span>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'studio', label: 'Studio' },
                      { id: '1br', label: '1 BR' },
                      { id: '2br', label: '2 BR' },
                      { id: '3br', label: '3+ BR' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(preset.id);
                          setPresetDialogOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border border-border/40 hover:bg-muted/80 hover:text-foreground transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">No items in this room</p>
                <p className="text-xs mt-1">Try searching or select another room</p>
              </div>
            )}
          </>
        )}
      </div>


      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        onAdd={handleAddCustomItem}
        defaultRoom={activeRoom}
      />

      {/* Preset Confirmation Dialog */}
      <AlertDialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load Preset Inventory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current inventory with a typical {selectedPreset === 'studio' ? 'studio apartment' : selectedPreset === '1br' ? '1 bedroom' : selectedPreset === '2br' ? '2 bedroom' : '3+ bedroom'} setup. You can customize it after loading.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyPreset}>
              Load Preset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Item Card Component
interface ItemCardProps {
  item: ItemDefinition;
  room: string;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  showRoom?: boolean;
  icon: LucideIcon;
  isAnimating?: boolean;
}

function ItemCard({ item, room, quantity, onAdd, onRemove, showRoom, icon: Icon, isAnimating }: ItemCardProps) {
  return (
    <div className={cn(
      "group flex flex-col p-2 rounded-xl border transition-all shadow-sm hover:shadow-md",
      quantity > 0 
        ? "border-primary/40 bg-primary/5 shadow-md" 
        : "border-border/60 bg-card hover:border-primary/20 hover:shadow-lg",
      isAnimating && "tru-item-just-added"
    )}>
      {/* Item Image or Icon - white background for furniture images */}
      <div className={cn(
        "w-full h-20 rounded-lg flex items-center justify-center mb-1.5 overflow-hidden",
        "bg-white"
      )}>
        <div className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105">
          <InventoryItemImage
            src={item.imageUrl}
            alt={item.name}
            fallbackIcon={Icon}
            className="w-full h-full"
            iconClassName={cn(
              "!w-8 !h-8",
              quantity > 0 ? "text-primary" : "text-muted-foreground/60"
            )}
          />
        </div>
      </div>
      
      {/* Item Name */}
      <div className="flex-1 min-h-[36px]">
        <p className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
          {item.name}
        </p>
        {showRoom && (
          <p className="text-[9px] text-muted-foreground mt-0.5">{room}</p>
        )}
        <p className="text-[9px] text-muted-foreground mt-0.5">
          ~{item.cubicFeet || Math.ceil(item.defaultWeight / 7)} cu.ft
        </p>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/40">
        <button
          type="button"
          onClick={onRemove}
          disabled={quantity === 0}
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-all",
            quantity > 0 
              ? "bg-muted hover:bg-muted-foreground/20 text-foreground" 
              : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
          )}
        >
          <Minus className="w-3 h-3" />
        </button>
        
        <span className={cn(
          "text-sm font-bold tabular-nums",
          quantity > 0 ? "text-foreground" : "text-muted-foreground"
        )}>
          {quantity}
        </span>
        
        <button
          type="button"
          onClick={onAdd}
          className="w-6 h-6 rounded-full border-2 border-primary bg-card text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// List Row Component for List View
interface ItemListRowProps {
  item: ItemDefinition;
  room: string;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  icon: LucideIcon;
  isAnimating?: boolean;
}

function ItemListRow({ item, quantity, onAdd, onRemove, icon: Icon, isAnimating }: ItemListRowProps) {
  return (
    <div className={cn(
      "group flex items-center gap-3 p-3 rounded-xl border transition-all shadow-sm hover:shadow-md",
      quantity > 0 
        ? "border-primary/40 bg-primary/5 shadow-md" 
        : "border-border/60 bg-card hover:border-primary/20 hover:shadow-lg",
      isAnimating && "tru-item-just-added"
    )}>
      {/* Item Image or Icon - white background for furniture images */}
      <div className={cn(
        "w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
        "bg-white"
      )}>
        <div className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105">
          <InventoryItemImage
            src={item.imageUrl}
            alt={item.name}
            fallbackIcon={Icon}
            className="w-full h-full"
            iconClassName={cn(
              "!w-8 !h-8",
              quantity > 0 ? "text-primary" : "text-muted-foreground/60"
            )}
          />
        </div>
      </div>
      
      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {item.name}
        </p>
        <p className="text-[10px] text-muted-foreground">
          ~{item.cubicFeet || Math.ceil(item.defaultWeight / 7)} cu.ft • {item.defaultWeight} lbs
        </p>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRemove}
          disabled={quantity === 0}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center transition-all",
            quantity > 0 
              ? "bg-muted hover:bg-muted-foreground/20 text-foreground" 
              : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
          )}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        
        <span className={cn(
          "w-6 text-center text-sm font-bold tabular-nums",
          quantity > 0 ? "text-primary" : "text-muted-foreground"
        )}>
          {quantity}
        </span>
        
        <button
          type="button"
          onClick={onAdd}
          className="w-7 h-7 rounded-full border-2 border-primary/40 bg-card text-primary flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
