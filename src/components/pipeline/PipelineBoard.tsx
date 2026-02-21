import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { Deal, PipelineStage } from "./types";
import { DealCard } from "./DealCard";
import { DealDetailPanel } from "./DealDetailPanel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function StageColumn({ stage, deals, onDealClick }: { stage: PipelineStage; deals: Deal[]; onDealClick: (d: Deal) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.stage_key });
  
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[260px] max-w-[280px] rounded-xl border bg-muted/30 transition-colors ${isOver ? "ring-2 ring-primary/40" : ""}`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color }} />
          <span className="text-xs font-semibold text-foreground">{stage.name}</span>
        </div>
        <Badge variant="secondary" className="text-[10px] h-5">{deals.length}</Badge>
      </div>
      <ScrollArea className="flex-1 p-2 max-h-[calc(100vh-220px)]">
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
            ))}
          </div>
        </SortableContext>
        {deals.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Drop deals here</p>
        )}
      </ScrollArea>
    </div>
  );
}

export function PipelineBoard() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchData = useCallback(async () => {
    const [stagesRes, dealsRes] = await Promise.all([
      supabase.from("pipeline_stages" as any).select("*").order("display_order"),
      supabase.from("deals" as any).select("*, leads(*)").order("updated_at", { ascending: false }),
    ]);
    setStages((stagesRes.data as any as PipelineStage[]) || []);
    setDeals((dealsRes.data as any as Deal[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime subscription with toast notifications
  useEffect(() => {
    let currentUserId: string | null = null;
    supabase.auth.getUser().then(({ data }) => { currentUserId = data.user?.id ?? null; });

    const channel = supabase
      .channel("pipeline-deals")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "deals" }, async (payload) => {
        const newRow = payload.new as any;
        const oldRow = payload.old as any;

        // Only notify if stage changed and it wasn't the current user
        if (oldRow.stage !== newRow.stage && newRow.assigned_agent_id !== currentUserId) {
          // Fetch lead name for a meaningful notification
          const { data: lead } = await supabase.from("leads").select("first_name, last_name").eq("id", newRow.lead_id).single();
          const name = lead ? `${lead.first_name} ${lead.last_name}` : "A deal";
          const stageName = (newRow.stage as string).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

          toast({
            title: "🔔 Deal Stage Updated",
            description: `${name} was moved to "${stageName}" by another agent.`,
          });
        }
        fetchData();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "deals" }, () => fetchData())
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "deals" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleDragStart = (e: DragStartEvent) => {
    const deal = deals.find((d) => d.id === e.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = e;
    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as string;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    // Optimistic update
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)));

    const { error } = await supabase.from("deals" as any).update({ stage: newStage } as any).eq("id", dealId);
    if (error) {
      toast({ title: "Error moving deal", description: error.message, variant: "destructive" });
      fetchData();
    }
  };

  const handleStageChange = async (dealId: string, newStage: string) => {
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)));
    if (selectedDeal?.id === dealId) setSelectedDeal((p) => p ? { ...p, stage: newStage } : p);

    const { error } = await supabase.from("deals" as any).update({ stage: newStage } as any).eq("id", dealId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 px-1">
          {stages
            .filter((s) => !["closed_won", "closed_lost"].includes(s.stage_key))
            .map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                deals={deals.filter((d) => d.stage === stage.stage_key)}
                onDealClick={(d) => { setSelectedDeal(d); setDetailOpen(true); }}
              />
            ))}
        </div>
        <DragOverlay>
          {activeDeal ? (
            <Card className="p-3 shadow-lg border-l-4 border-l-primary w-[260px]">
              <p className="text-sm font-semibold">
                {activeDeal.leads ? `${activeDeal.leads.first_name} ${activeDeal.leads.last_name}` : "Deal"}
              </p>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DealDetailPanel
        deal={selectedDeal}
        stages={stages}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStageChange={handleStageChange}
      />
    </>
  );
}
