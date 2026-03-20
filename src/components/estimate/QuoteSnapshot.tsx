import { Pencil, MapPin, Calendar, Ruler, Car, Package, Box, Scale } from "lucide-react";
import { calculateTotalWeight, calculateTotalCubicFeet, type InventoryItem, type MoveDetails } from "@/lib/priceCalculator";
import { format } from "date-fns";
import type { ExtendedMoveDetails } from "./EstimateWizard";

interface QuoteSnapshotProps {
  items: InventoryItem[];
  moveDetails: MoveDetails;
  extendedDetails?: ExtendedMoveDetails | null;
  onEdit?: () => void;
}

export default function QuoteSnapshot({ items, moveDetails, extendedDetails, onEdit }: QuoteSnapshotProps) {
  const totalWeight = calculateTotalWeight(items);
  const totalCubicFeet = calculateTotalCubicFeet(items);

  // Group items by room for summary
  const itemsByRoom = items.reduce((acc, item) => {
    const room = item.room || 'Other';
    acc[room] = (acc[room] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  // Format property type for display - plain text
  const formatPropertyType = (type: string, floor?: number, hasElevator?: boolean) => {
    if (!type) return '';
    if (type === 'apartment' && floor) {
      return `Apartment • Floor ${floor} ${hasElevator ? '(Elevator)' : '(Stairs)'}`;
    }
    return type === 'house' ? 'House' : type;
  };

  // Format home size for display - plain text
  const formatHomeSize = (size: string) => {
    const sizeMap: Record<string, string> = {
      'studio': 'Studio',
      '1br': '1 BR',
      '2br': '2 BR',
      '3br': '3 BR',
      '4br+': '4+ BR',
      'other': 'Other',
    };
    return sizeMap[size] || size || '';
  };

  // Build origin detail line
  const originPropertyLine = [
    formatPropertyType(extendedDetails?.fromPropertyType || '', extendedDetails?.fromFloor, extendedDetails?.fromHasElevator),
    formatHomeSize(extendedDetails?.homeSize || moveDetails.homeSize || '')
  ].filter(Boolean).join(' • ');

  // Build destination detail line
  const destPropertyLine = [
    formatPropertyType(extendedDetails?.toPropertyType || '', extendedDetails?.toFloor, extendedDetails?.toHasElevator),
    formatHomeSize(extendedDetails?.toHomeSize || '')
  ].filter(Boolean).join(' • ');

  return (
    <div className="tru-move-summary-card is-expanded w-full">
      {/* Header - Enlarged and Centered */}
      <div className="tru-summary-header-large">
        <div className="text-center flex-1">
          <h3 className="text-lg font-black uppercase tracking-wide">
            YOUR MOVE <span className="text-primary">SUMMARY</span>
          </h3>
          <p className="text-[10px] uppercase tracking-wide">Items by room</p>
        </div>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="absolute right-3 p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Edit move details"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      
      {/* Content - Left aligned */}
      <div className="p-4 space-y-3">
        {/* Room breakdown */}
        {Object.keys(itemsByRoom).length > 0 ? (
          <div className="space-y-1.5">
            {Object.entries(itemsByRoom).map(([room, count]) => (
              <div key={room} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{room}</span>
                <span className="text-muted-foreground tabular-nums">{count} items</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No items added yet</p>
        )}

        {/* Totals row */}
        {items.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-sm font-medium">
            <span className="text-foreground">Total</span>
            <span className="text-foreground tabular-nums">{items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          </div>
        )}

        {/* Stats row */}
        {items.length > 0 && (
          <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md border border-border/40 text-xs">
            <div className="flex items-center gap-1">
              <Box className="w-3 h-3 text-muted-foreground" />
              <span className="font-semibold text-foreground">{totalCubicFeet.toLocaleString()}</span>
              <span className="text-muted-foreground">cu ft</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-muted-foreground" />
              <span className="font-semibold text-foreground">{totalWeight > 0 ? `${totalWeight.toLocaleString()}` : '0'}</span>
              <span className="text-muted-foreground">lbs</span>
            </div>
          </div>
        )}

        {/* Estimate */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">Estimated</span>
          <span className="text-xl font-bold text-primary">TBD</span>
        </div>
      </div>
    </div>
  );
}
