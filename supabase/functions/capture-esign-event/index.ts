import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AuditEventRequest {
  refNumber: string;
  documentType: string;
  customerName: string;
  customerEmail?: string;
  eventType: string;
  eventData?: Record<string, unknown>;
  documentHash?: string;
  consentGiven?: boolean;
  consentText?: string;
  leadId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AuditEventRequest = await req.json();

    // Capture IP from request headers
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      event_data: body.eventData || {},
      document_hash: body.documentHash || null,
      consent_given: body.consentGiven || false,
      consent_text: body.consentText || null,
      agent_id: agentId,
      lead_id: body.leadId || null,
    });

    if (error) {
      console.error("Failed to insert audit event:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, ip: ipAddress }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in capture-esign-event:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
