import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_EVENT_TYPES = [
  "viewed",
  "opened",
  "signed",
  "completed",
  "declined",
  "sent",
  "delivered",
  "reminder_sent",
] as const;

const ALLOWED_DOCUMENT_TYPES = ["estimate", "ccach", "bol"] as const;

const AuditEventSchema = z.object({
  refNumber: z.string().trim().min(1, "refNumber is required").max(100, "refNumber too long"),
  documentType: z.string().trim().min(1, "documentType is required").max(50, "documentType too long"),
  customerName: z.string().trim().min(1, "customerName is required").max(200, "customerName too long"),
  customerEmail: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  eventType: z.enum(ALLOWED_EVENT_TYPES, {
    errorMap: () => ({ message: `eventType must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}` }),
  }),
  eventData: z.record(z.unknown()).optional().default({}),
  documentHash: z.string().trim().max(256).optional(),
  consentGiven: z.boolean().optional().default(false),
  consentText: z.string().trim().max(5000).optional(),
  leadId: z.string().uuid("Invalid leadId format").optional(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const parsed = AuditEventSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = parsed.data;

    // Capture IP from request headers (server-side, not client-provided)
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify ref_number exists in esign_documents
    const { data: docExists } = await supabase
      .from("esign_documents")
      .select("id")
      .eq("ref_number", body.refNumber)
      .limit(1)
      .maybeSingle();

    if (!docExists) {
      return new Response(
        JSON.stringify({ error: "Invalid ref_number — no matching document found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Extract agent_id from auth header if present
    let agentId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await anonClient.auth.getUser();
      agentId = userData?.user?.id || null;
    }

    const { error } = await supabase.from("esign_audit_trail").insert({
      ref_number: body.refNumber,
      document_type: body.documentType,
      customer_name: body.customerName,
      customer_email: body.customerEmail || null,
      signer_ip_address: ipAddress,
      user_agent: userAgent,
      event_type: body.eventType,
      event_data: body.eventData,
      document_hash: body.documentHash || null,
      consent_given: body.consentGiven,
      consent_text: body.consentText || null,
      agent_id: agentId,
      lead_id: body.leadId || null,
    });

    if (error) {
      console.error("Failed to insert audit event:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in capture-esign-event:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
