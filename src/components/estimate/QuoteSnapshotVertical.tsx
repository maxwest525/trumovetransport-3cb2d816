import { MapPin, Calendar, Ruler, Car, Package, Scale, Home, Truck, Building2, Bed, Route } from "lucide-react";
import { type InventoryItem, type MoveDetails, calculateTotalWeight, calculateTotalCubicFeet } from "@/lib/priceCalculator";
import { format } from "date-fns";
import type { ExtendedMoveDetails } from "./EstimateWizard";
import { formatDistance, formatDuration } from "@/hooks/useRouteOptimization";

interface QuoteSnapshotVerticalProps {
  items: InventoryItem[];
  moveDetails: MoveDetails;
  extendedDetails?: ExtendedMoveDetails | null;
  onEdit?: () => void;
}

export default function QuoteSnapshotVertical({ items, moveDetails, extendedDetails, onEdit }: QuoteSnapshotVerticalProps) {
  const totalWeight = calculateTotalWeight(items);
  const totalCubicFeet = calculateTotalCubicFeet(items);

  // Format property type for display - plain text
  const formatPropertyType = (type: string, floor?: number, hasElevator?: boolean) => {
    if (!type) return '';
    if (type === 'apartment' && floor) {
      return `Apartment • Floor ${floor} ${hasElevator ? '(Elevator)' : '(Stairs)'}`;
    }
    return type === 'house' ? 'House' : type === 'apartment' ? 'Apartment' : type;
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

  // Determine move type label
  const getMoveTypeLabel = (type: string, distance: number) => {
    if (type === 'auto') {
      return distance > 0 ? 'Auto Based On Miles' : 'Auto Based On Miles';
    }
    return type === 'long-distance' ? 'Long Distance' : 'Local';
  };

  return (
    <div className="tru-move-summary-card is-expanded w-full max-w-[300px]">
      {/* Header - Enlarged and Centered */}
      <div className="tru-summary-header-large">
        <div className="text-center flex-1">
          <h3 className="text-xl font-black uppercase tracking-wide">
            GET INSTANT <span className="text-primary">QUOTE</span>
          </h3>
        </div>
      </div>
      
      {/* Content - Left aligned rows */}
      <div className="p-4 space-y-2.5 text-left">
        {/* From Address */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">From</span>
          <span className="text-sm font-medium text-foreground text-right truncate max-w-[160px]">
            {moveDetails.fromLocation || 'Not set'}
          </span>
        </div>

        {/* Origin Property Details */}
        {(extendedDetails?.fromPropertyType || extendedDetails?.homeSize) && (
          <div className="flex items-center justify-between py-1.5 border-b border-border/30">
            <span className="text-sm text-muted-foreground">Origin home</span>
            <span className="text-sm font-medium text-foreground text-right truncate max-w-[160px]">
              {[
                formatPropertyType(extendedDetails?.fromPropertyType || '', extendedDetails?.fromFloor, extendedDetails?.fromHasElevator),
                formatHomeSize(extendedDetails?.homeSize || moveDetails.homeSize || '')
              ].filter(Boolean).join(' • ') || '-'}
            </span>
          </div>
        )}

        {/* To Address */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">To</span>
          <span className="text-sm font-medium text-foreground text-right truncate max-w-[160px]">
            {moveDetails.toLocation || 'Not set'}
          </span>
        </div>

        {/* Destination Property Details */}
        {(extendedDetails?.toPropertyType || extendedDetails?.toHomeSize) && (
          <div className="flex items-center justify-between py-1.5 border-b border-border/30">
            <span className="text-sm text-muted-foreground">Destination home</span>
            <span className="text-sm font-medium text-foreground text-right truncate max-w-[160px]">
              {[
                formatPropertyType(extendedDetails?.toPropertyType || '', extendedDetails?.toFloor, extendedDetails?.toHasElevator),
                formatHomeSize(extendedDetails?.toHomeSize || '')
              ].filter(Boolean).join(' • ') || '-'}
            </span>
          </div>
        )}

        {/* Multi-Stop Summary */}
        {extendedDetails?.isMultiStop && (
          <>
            {/* Pickup Locations */}
            <div className="py-1.5 border-b border-border/30">
              <div className="flex items-center gap-1.5 mb-1">
                <Route className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary uppercase">Multi-Stop Move</span>
              </div>
              <div className="space-y-0.5">
                {extendedDetails.pickupLocations.filter(l => l.validated).map((loc, idx) => (
                  <div key={loc.id} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Pickup {idx + 1}</span>
                    <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                      {loc.address.split(',')[0]}
                    </span>
                  </div>
                ))}
                {extendedDetails.dropoffLocations.filter(l => l.validated).map((loc, idx) => (
                  <div key={loc.id} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Drop-off {idx + 1}</span>
                    <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                      {loc.address.split(',')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Optimization Savings */}
            {extendedDetails.optimizedRoute && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Optimized route</span>
                <span className="text-xs font-medium text-primary">
                  {formatDistance(extendedDetails.optimizedRoute.totalDistance)} • {formatDuration(extendedDetails.optimizedRoute.totalDuration)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Distance */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Distance</span>
          <span className="text-sm font-medium text-foreground">
            {extendedDetails?.optimizedRoute 
              ? formatDistance(extendedDetails.optimizedRoute.totalDistance)
              : moveDetails.distance > 0 ? `${moveDetails.distance.toLocaleString()} miles` : 'Add miles'}
          </span>
        </div>

        {/* Move Type */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Move type</span>
          <span className="text-sm font-medium text-foreground">
            {getMoveTypeLabel(moveDetails.moveType, moveDetails.distance)}
          </span>
        </div>

        {/* Move Date */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Move date</span>
          <span className="text-sm font-medium text-foreground">
            {extendedDetails?.moveDate ? format(extendedDetails.moveDate, 'MMM d, yyyy') : 'Select date'}
          </span>
        </div>

        {/* Total Weight */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Total weight</span>
          <span className="text-sm font-medium text-foreground">
            {totalWeight > 0 ? `${totalWeight.toLocaleString()} lbs` : '0 lbs'}
          </span>
        </div>

        {/* Total Cubic Feet */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Total volume</span>
          <span className="text-sm font-medium text-foreground">
            {totalCubicFeet > 0 ? `${totalCubicFeet.toLocaleString()} cu ft` : '0 cu ft'}
          </span>
        </div>

        {/* Vehicle Transport */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Vehicle transport</span>
          <span className="text-sm font-medium text-foreground">
            {extendedDetails?.hasVehicleTransport ? 'Yes' : 'No'}
          </span>
        </div>

        {/* Packing Service */}
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm text-muted-foreground">Packing service</span>
          <span className="text-sm font-medium text-foreground">
            {extendedDetails?.needsPackingService ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-muted-foreground italic">
          Rough estimate based on your inventory, move type, and distance.
        </p>
      </div>
    </div>
  );
}
