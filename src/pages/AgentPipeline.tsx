import { useState } from "react";
import SiteShell from "@/components/layout/SiteShell";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { AddLeadDealForm } from "@/components/pipeline/AddLeadDealForm";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AgentPipeline() {
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <SiteShell hideTrustStrip>
      <div className="px-4 py-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/agent-login">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
              <p className="text-sm text-muted-foreground">Drag deals between stages</p>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Lead
          </Button>
        </div>

        <PipelineBoard key={refreshKey} />

        <AddLeadDealForm open={addOpen} onOpenChange={setAddOpen} onAdded={() => setRefreshKey((k) => k + 1)} />
      </div>
    </SiteShell>
  );
}
