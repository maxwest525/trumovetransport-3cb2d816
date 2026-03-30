import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { leadId, behavior } = await req.json();

    if (!leadId || !behavior) {
      return new Response(JSON.stringify({ error: "leadId and behavior required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { error } = await supabase
      .from("lead_attribution")
      .update({
        click_events: (behavior.clicks || []).slice(-200),
        hover_events: (behavior.hovers || []).slice(-200),
        cta_interactions: (behavior.ctas || []).slice(-200),
        form_field_interactions: (behavior.formFields || []).slice(-200),
        rage_clicks: behavior.rageClicks || 0,
        total_clicks: behavior.totalClicks || 0,
        exit_intent_count: behavior.exitIntentCount || 0,
        scroll_milestones: behavior.scrollMilestones || [],
        total_time_on_page: behavior.timeOnPage || {},
        last_activity_at: new Date().toISOString(),
        session_duration_seconds: behavior.sessionDuration || 0,
        max_scroll_depth: behavior.maxScrollDepth || 0,
        pages_visited: behavior.pagesVisited || 0,
        page_path_history: behavior.pagePathHistory || [],
        tab_blur_count: behavior.tabBlurCount || 0,
      })
      .eq("lead_id", leadId);

    if (error) {
      console.error("Behavior sync error:", error);
      return new Response(JSON.stringify({ error: "Sync failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sync-behavior error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
