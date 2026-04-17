import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Public endpoint. Given a one-time resume token, returns the saved scan data
// (photos + inventory) so the visitor's browser can rehydrate their session.
// Marks the token as used after the first successful redemption.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    const token: string | undefined = body?.token;
    if (!token || typeof token !== "string") {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: tokenRow, error: tokenErr } = await supabase
      .from("scan_resume_tokens")
      .select("id, lead_id, expires_at, used_at")
      .eq("token", token)
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (tokenRow.used_at) {
      return new Response(
        JSON.stringify({ error: "This resume link has already been used" }),
        {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
      return new Response(
        JSON.stringify({ error: "This resume link has expired" }),
        {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Pull lead context, scan photos, and inventory in parallel.
    const [leadRes, photosRes, inventoryRes] = await Promise.all([
      supabase
        .from("leads")
        .select("id, first_name, last_name, email, phone")
        .eq("id", tokenRow.lead_id)
        .maybeSingle(),
      supabase
        .from("lead_scan_photos")
        .select("id, photo_url, room_label, detected_boxes, item_count, created_at")
        .eq("lead_id", tokenRow.lead_id)
        .order("created_at", { ascending: true }),
      supabase
        .from("lead_inventory")
        .select(
          "id, item_name, room, quantity, cubic_feet, weight, source, source_photo_url, detection_box, confidence",
        )
        .eq("lead_id", tokenRow.lead_id)
        .order("created_at", { ascending: true }),
    ]);

    if (!leadRes.data) {
      return new Response(JSON.stringify({ error: "Lead no longer exists" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark the token as used so it cannot be redeemed again.
    await supabase
      .from("scan_resume_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRow.id);

    return new Response(
      JSON.stringify({
        leadId: tokenRow.lead_id,
        lead: leadRes.data,
        photos: photosRes.data ?? [],
        inventory: inventoryRes.data ?? [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("redeem-scan-resume-token error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
