import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { bedrooms, floors, property_type, is_apartment, has_stairs, stair_flights, special_packaging, fragile_items, packing_service, origin, destination, move_date } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a moving industry estimator. Based on these property details, estimate:
1. Total cubic feet of belongings
2. Total weight in pounds
3. Recommended price per cubic foot

Property details:
- Type: ${property_type}
- Bedrooms: ${bedrooms}
- Floors: ${floors}
- Is apartment/high-rise: ${is_apartment}
- Has stairs: ${has_stairs}, flights: ${stair_flights}
- Special packaging needed: ${special_packaging}
- Fragile items: ${fragile_items}
- Full packing service: ${packing_service}
- Origin: ${origin || "unknown"}
- Destination: ${destination || "unknown"}
- Move date: ${move_date || "unknown"}

Consider:
- Peak season (May-Sep) typically has 10-20% higher rates
- Longer distances command higher per-cuft pricing
- Apartments/stairs/elevator adds complexity
- Special packaging and fragile items increase pricing

Return estimates as realistic industry averages.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a moving industry estimation tool. Only respond via the provided function." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_estimate",
            description: "Return the estimated cubic feet, weight, and price per cubic foot for a move",
            parameters: {
              type: "object",
              properties: {
                cuFt: { type: "number", description: "Estimated total cubic feet" },
                weight: { type: "number", description: "Estimated total weight in pounds" },
                pricePerCuFt: { type: "number", description: "Recommended price per cubic foot in USD" },
              },
              required: ["cuFt", "weight", "pricePerCuFt"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_estimate" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const estimate = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(estimate), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback heuristic
    const baseCuFt = bedrooms * 350;
    const baseWeight = baseCuFt * 7;
    const basePrice = 6.5;
    return new Response(JSON.stringify({ cuFt: baseCuFt, weight: baseWeight, pricePerCuFt: basePrice }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
