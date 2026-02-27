import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "lucide-react";

/* ─── Fixed IDs for demo vendors ─── */
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

const SAMPLE_SUPPORT_TICKETS = [
  { name: "Demo Customer A", email: "demo-ticketA@example.com", subject: "Moving date change request", message: "I need to change my moving date from June 15 to June 22. Is this possible?", status: "open" },
  { name: "Demo Customer B", email: "demo-ticketB@example.com", subject: "Damage claim", message: "Some items were damaged during the move. I'd like to file a claim.", status: "open" },
  { name: "Demo Customer C", email: "demo-ticketC@example.com", subject: "Invoice question", message: "I have a question about an extra charge on my invoice.", status: "in_progress" },
  { name: "Demo Customer D", email: "demo-ticketD@example.com", subject: "Great service!", message: "Just wanted to say thank you for the excellent moving experience.", status: "resolved" },
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
    try {
      // 1. Vendors
      const { error: vErr } = await supabase.from("lead_vendors").upsert(SAMPLE_VENDORS as any);
      if (vErr) { toast.error("Vendors: " + vErr.message); setLoading(false); return; }

      // 2. Leads
      const now = Date.now();
      const leadInserts = SAMPLE_LEADS.map((l) => ({
        first_name: l.first_name, last_name: l.last_name, email: l.email,
        phone: l.phone, source: l.source, status: l.status,
        vendor_id: VENDOR_IDS[l.vendor_idx], estimated_value: l.estimated_value,
        created_at: new Date(now - l.days_ago * 86400000).toISOString(),
      }));
      const { data: insertedLeads, error: lErr } = await supabase.from("leads").insert(leadInserts).select("id, email");
      if (lErr) { toast.error("Leads: " + lErr.message); setLoading(false); return; }

      // 3. Deals for some leads
      const leadMap: Record<string, string> = {};
      (insertedLeads || []).forEach((l: any) => { leadMap[l.email] = l.id; });

      const dealInserts = [
        { lead_id: leadMap["demo-alice@example.com"], stage: "closed_won" as const, deal_value: 6200, actual_revenue: 5800 },
        { lead_id: leadMap["demo-dave@example.com"], stage: "closed_won" as const, deal_value: 7000, actual_revenue: 7200 },
        { lead_id: leadMap["demo-bob@example.com"], stage: "booked" as const, deal_value: 3800, actual_revenue: null },
        { lead_id: leadMap["demo-frank@example.com"], stage: "closed_won" as const, deal_value: 8500, actual_revenue: 8100 },
        { lead_id: leadMap["demo-ivy@example.com"], stage: "closed_won" as const, deal_value: 5600, actual_revenue: 5400 },
        { lead_id: leadMap["demo-olivia@example.com"], stage: "closed_won" as const, deal_value: 5500, actual_revenue: 5200 },
        { lead_id: leadMap["demo-grace@example.com"], stage: "estimate_sent" as const, deal_value: 4200, actual_revenue: null },
        { lead_id: leadMap["demo-hank@example.com"], stage: "qualified" as const, deal_value: 9100, actual_revenue: null },
        { lead_id: leadMap["demo-john@example.com"], stage: "new_lead" as const, deal_value: 4500, actual_revenue: null },
        { lead_id: leadMap["demo-mia@example.com"], stage: "contacted" as const, deal_value: 3100, actual_revenue: null },
      ].filter((d) => d.lead_id);

      if (dealInserts.length > 0) {
        const { error: dErr } = await supabase.from("deals").insert(dealInserts);
        if (dErr) console.warn("Deals insert (may need auth):", dErr.message);
      }

      // 4. Support tickets
      const { error: tErr } = await supabase.from("support_tickets").insert(SAMPLE_SUPPORT_TICKETS);
      if (tErr) console.warn("Tickets insert:", tErr.message);

      // 5. Calls (requires auth — best effort)
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (userId) {
        const callInserts = [
          { agent_id: userId, customer_name: "Demo: John Smith", customer_phone: "(555) 111-0001", call_type: "inbound", status: "completed" as const, outcome: "booked" as const, duration_seconds: 320, notes: "Customer booked a local move for next month.", started_at: new Date(now - 2 * 86400000).toISOString() },
          { agent_id: userId, customer_name: "Demo: Alice Brown", customer_phone: "(555) 111-0002", call_type: "outbound", status: "completed" as const, outcome: "follow_up" as const, duration_seconds: 180, notes: "Need to follow up with estimate.", started_at: new Date(now - 5 * 86400000).toISOString() },
          { agent_id: userId, customer_name: "Demo: Frank Garcia", customer_phone: "(555) 222-0001", call_type: "inbound", status: "completed" as const, outcome: "booked" as const, duration_seconds: 450, notes: "Large interstate move booked.", started_at: new Date(now - 8 * 86400000).toISOString() },
          { agent_id: userId, customer_name: "Demo: Mia Lewis", customer_phone: "(555) 333-0001", call_type: "outbound", status: "completed" as const, outcome: "no_answer" as const, duration_seconds: 0, notes: "No answer, will try again.", started_at: new Date(now - 10 * 86400000).toISOString() },
          { agent_id: userId, customer_name: "Demo: Grace Taylor", customer_phone: "(555) 222-0002", call_type: "inbound", status: "completed" as const, outcome: "callback_scheduled" as const, duration_seconds: 210, notes: "Customer requested callback for Thursday.", started_at: new Date(now - 12 * 86400000).toISOString() },
        ];
        const { error: cErr } = await supabase.from("calls").insert(callInserts);
        if (cErr) console.warn("Calls insert:", cErr.message);

        // 6. Activities
        const sampleLeadIds = Object.values(leadMap).slice(0, 6);
        const activityInserts = sampleLeadIds.map((lid, i) => ({
          agent_id: userId,
          lead_id: lid,
          type: (["call", "email", "note", "follow_up", "meeting", "call"] as const)[i],
          subject: `Demo activity ${i + 1}`,
          description: `Sample ${(["call", "email", "note", "follow_up", "meeting", "call"])[i]} for demo lead.`,
          created_at: new Date(now - (i + 1) * 3 * 86400000).toISOString(),
        }));
        const { error: aErr } = await supabase.from("activities").insert(activityInserts);
        if (aErr) console.warn("Activities insert:", aErr.message);

        // 7. Vendor-agent assignments (skill-based routing demo)
        const assignInserts = VENDOR_IDS.map(vid => ({
          vendor_id: vid, agent_id: userId, is_active: true,
          max_cpa: vid === VENDOR_IDS[2] ? 15 : null, // LocalReach has a $15 cap
        }));
        const { error: asErr } = await supabase.from("vendor_agent_assignments").upsert(assignInserts as any, { onConflict: "vendor_id,agent_id" });
        if (asErr) console.warn("Assignments insert:", asErr.message);
      }

      setActive(true);
      toast.success("Sample data loaded across all modules");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
    setLoading(false);
    onToggle?.();
  };

  const clearData = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      // Get demo lead IDs
      const { data: demoLeads } = await supabase.from("leads").select("id").like("email", "demo-%@example.com");
      const leadIds = (demoLeads || []).map((l: any) => l.id);

      // Delete deals linked to demo leads
      if (leadIds.length > 0) {
        await supabase.from("deals").delete().in("lead_id", leadIds);
        await supabase.from("activities").delete().in("lead_id", leadIds);
      }

      // Delete demo leads
      await supabase.from("leads").delete().like("email", "demo-%@example.com");

      // Delete vendor-agent assignments for demo vendors
      await supabase.from("vendor_agent_assignments").delete().in("vendor_id", VENDOR_IDS);

      // Delete demo vendors
      await supabase.from("lead_vendors").delete().in("id", VENDOR_IDS);

      // Delete demo support tickets
      await supabase.from("support_tickets").delete().like("email", "demo-%@example.com");

      // Delete demo calls (by name pattern)
      if (userId) {
        await supabase.from("calls").delete().like("customer_name", "Demo:%").eq("agent_id", userId);
      }

      setActive(false);
      toast.success("Sample data cleared from all modules");
    } catch (e: any) {
      toast.error("Error clearing: " + e.message);
    }
    setLoading(false);
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
