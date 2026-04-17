import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { attribution, contact, source } = await req.json();

    if (!attribution || typeof attribution !== "object") {
      return new Response(JSON.stringify({ error: "Attribution data required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Build tag list — mark gated leads distinctly so CRM can filter
    const tags = ["cookie-consent"];
    if (contact?.email || contact?.phone) tags.push("contact-captured");
    else tags.push("anonymous");
    if (source) tags.push(String(source));

    // 1. Create lead — populated with real contact when provided
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .insert({
        first_name: contact?.firstName?.trim() || "Anonymous",
        last_name: contact?.lastName?.trim() || "Visitor",
        email: contact?.email?.trim() || null,
        phone: contact?.phone?.trim() || null,
        source: "website",
        status: "new",
        tags,
        notes: contact?.email
          ? `Lead captured via ${source || "website"} at ${new Date().toISOString()}`
          : `Anonymous visitor captured via cookie consent at ${new Date().toISOString()}`,
      })
      .select("id")
      .single();

    if (leadErr) {
      console.error("Lead insert error:", leadErr);
      throw new Error("Failed to create anonymous lead");
    }

    const leadId = lead.id;

    // 2. Insert attribution data
    const attr = attribution;
    const { error: attrErr } = await supabase.from("lead_attribution").insert({
      lead_id: leadId,
      utm_source: attr.utm_source || null,
      utm_medium: attr.utm_medium || null,
      utm_campaign: attr.utm_campaign || null,
      utm_term: attr.utm_term || null,
      utm_content: attr.utm_content || null,
      gclid: attr.gclid || null,
      fbclid: attr.fbclid || null,
      msclkid: attr.msclkid || null,
      referrer_url: attr.referrer_url || null,
      landing_page: attr.landing_page || null,
      device_type: attr.device_type || null,
      browser: attr.browser || null,
      os: attr.os || null,
      screen_resolution: attr.screen_resolution || null,
      viewport_size: attr.viewport_size || null,
      user_agent: attr.user_agent || null,
      timezone: attr.timezone || null,
      browser_language: attr.browser_language || null,
      connection_type: attr.connection_type || null,
      is_touch_device: attr.is_touch_device || false,
      color_depth: attr.color_depth || null,
      hardware_concurrency: attr.hardware_concurrency || null,
      do_not_track: attr.do_not_track || false,
      pdf_viewer_enabled: attr.pdf_viewer_enabled || false,
      cookies_enabled: attr.cookies_enabled ?? true,
      ip_geolocation: null, // Pending: IP Geolocation API
      session_duration_seconds: attr.session_duration_seconds || 0,
      pages_visited: attr.pages_visited || 0,
      page_path_history: attr.page_path_history || [],
      visit_count: attr.visit_count || 1,
      tab_blur_count: attr.tab_blur_count || 0,
      max_scroll_depth: attr.max_scroll_depth || 0,
      ad_blocker_detected: attr.ad_blocker_detected || false,
      form_started_at: null,
      form_completed_at: null,
    });

    if (attrErr) {
      console.error("Attribution insert error:", attrErr);
      // Non-fatal — lead was still created
    }

    return new Response(JSON.stringify({ success: true, leadId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("capture-anonymous-visitor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
