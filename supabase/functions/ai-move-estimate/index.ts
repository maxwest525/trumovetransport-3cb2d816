import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { bedrooms, floors, property_type, is_apartment, has_stairs, stair_flights,
      special_packaging, fragile_items, packing_service, origin, destination, move_date } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Pull pricing settings & historical data from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Get admin pricing settings
    const { data: pricingRows } = await sb.from("pricing_settings").select("setting_key, setting_value");
    const pricing: Record<string, any> = {};
    for (const row of pricingRows || []) {
      pricing[row.setting_key] = row.setting_value;
    }

    const baseRate = pricing.base_rate_per_cuft?.value ?? 5.5;
    const distanceTiers = pricing.distance_tiers ?? {};
    const weightFactors = pricing.weight_factors ?? {};

    // Pull recent historical deals for learning context (last 50 closed deals with inventory)
    const { data: historicalDeals } = await sb
      .from("deals")
      .select(`
        deal_value, actual_revenue, stage,
        leads!inner(estimated_weight, price_per_cuft, origin_address, destination_address, move_date)
      `)
      .in("stage", ["closed_won", "delivered", "booked"])
      .order("created_at", { ascending: false })
      .limit(50);

    // Summarize historical data for AI context
    let historyContext = "No historical data available yet.";
    if (historicalDeals && historicalDeals.length > 0) {
      const rates = historicalDeals
        .map((d: any) => d.leads?.price_per_cuft)
        .filter((r: any) => r != null && r > 0);
      const weights = historicalDeals
        .map((d: any) => d.leads?.estimated_weight)
        .filter((w: any) => w != null && w > 0);
      const values = historicalDeals
        .map((d: any) => d.actual_revenue || d.deal_value)
        .filter((v: any) => v != null && v > 0);

      const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      const min = (arr: number[]) => arr.length ? Math.min(...arr) : 0;
      const max = (arr: number[]) => arr.length ? Math.max(...arr) : 0;

      historyContext = `Historical data from ${historicalDeals.length} recent completed moves:
- Price per cu ft: avg $${avg(rates).toFixed(2)}, range $${min(rates).toFixed(2)}-$${max(rates).toFixed(2)}
- Estimated weights: avg ${Math.round(avg(weights))} lbs, range ${Math.round(min(weights))}-${Math.round(max(weights))} lbs
- Deal values: avg $${Math.round(avg(values))}, range $${Math.round(min(values))}-$${Math.round(max(values))}`;
    }

    // Determine season
    const moveMonth = move_date ? new Date(move_date + "T00:00:00").getMonth() : new Date().getMonth();
    let seasonLabel = "off-season (Nov-Feb, lower demand)";
    if (moveMonth >= 4 && moveMonth <= 8) seasonLabel = "peak season (May-Sep, highest demand and rates)";
    else if ((moveMonth >= 2 && moveMonth <= 3) || (moveMonth >= 9 && moveMonth <= 10)) seasonLabel = "shoulder season (Mar-Apr or Oct, moderate demand)";

    const prompt = `You are a moving industry estimator for a moving company. Estimate:
1. Total cubic feet of belongings
2. Total weight in pounds  
3. Recommended price per cubic foot

COMPANY BASE RATE: $${baseRate}/cu ft — use this as your anchor, adjust based on conditions.

DISTANCE PRICING TIERS:
- Local (≤${distanceTiers.local_max_miles || 50} mi): ${distanceTiers.local_multiplier || 1}x
- Regional (≤${distanceTiers.regional_max_miles || 250} mi): ${distanceTiers.regional_multiplier || 1.15}x
- Long distance: ${distanceTiers.long_distance_multiplier || 1.35}x

WEIGHT FACTORS:
- Light item avg: ${weightFactors.light_item_avg_lbs || 15} lbs
- Medium item avg: ${weightFactors.medium_item_avg_lbs || 45} lbs
- Heavy item avg: ${weightFactors.heavy_item_avg_lbs || 120} lbs
- Special handling multiplier: ${weightFactors.special_handling_multiplier || 1.5}x

${historyContext}

CURRENT MOVE:
- Property: ${property_type}, ${bedrooms} bedrooms, ${floors} floors
- Apartment/high-rise: ${is_apartment}
- Stairs: ${has_stairs}${has_stairs ? `, ${stair_flights} flights` : ""}
- Special packaging: ${special_packaging}, Fragile: ${fragile_items}, Full packing: ${packing_service}
- Season: ${seasonLabel}
- Origin: ${origin || "unknown"}
- Destination: ${destination || "unknown"}
- Move date: ${move_date || "unknown"}

IMPORTANT: Start from the company base rate of $${baseRate}/cu ft and adjust based on distance tier, season, complexity (stairs, packaging, fragile). Peak season adds 10-20%. Long distance adds the distance multiplier. Stairs/special handling add the special handling multiplier to pricing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a moving industry estimation tool. Only respond via the provided function. Be realistic and use the company's base rate as your anchor." },
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

    // Fallback heuristic using company base rate
    const baseCuFt = bedrooms * 350;
    const baseWeight = baseCuFt * 7;
    return new Response(JSON.stringify({ cuFt: baseCuFt, weight: baseWeight, pricePerCuFt: baseRate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
