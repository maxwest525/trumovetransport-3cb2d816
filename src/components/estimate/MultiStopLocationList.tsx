import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Check, MapPin } from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { MAPTILER_KEY } from '@/lib/maptilerConfig';
import { cn } from "@/lib/utils";

export interface StopLocation {
  id: string;
  address: string;
  coords: [number, number] | null;
  validated: boolean;
  order: number;
}

interface SortableItemProps {
  location: StopLocation;
  index: number;
  onRemove: (id: string) => void;
  onAddressChange: (id: string, address: string) => void;
  onLocationSelect: (id: string, displayAddr: string, zip: string, fullAddress: string, coords: [number, number]) => void;
  canRemove: boolean;
}

function SortableItem({ location, index, onRemove, onAddressChange, onLocationSelect, canRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: location.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border transition-all",
        isDragging 
          ? "border-primary/50 bg-primary/5 shadow-lg z-50" 
          : "border-border/50 bg-background hover:border-border"
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Order Number */}
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
        {index + 1}
      </div>

      {/* Address Input */}
      <div className="flex-1 min-w-0">
        <LocationAutocomplete
          value={location.address}
          onValueChange={(val) => onAddressChange(location.id, val)}
          onLocationSelect={async (displayAddr, zip, fullAddress) => {
            // Geocode to get coordinates using MapTiler
            const addr = fullAddress || displayAddr;
            try {
              const response = await fetch(
                `https://api.maptiler.com/geocoding/${encodeURIComponent(addr)}.json?` +
                `key=${MAPTILER_KEY}&country=us&limit=1`
              );
              const data = await response.json();
              if (data.features?.[0]?.center) {
                const [lng, lat] = data.features[0].center;
                onLocationSelect(location.id, displayAddr, zip, addr, [lat, lng]);
              } else {
                // Fallback: mark as validated without coords
                onLocationSelect(location.id, displayAddr, zip, addr, [0, 0]);
              }
            } catch {
              onLocationSelect(location.id, displayAddr, zip, addr, [0, 0]);
            }
          }}
          placeholder="Enter address..."
          className="tru-qb-input text-sm"
          mode="address"
        />
      </div>

      {/* Validation Status */}
      <div className="shrink-0">
        {location.validated ? (
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-primary" />
          </div>
        ) : location.address ? (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        ) : null}
      </div>

      {/* Remove Button */}
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(location.id)}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface MultiStopLocationListProps {
  locations: StopLocation[];
  onLocationsChange: (locations: StopLocation[]) => void;
  type: 'pickup' | 'dropoff';
  maxLocations?: number;
  minLocations?: number;
}

export default function MultiStopLocationList({
  locations,
  onLocationsChange,
  type,
  maxLocations = 5,
  minLocations = 1,
}: MultiStopLocationListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = locations.findIndex((l) => l.id === active.id);
      const newIndex = locations.findIndex((l) => l.id === over.id);
      
      const reordered = arrayMove(locations, oldIndex, newIndex).map((loc, idx) => ({
        ...loc,
        order: idx,
      }));
      
      onLocationsChange(reordered);
    }
  }, [locations, onLocationsChange]);

  const addLocation = useCallback(() => {
    if (locations.length >= maxLocations) return;
    
    const newLocation: StopLocation = {
      id: crypto.randomUUID(),
      address: '',
      coords: null,
      validated: false,
      order: locations.length,
    };
    
    onLocationsChange([...locations, newLocation]);
  }, [locations, maxLocations, onLocationsChange]);

  const removeLocation = useCallback((id: string) => {
    if (locations.length <= minLocations) return;
    
    const filtered = locations
      .filter((l) => l.id !== id)
      .map((loc, idx) => ({ ...loc, order: idx }));
    
    onLocationsChange(filtered);
  }, [locations, minLocations, onLocationsChange]);

  const updateAddress = useCallback((id: string, address: string) => {
    const updated = locations.map((loc) =>
      loc.id === id ? { ...loc, address, validated: false, coords: null } : loc
    );
    onLocationsChange(updated);
  }, [locations, onLocationsChange]);

  const handleLocationSelect = useCallback((
    id: string,
    displayAddr: string,
    zip: string,
    fullAddress: string,
    coords: [number, number]
  ) => {
    const updated = locations.map((loc) =>
      loc.id === id
        ? { ...loc, address: fullAddress, coords, validated: true }
        : loc
    );
    onLocationsChange(updated);
  }, [locations, onLocationsChange]);

  const canAdd = locations.length < maxLocations;
  const canRemove = locations.length > minLocations;

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={locations.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {locations.map((location, index) => (
            <SortableItem
              key={location.id}
              location={location}
              index={index}
              onRemove={removeLocation}
              onAddressChange={updateAddress}
              onLocationSelect={handleLocationSelect}
              canRemove={canRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      {canAdd && (
        <button
          type="button"
          onClick={addLocation}
          className="w-full py-2 text-sm text-muted-foreground hover:text-primary border border-dashed border-border/50 hover:border-primary/50 rounded-lg transition-colors"
        >
          + Add {type === 'pickup' ? 'Pickup' : 'Drop-off'} Location
        </button>
      )}
    </div>
  );
}
