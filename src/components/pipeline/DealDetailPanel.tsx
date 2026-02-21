import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Deal, Activity, PipelineStage } from "./types";
import { ActivityTimeline } from "./ActivityTimeline";
import { AddActivityForm } from "./AddActivityForm";
import { DealAIAssistant } from "./DealAIAssistant";
import { DealEmailComposer } from "./DealEmailComposer";
import { Phone, Mail, MapPin, Calendar, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";

interface DealDetailPanelProps {
  deal: Deal | null;
  stages: PipelineStage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageChange: (dealId: string, newStage: string) => void;
}

export function DealDetailPanel({ deal, stages, open, onOpenChange, onStageChange }: DealDetailPanelProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchActivities = async () => {
    if (!deal) return;
    const { data } = await supabase
      .from("activities" as any)
      .select("*")
      .eq("deal_id", deal.id)
      .order("created_at", { ascending: false });
    setActivities((data as any as Activity[]) || []);
  };

  useEffect(() => {
    if (deal && open) fetchActivities();
  }, [deal?.id, open]);

  if (!deal) return null;
  const lead = deal.leads;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">
            {lead ? `${lead.first_name} ${lead.last_name}` : "Deal Details"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Stage selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Stage</label>
            <Select value={deal.stage} onValueChange={(v) => onStageChange(deal.id, v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.stage_key} value={s.stage_key}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deal value */}
          {deal.deal_value ? (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">${deal.deal_value.toLocaleString()}</span>
            </div>
          ) : null}

          {/* Contact info */}
          {lead && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</h5>
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{lead.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Move details */}
          {lead && (lead.origin_address || lead.move_date) && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Move Details</h5>
              {lead.move_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(parseISO(lead.move_date), "MMMM d, yyyy")}</span>
                </div>
              )}
              {lead.origin_address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{lead.origin_address} → {lead.destination_address || "TBD"}</span>
                </div>
              )}
              {lead.estimated_value && (
                <Badge variant="secondary" className="text-xs">Est. ${lead.estimated_value.toLocaleString()}</Badge>
              )}
            </div>
          )}

          <Separator />

          {/* AI Assistant */}
          <DealAIAssistant deal={deal} activities={activities} />

          <Separator />

          {/* Email Composer */}
          <DealEmailComposer deal={deal} activities={activities} />

          <Separator />

          {/* Add Activity */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Add Activity</h5>
            <AddActivityForm dealId={deal.id} leadId={deal.lead_id} onAdded={fetchActivities} />
          </div>

          <Separator />

          {/* Activity Timeline */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Activity History</h5>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
