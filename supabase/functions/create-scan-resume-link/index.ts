import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generates a one-time resume token bound to a lead. Only authenticated staff
// who can already access the lead through RLS may create a token.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use the caller's JWT so RLS validates that they have access to this lead.
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const leadId: string | undefined = body?.leadId;
    const ttlHours: number =
      typeof body?.ttlHours === "number" && body.ttlHours > 0 && body.ttlHours <= 168
        ? body.ttlHours
        : 24;

    if (!leadId) {
      return new Response(JSON.stringify({ error: "leadId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Confirm the caller can read this lead (RLS will enforce it).
    const { data: lead, error: leadErr } = await userClient
      .from("leads")
      .select("id, first_name, last_name")
      .eq("id", leadId)
      .maybeSingle();

    if (leadErr || !lead) {
      return new Response(
        JSON.stringify({ error: "Lead not found or no access" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Use the service role to insert the token row so the policy bypass also
    // gives us a clean, atomic insert with the canonical creator id.
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();

    const { error: insertErr } = await adminClient
      .from("scan_resume_tokens")
      .insert({
        token,
        lead_id: leadId,
        created_by: user.id,
        expires_at: expiresAt,
      });

    if (insertErr) {
      console.error("Token insert error:", insertErr);
      return new Response(
        JSON.stringify({ error: "Could not create token" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ token, expiresAt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("create-scan-resume-link error:", error);
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
