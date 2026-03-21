import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { deal, lead, activities, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const dealContext = `
**Deal Stage:** ${deal.stage}
**Deal Value:** $${deal.deal_value || 0}
**Created:** ${deal.created_at}

**Customer:** ${lead ? `${lead.first_name} ${lead.last_name}` : "Unknown"}
**Email:** ${lead?.email || "N/A"}
**Phone:** ${lead?.phone || "N/A"}
**Source:** ${lead?.source || "N/A"}

**Move Date:** ${lead?.move_date || "Not set"}
**Origin:** ${lead?.origin_address || "N/A"}
**Destination:** ${lead?.destination_address || "N/A"}
**Est. Weight:** ${lead?.estimated_weight || "N/A"} lbs
**Est. Value:** $${lead?.estimated_value || "N/A"}

**Recent Activities (last 5):**
${(activities || []).slice(0, 5).map((a: any) => `- [${a.type}] ${a.subject || "No subject"} (${a.created_at})`).join("\n") || "None"}
`;

    let systemPrompt: string;
    let userPrompt: string;

    if (action === "draft_email") {
      systemPrompt = `You are a professional moving company sales agent. Draft a follow-up email for a customer based on their deal context. Write ONLY the email body text (no subject line, no "Subject:" prefix). Be warm, professional, and specific to their move details. Keep it under 200 words. Do not use markdown - write plain text suitable for an email.`;
      userPrompt = `Draft a follow-up email for this customer:\n${dealContext}`;
    } else {
      systemPrompt = `You are a sales assistant for a moving company CRM. Given a deal's context (customer info, move details, stage, activity history), provide:
1. A brief assessment of the deal (1-2 sentences)
2. 2-3 specific, actionable next steps
3. If asked, draft a follow-up email

Be concise, practical, and specific to the moving industry. Reference actual data from the deal context. Use markdown formatting.`;
      userPrompt = `Analyze this deal and suggest next steps:\n${dealContext}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("deal-ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
