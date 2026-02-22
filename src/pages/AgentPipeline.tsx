import { useState } from "react";
import SiteShell from "@/components/layout/SiteShell";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { PipelineReports } from "@/components/pipeline/PipelineReports";
import { AddLeadDealForm } from "@/components/pipeline/AddLeadDealForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, Kanban } from "lucide-react";
import AgentTopBar from "@/components/agent/AgentTopBar";

export default function AgentPipeline() {
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <SiteShell hideTrustStrip backendMode>
      <AgentTopBar crumbs={[{ label: "Agent Tools", href: "/agent-login" }, { label: "Pipeline" }]} />
      <div className="px-4 py-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Pipeline</h1>
          <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Lead
          </Button>
        </div>

        <Tabs defaultValue="board" className="space-y-4">
          <TabsList>
            <TabsTrigger value="board" className="gap-2"><Kanban className="h-4 w-4" />Board</TabsTrigger>
            <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4" />Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="board">
            <PipelineBoard key={refreshKey} onAddLead={() => setAddOpen(true)} />
          </TabsContent>
          <TabsContent value="reports">
            <PipelineReports />
          </TabsContent>
        </Tabs>

        <AddLeadDealForm open={addOpen} onOpenChange={setAddOpen} onAdded={() => setRefreshKey((k) => k + 1)} />
      </div>
    </SiteShell>
  );
}
