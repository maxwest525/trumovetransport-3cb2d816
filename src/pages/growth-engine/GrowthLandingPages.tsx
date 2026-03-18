import { useState } from "react";
import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Plus, Eye, Copy, MoreHorizontal, ExternalLink,
  FileText, Phone, ClipboardList, Globe,
} from "lucide-react";
import { toast } from "sonner";

interface Page {
  id: string;
  name: string;
  type: "landing" | "instant-form" | "homepage";
  status: "live" | "draft" | "paused";
  url?: string;
  cta: string;
  leads: number;
  conv: string;
  booked: number;
}

const PAGES: Page[] = [
  { id: "1", name: "Long-Distance Movers LP", type: "landing", status: "live", url: "/long-distance", cta: "Form + Click-to-Call", leads: 221, conv: "7.8%", booked: 38 },
  { id: "2", name: "Social Traffic LP", type: "landing", status: "live", url: "/social-quote", cta: "Multi-step Form", leads: 95, conv: "7.1%", booked: 11 },
  { id: "3", name: "Free Quote LP", type: "landing", status: "live", url: "/free-quote", cta: "Short Form", leads: 131, conv: "6.8%", booked: 16 },
  { id: "4", name: "Call-First LP", type: "landing", status: "live", url: "/call-now", cta: "Click-to-Call", leads: 63, conv: "9.2%", booked: 14 },
  { id: "5", name: "Meta Instant Form", type: "instant-form", status: "live", cta: "Instant Form", leads: 84, conv: "5.5%", booked: 6 },
  { id: "6", name: "Homepage", type: "homepage", status: "live", url: "/", cta: "Nav Form", leads: 67, conv: "2.1%", booked: 4 },
];

const TEMPLATES = [
  { name: "Interstate Quote Funnel", desc: "Form + trust badges + route area", cta: "Multi-step form" },
  { name: "Call-First Page", desc: "Phone number hero + urgency", cta: "Click-to-call" },
  { name: "Route-Specific", desc: "City-to-city focused LP", cta: "Form + call" },
  { name: "Social Proof Page", desc: "Reviews + gallery + form", cta: "Short form" },
];

export default function GrowthLandingPages() {
  const [view, setView] = useState<"pages" | "templates">("pages");

  return (
    <GrowthEngineShell>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Landing Pages</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-px bg-muted rounded-lg overflow-hidden">
              <button onClick={() => setView("pages")} className={cn("px-2.5 py-1 text-[10px] font-medium", view === "pages" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Pages</button>
              <button onClick={() => setView("templates")} className={cn("px-2.5 py-1 text-[10px] font-medium", view === "templates" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Templates</button>
            </div>
            <button
              onClick={() => toast.info("Page builder coming soon")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-3 h-3" /> New Page
            </button>
          </div>
        </div>

        {view === "pages" && (
          <div className="bg-card rounded-lg border border-border">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Page", "Type", "Status", "CTA", "Leads", "Conv %", "Booked", ""].map((h, i) => (
                    <th key={i} className={cn("py-1.5 px-2 text-[10px] text-muted-foreground font-semibold", i === 0 ? "text-left" : i >= 4 ? "text-right" : "text-left")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAGES.map(p => (
                  <tr key={p.id} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="py-2 px-2">
                      <div className="font-medium text-foreground">{p.name}</div>
                      {p.url && <div className="text-[9px] text-muted-foreground">{p.url}</div>}
                    </td>
                    <td className="py-2 px-2">
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded capitalize",
                        p.type === "landing" ? "bg-blue-500/10 text-blue-600" :
                        p.type === "instant-form" ? "bg-indigo-500/10 text-indigo-600" :
                        "bg-muted text-muted-foreground"
                      )}>{p.type.replace("-", " ")}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                        p.status === "live" ? "bg-emerald-500/10 text-emerald-600" :
                        p.status === "draft" ? "bg-muted text-muted-foreground" :
                        "bg-amber-500/10 text-amber-600"
                      )}>{p.status}</span>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground text-[10px]">{p.cta}</td>
                    <td className="py-2 px-2 text-right text-foreground">{p.leads}</td>
                    <td className="py-2 px-2 text-right text-foreground">{p.conv}</td>
                    <td className="py-2 px-2 text-right font-bold text-emerald-600">{p.booked}</td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => toast.info(`Preview ${p.name}`)} className="p-1 rounded hover:bg-muted"><Eye className="w-3 h-3 text-muted-foreground" /></button>
                        <button onClick={() => toast.info(`Edit ${p.name}`)} className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-3 h-3 text-muted-foreground" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "templates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEMPLATES.map(t => (
              <div key={t.name} className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[13px] font-semibold text-foreground">{t.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                  </div>
                  <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{t.cta}</span>
                </div>
                <div className="h-24 bg-muted/30 rounded-lg border border-dashed border-border/60 flex items-center justify-center mb-3">
                  <span className="text-[10px] text-muted-foreground">Preview</span>
                </div>
                <button
                  onClick={() => toast.info(`Creating page from "${t.name}" template`)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Plus className="w-3 h-3" /> Use Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </GrowthEngineShell>
  );
}
