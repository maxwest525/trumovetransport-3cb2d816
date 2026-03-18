import { useState } from "react";
import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Plus, MoreHorizontal, Pause, Play, Search,
  ChevronDown, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  platform: "Google" | "Meta";
  status: "active" | "paused" | "draft";
  budget: string;
  spend: string;
  leads: number;
  booked: number;
  cpl: string;
  cpb: string;
  destination: string;
}

const CAMPAIGNS: Campaign[] = [
  { id: "1", name: "Interstate CA", platform: "Google", status: "active", budget: "$150/day", spend: "$2,840", leads: 98, booked: 19, cpl: "$29", cpb: "$149", destination: "Long-Distance LP" },
  { id: "2", name: "FL Interstate", platform: "Meta", status: "active", budget: "$80/day", spend: "$1,420", leads: 82, booked: 9, cpl: "$17", cpb: "$158", destination: "Social Traffic LP" },
  { id: "3", name: "Interstate TX", platform: "Google", status: "active", budget: "$100/day", spend: "$1,980", leads: 74, booked: 14, cpl: "$27", cpb: "$141", destination: "Long-Distance LP" },
  { id: "4", name: "Retargeting National", platform: "Meta", status: "active", budget: "$35/day", spend: "$680", leads: 34, booked: 3, cpl: "$20", cpb: "$227", destination: "Free Quote LP" },
  { id: "5", name: "Interstate NY", platform: "Google", status: "paused", budget: "$100/day", spend: "$2,100", leads: 62, booked: 8, cpl: "$34", cpb: "$263", destination: "Long-Distance LP" },
  { id: "6", name: "Brand Search", platform: "Google", status: "draft", budget: "$25/day", spend: "$0", leads: 0, booked: 0, cpl: "—", cpb: "—", destination: "Homepage" },
];

export default function GrowthCampaigns() {
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "draft">("all");
  const filtered = filter === "all" ? CAMPAIGNS : CAMPAIGNS.filter(c => c.status === filter);

  return (
    <GrowthEngineShell>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Campaigns</h1>
          <button
            onClick={() => toast.info("Campaign create drawer coming soon")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3 h-3" /> New Campaign
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5">
          {(["all", "active", "paused", "draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 rounded text-[10px] font-medium transition-colors capitalize",
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f} {f === "all" ? `(${CAMPAIGNS.length})` : `(${CAMPAIGNS.filter(c => c.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Campaign", "Platform", "Status", "Budget", "Spend", "Leads", "Booked", "CPL", "$/Book", "Destination", ""].map((h, i) => (
                  <th key={i} className={cn("py-1.5 px-2 text-[10px] text-muted-foreground font-semibold", i < 1 ? "text-left" : i < 5 ? "text-left" : "text-right")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className={cn("border-b border-border/30 hover:bg-muted/10", c.status === "paused" && "opacity-60")}>
                  <td className="py-2 px-2 font-medium text-foreground">{c.name}</td>
                  <td className="py-2 px-2">
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                      c.platform === "Google" ? "bg-blue-500/10 text-blue-600" : "bg-indigo-500/10 text-indigo-600"
                    )}>{c.platform}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded capitalize",
                      c.status === "active" ? "bg-emerald-500/10 text-emerald-600" :
                      c.status === "paused" ? "bg-amber-500/10 text-amber-600" :
                      "bg-muted text-muted-foreground"
                    )}>{c.status}</span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">{c.budget}</td>
                  <td className="py-2 px-2 text-foreground">{c.spend}</td>
                  <td className="py-2 px-2 text-right text-foreground">{c.leads}</td>
                  <td className="py-2 px-2 text-right font-bold text-emerald-600">{c.booked}</td>
                  <td className="py-2 px-2 text-right text-foreground">{c.cpl}</td>
                  <td className="py-2 px-2 text-right text-foreground">{c.cpb}</td>
                  <td className="py-2 px-2 text-right text-muted-foreground text-[10px]">{c.destination}</td>
                  <td className="py-2 px-2 text-right">
                    <button onClick={() => toast.info(`Edit ${c.name}`)} className="p-1 rounded hover:bg-muted">
                      <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state hint */}
        <p className="text-[10px] text-muted-foreground text-center py-2">
          Campaigns sync from Google Ads and Meta Ads when connected.
        </p>
      </div>
    </GrowthEngineShell>
  );
}
