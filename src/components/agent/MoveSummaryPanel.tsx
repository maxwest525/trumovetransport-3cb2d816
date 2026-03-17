import { useMemo } from "react";
import { MapPin, Calendar, DollarSign, Route, Clock, User, Phone, Mail, FileText, ArrowDown } from "lucide-react";

interface MoveSummaryPanelProps {
  form: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    source: string;
    originAddress: string;
    destinationAddress: string;
    moveDate: string;
    estimatedValue: string;
    notes: string;
  };
}

/** Known city-pair rough distances (miles) */
const CITY_DISTANCES: Record<string, number> = {
  "miami-atlanta": 662,
  "miami-new york": 1280,
  "miami-orlando": 235,
  "miami-tampa": 280,
  "miami-jacksonville": 345,
  "miami-charlotte": 650,
  "new york-boston": 215,
  "new york-chicago": 790,
  "new york-philadelphia": 95,
  "new york-washington": 225,
  "los angeles-san francisco": 382,
  "los angeles-phoenix": 370,
  "los angeles-las vegas": 270,
  "chicago-detroit": 282,
  "chicago-indianapolis": 183,
  "dallas-houston": 239,
  "dallas-austin": 195,
  "atlanta-charlotte": 244,
  "atlanta-nashville": 248,
};

function extractCity(address: string): string {
  if (!address) return "";
  // Try to extract city from "Street, City, ST ZIP" pattern
  const parts = address.split(",").map(p => p.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 2].toLowerCase().replace(/[^a-z\s]/g, "").trim();
  }
  return address.toLowerCase().replace(/[^a-z\s]/g, "").trim();
}

function estimateDistance(origin: string, destination: string): number | null {
  const cityA = extractCity(origin);
  const cityB = extractCity(destination);
  if (!cityA || !cityB) return null;

  for (const [key, dist] of Object.entries(CITY_DISTANCES)) {
    const [c1, c2] = key.split("-");
    if ((cityA.includes(c1) && cityB.includes(c2)) || (cityA.includes(c2) && cityB.includes(c1))) {
      return dist;
    }
  }
  return null;
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function SummaryRow({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${accent ? "text-primary" : "text-muted-foreground/60"}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{label}</p>
        <p className={`text-[13px] leading-snug mt-0.5 truncate ${value === "—" ? "text-muted-foreground/40 italic" : "text-foreground"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function MoveSummaryPanel({ form }: MoveSummaryPanelProps) {
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ") || "—";
  const distance = useMemo(() => estimateDistance(form.originAddress, form.destinationAddress), [form.originAddress, form.destinationAddress]);
  const daysLeft = useMemo(() => daysUntil(form.moveDate), [form.moveDate]);

  const completeness = useMemo(() => {
    const fields = [form.firstName, form.lastName, form.email, form.phone, form.originAddress, form.destinationAddress, form.moveDate, form.estimatedValue];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form]);

  return (
    <div className="w-72 shrink-0">
      <div className="sticky top-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-semibold">
            Move Summary
          </h3>
          {/* Completeness bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Completeness</span>
              <span className="font-medium">{completeness}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-0.5">
          <SummaryRow icon={User} label="Customer" value={fullName} accent />
          {form.phone && <SummaryRow icon={Phone} label="Phone" value={form.phone} />}
          {form.email && <SummaryRow icon={Mail} label="Email" value={form.email} />}
        </div>

        {/* Route */}
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-start gap-2.5 py-1.5">
            <div className="flex flex-col items-center gap-0.5 mt-1">
              <div className="w-2 h-2 rounded-full border-2 border-primary bg-background" />
              <div className="w-px h-6 bg-border" />
              <div className="w-2 h-2 rounded-full border-2 border-foreground bg-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Origin</p>
                <p className={`text-[12px] leading-snug mt-0.5 ${form.originAddress ? "text-foreground" : "text-muted-foreground/40 italic"}`}>
                  {form.originAddress || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Destination</p>
                <p className={`text-[12px] leading-snug mt-0.5 ${form.destinationAddress ? "text-foreground" : "text-muted-foreground/40 italic"}`}>
                  {form.destinationAddress || "Not set"}
                </p>
              </div>
            </div>
          </div>

          {distance !== null && (
            <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2">
              <Route className="w-3.5 h-3.5 text-primary" />
              <span className="text-[13px] font-semibold text-foreground">{distance.toLocaleString()} mi</span>
              <span className="text-[10px] text-muted-foreground">estimated</span>
            </div>
          )}
        </div>

        {/* Timing & Value */}
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-0.5">
          <SummaryRow icon={Calendar} label="Move Date" value={formatDate(form.moveDate)} accent={!!form.moveDate} />
          {daysLeft !== null && (
            <div className="flex items-center gap-2 pl-6 -mt-1 mb-1">
              <Clock className="w-3 h-3 text-muted-foreground/50" />
              <span className={`text-[11px] font-medium ${daysLeft <= 7 ? "text-destructive" : daysLeft <= 14 ? "text-amber-500" : "text-muted-foreground"}`}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Today" : `${daysLeft}d away`}
              </span>
            </div>
          )}
          <SummaryRow
            icon={DollarSign}
            label="Estimated Value"
            value={form.estimatedValue ? `$${Number(form.estimatedValue).toLocaleString()}` : "—"}
            accent={!!form.estimatedValue}
          />
        </div>

        {/* Notes preview */}
        {form.notes && (
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3 h-3 text-muted-foreground/60" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Notes</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{form.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}