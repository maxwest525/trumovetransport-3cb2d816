import { useState } from "react";
import AgentShell from "@/components/layout/AgentShell";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { PipelineReports } from "@/components/pipeline/PipelineReports";
import { AddLeadDealForm } from "@/components/pipeline/AddLeadDealForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, Kanban } from "lucide-react";

export default function AgentPipeline() {
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <AgentShell breadcrumb=" / Pipeline">
      <div className="px-4 py-4 max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-48px)] overflow-hidden">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h1 className="text-xl font-bold text-foreground">Pipeline</h1>
          <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Lead
          </Button>
        </div>

        <Tabs defaultValue="board" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="board" className="gap-2"><Kanban className="h-4 w-4" />Board</TabsTrigger>
            <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4" />Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="board" className="flex-1 overflow-hidden mt-3">
            <PipelineBoard key={refreshKey} onAddLead={() => setAddOpen(true)} />
          </TabsContent>
          <TabsContent value="reports" className="flex-1 overflow-y-auto mt-3">
            <PipelineReports />
          </TabsContent>
        </Tabs>

        <AddLeadDealForm open={addOpen} onOpenChange={setAddOpen} onAdded={() => setRefreshKey((k) => k + 1)} />
      </div>
    </AgentShell>
  );
}
