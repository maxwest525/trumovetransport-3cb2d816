import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "lucide-react";

const VENDOR_IDS = [
  "a1000000-0000-0000-0000-000000000001",
  "a1000000-0000-0000-0000-000000000002",
  "a1000000-0000-0000-0000-000000000003",
];

const SAMPLE_VENDORS = [
  { id: VENDOR_IDS[0], name: "MovingLeads.com", contact_name: "Sarah Chen", contact_email: "sarah@movingleads.com", contact_phone: "(555) 100-2000", website: "https://movingleads.com", vendor_type: "lead_provider", status: "active", cost_per_lead: 12.5, monthly_budget: 3000, contract_start: "2025-06-01", contract_end: "2026-06-01" },
  { id: VENDOR_IDS[1], name: "QuoteRunner", contact_name: "Mike Alvarez", contact_email: "mike@quoterunner.io", contact_phone: "(555) 200-3000", website: "https://quoterunner.io", vendor_type: "aggregator", status: "active", cost_per_lead: 18, monthly_budget: 5000, contract_start: "2025-09-01", contract_end: null },
  { id: VENDOR_IDS[2], name: "LocalReach Ads", contact_name: "Dana Kim", contact_email: "dana@localreach.co", contact_phone: "(555) 300-4000", website: null, vendor_type: "ad_network", status: "paused", cost_per_lead: 8.75, monthly_budget: 1500, contract_start: "2025-03-01", contract_end: "2025-12-31" },
];

const SAMPLE_LEADS = [
  { first_name: "John", last_name: "Smith", email: "demo-john@example.com", phone: "(555) 111-0001", source: "website" as const, status: "new" as const, vendor_idx: 0, estimated_value: 4500, days_ago: 2 },
  { first_name: "Alice", last_name: "Brown", email: "demo-alice@example.com", phone: "(555) 111-0002", source: "ppc" as const, status: "contacted" as const, vendor_idx: 0, estimated_value: 6200, days_ago: 10 },
  { first_name: "Bob", last_name: "Davis", email: "demo-bob@example.com", phone: "(555) 111-0003", source: "website" as const, status: "qualified" as const, vendor_idx: 0, estimated_value: 3800, days_ago: 22 },
  { first_name: "Carol", last_name: "Wilson", email: "demo-carol@example.com", phone: "(555) 111-0004", source: "referral" as const, status: "new" as const, vendor_idx: 0, estimated_value: 5100, days_ago: 35 },
  { first_name: "Dave", last_name: "Lee", email: "demo-dave@example.com", phone: "(555) 111-0005", source: "ppc" as const, status: "contacted" as const, vendor_idx: 0, estimated_value: 7000, days_ago: 50 },
  { first_name: "Eve", last_name: "Martinez", email: "demo-eve@example.com", phone: "(555) 111-0006", source: "website" as const, status: "new" as const, vendor_idx: 0, estimated_value: 2900, days_ago: 65 },
  { first_name: "Frank", last_name: "Garcia", email: "demo-frank@example.com", phone: "(555) 222-0001", source: "ppc" as const, status: "qualified" as const, vendor_idx: 1, estimated_value: 8500, days_ago: 5 },
  { first_name: "Grace", last_name: "Taylor", email: "demo-grace@example.com", phone: "(555) 222-0002", source: "website" as const, status: "contacted" as const, vendor_idx: 1, estimated_value: 4200, days_ago: 15 },
  { first_name: "Hank", last_name: "Thomas", email: "demo-hank@example.com", phone: "(555) 222-0003", source: "ppc" as const, status: "new" as const, vendor_idx: 1, estimated_value: 9100, days_ago: 28 },
  { first_name: "Ivy", last_name: "Jackson", email: "demo-ivy@example.com", phone: "(555) 222-0004", source: "referral" as const, status: "qualified" as const, vendor_idx: 1, estimated_value: 5600, days_ago: 42 },
  { first_name: "Jake", last_name: "White", email: "demo-jake@example.com", phone: "(555) 222-0005", source: "phone" as const, status: "contacted" as const, vendor_idx: 1, estimated_value: 3300, days_ago: 55 },
  { first_name: "Mia", last_name: "Lewis", email: "demo-mia@example.com", phone: "(555) 333-0001", source: "ppc" as const, status: "contacted" as const, vendor_idx: 2, estimated_value: 3100, days_ago: 8 },
  { first_name: "Nate", last_name: "Walker", email: "demo-nate@example.com", phone: "(555) 333-0002", source: "walk_in" as const, status: "new" as const, vendor_idx: 2, estimated_value: 4800, days_ago: 20 },
  { first_name: "Olivia", last_name: "Hall", email: "demo-olivia@example.com", phone: "(555) 333-0003", source: "ppc" as const, status: "qualified" as const, vendor_idx: 2, estimated_value: 5500, days_ago: 40 },
  { first_name: "Paul", last_name: "Allen", email: "demo-paul@example.com", phone: "(555) 333-0004", source: "phone" as const, status: "new" as const, vendor_idx: 2, estimated_value: 2700, days_ago: 60 },
];

