import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, MapPin } from "lucide-react";
import { Deal } from "./types";
import { differenceInDays, parseISO, format } from "date-fns";

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
}

function getUrgencyColor(daysInStage: number) {
  if (daysInStage >= 5) return "border-l-red-500";
  if (daysInStage >= 2) return "border-l-yellow-500";
  return "border-l-emerald-500";
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { type: "deal", deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const daysInStage = differenceInDays(new Date(), parseISO(deal.updated_at));
  const lead = deal.leads;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 cursor-grab active:cursor-grabbing border-l-4 ${getUrgencyColor(daysInStage)} hover:shadow-md transition-shadow`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(deal);
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-foreground truncate">
          {lead ? `${lead.first_name} ${lead.last_name}` : "No lead"}
        </h4>
        <Badge variant="outline" className="text-[10px] shrink-0">
          {daysInStage}d
        </Badge>
      </div>

      {deal.deal_value ? (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <DollarSign className="h-3 w-3" />
          <span>${deal.deal_value.toLocaleString()}</span>
        </div>
      ) : null}

      {lead?.move_date && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <Calendar className="h-3 w-3" />
          <span>{format(parseISO(lead.move_date), "MMM d, yyyy")}</span>
        </div>
      )}

      {lead?.origin_address && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{lead.origin_address}</span>
        </div>
      )}
    </Card>
  );
}
