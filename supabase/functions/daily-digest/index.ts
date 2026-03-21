import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all agents with their profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .not("email", "is", null);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No agents found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const today = now.toISOString().split("T")[0];

    let emailsSent = 0;

    for (const agent of profiles) {
      // Stale deals: not closed, updated > 2 days ago
      const { data: staleDeals } = await supabase
        .from("deals")
        .select("*, leads(*)")
        .eq("assigned_agent_id", agent.id)
        .not("stage", "in", '("closed_won","closed_lost")')
        .lt("updated_at", twoDaysAgo)
        .order("updated_at", { ascending: true });

      // Upcoming moves: move_date within next 7 days
      const { data: upcomingLeads } = await supabase
        .from("leads")
        .select("*, deals(*)")
        .eq("assigned_agent_id", agent.id)
        .gte("move_date", today)
        .lte("move_date", sevenDaysFromNow)
        .order("move_date", { ascending: true });

      const staleCount = staleDeals?.length || 0;
      const upcomingCount = upcomingLeads?.length || 0;

      if (staleCount === 0 && upcomingCount === 0) continue;

      // Build email HTML
      let html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">`;
      html += `<h2 style="color: #1a1a2e;">Daily Pipeline Digest</h2>`;
      html += `<p>Hi ${agent.display_name || "Agent"},</p>`;

      if (staleCount > 0) {
        html += `<h3 style="color: #ef4444;">⚠️ ${staleCount} Stale Deal${staleCount > 1 ? "s" : ""}</h3>`;
        html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">`;
        html += `<tr style="background: #f8f8f8;"><th style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Customer</th><th style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Stage</th><th style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Value</th><th style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Last Updated</th></tr>`;
        for (const deal of (staleDeals || []).slice(0, 10)) {
          const lead = deal.leads;
          const name = lead ? `${lead.first_name} ${lead.last_name}` : "Unknown";
          const daysStale = Math.floor((now.getTime() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24));
          html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${deal.stage}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">$${(deal.deal_value || 0).toLocaleString()}</td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #ef4444;">${daysStale}d ago</td></tr>`;
        }
        html += `</table>`;
      }

      if (upcomingCount > 0) {
        html += `<h3 style="color: #3b82f6;">📅 ${upcomingCount} Upcoming Move${upcomingCount > 1 ? "s" : ""} (Next 7 Days)</h3>`;
        html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">`;
        html += `<tr style="background: #f8f8f8;"><th style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Customer</th><th style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Move Date</th><th style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Route</th></tr>`;
        for (const lead of (upcomingLeads || []).slice(0, 10)) {
          html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${lead.first_name} ${lead.last_name}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${lead.move_date}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${lead.origin_address || "TBD"} → ${lead.destination_address || "TBD"}</td></tr>`;
        }
        html += `</table>`;
      }

      html += `<p style="color: #666; font-size: 12px;">- TruMove Pipeline</p></div>`;

      // Send via Resend
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TruMove Pipeline <onboarding@resend.dev>",
          to: [agent.email],
          subject: `Pipeline Digest: ${staleCount} stale deal${staleCount !== 1 ? "s" : ""}, ${upcomingCount} upcoming move${upcomingCount !== 1 ? "s" : ""}`,
          html,
        }),
      });

      if (emailRes.ok) emailsSent++;
      else {
        const errText = await emailRes.text();
        console.error(`Failed to email ${agent.email}:`, errText);
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-digest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