export default function DemoDataToggle({ onToggle }: { onToggle?: () => void }) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("lead_vendors").select("id").eq("id", VENDOR_IDS[0]).then(({ data }) => {
      setActive((data?.length ?? 0) > 0);
      setLoading(false);
    });
  }, []);

  const seedData = async () => {
    setLoading(true);
    // Insert vendors
    const { error: vErr } = await supabase.from("lead_vendors").upsert(SAMPLE_VENDORS as any);
    if (vErr) { toast.error("Failed to insert vendors: " + vErr.message); setLoading(false); return; }

    // Insert leads
    const now = Date.now();
    const leadInserts = SAMPLE_LEADS.map((l) => ({
      first_name: l.first_name,
      last_name: l.last_name,
      email: l.email,
      phone: l.phone,
      source: l.source,
      status: l.status,
      vendor_id: VENDOR_IDS[l.vendor_idx],
      estimated_value: l.estimated_value,
      created_at: new Date(now - l.days_ago * 86400000).toISOString(),
    }));
    const { data: insertedLeads, error: lErr } = await supabase.from("leads").insert(leadInserts).select("id, email");
    if (lErr) { toast.error("Failed to insert leads: " + lErr.message); setLoading(false); return; }

    // Insert deals for some leads
    const leadMap: Record<string, string> = {};
    (insertedLeads || []).forEach((l: any) => { leadMap[l.email] = l.id; });

    const dealInserts = [
      { lead_id: leadMap["demo-alice@example.com"], stage: "closed_won" as const, deal_value: 6200, actual_revenue: 5800 },
      { lead_id: leadMap["demo-dave@example.com"], stage: "closed_won" as const, deal_value: 7000, actual_revenue: 7200 },
      { lead_id: leadMap["demo-bob@example.com"], stage: "booked" as const, deal_value: 3800, actual_revenue: null },
      { lead_id: leadMap["demo-frank@example.com"], stage: "closed_won" as const, deal_value: 8500, actual_revenue: 8100 },
      { lead_id: leadMap["demo-ivy@example.com"], stage: "closed_won" as const, deal_value: 5600, actual_revenue: 5400 },
      { lead_id: leadMap["demo-olivia@example.com"], stage: "closed_won" as const, deal_value: 5500, actual_revenue: 5200 },
    ].filter((d) => d.lead_id);

    if (dealInserts.length > 0) {
      const { error: dErr } = await supabase.from("deals").insert(dealInserts);
      if (dErr) { toast.error("Failed to insert deals: " + dErr.message); setLoading(false); return; }
    }

    setActive(true);
    setLoading(false);
    toast.success("Sample data loaded");
    onToggle?.();
  };

  const clearData = async () => {
    setLoading(true);
    // Get demo lead IDs by email pattern
    const { data: demoLeads } = await supabase.from("leads").select("id").like("email", "demo-%@example.com");
    const leadIds = (demoLeads || []).map((l: any) => l.id);

    // Delete deals linked to demo leads
    if (leadIds.length > 0) {
      await supabase.from("deals").delete().in("lead_id", leadIds);
    }
    // Delete demo leads
    await supabase.from("leads").delete().like("email", "demo-%@example.com");
    // Delete demo vendors
    await supabase.from("lead_vendors").delete().in("id", VENDOR_IDS);

    setActive(false);
    setLoading(false);
    toast.success("Sample data cleared");
    onToggle?.();
  };

  return (
    <div className="flex items-center gap-2">
      <Database className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">Demo</span>
      <Switch
        checked={active}
        disabled={loading}
        onCheckedChange={(checked) => (checked ? seedData() : clearData())}
        className="scale-75 origin-left"
      />
    </div>
  );
}
