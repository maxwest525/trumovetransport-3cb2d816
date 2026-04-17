import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Industry-standard density factor (lbs per cubic foot)
const DENSITY = 7;

const SYSTEM_PROMPT = `You are a professional moving inventory specialist analyzing room photos. Identify every visible piece of furniture, appliance, and large item that a moving company would need to transport.

For each detected item, provide:
- name: A clear, common name (e.g. "3-Seat Sofa", "Queen Bed", "Refrigerator", "Dining Chair", "Coffee Table")
- room: Best guess based on context (Living Room, Bedroom, Kitchen, Dining Room, Bathroom, Office, Garage, Patio & Outdoor, Storage, Other)
- quantity: How many of that item are visible
- cubicFeet: Realistic cubic feet for that item (use moving industry standards - e.g. sofa 50, queen bed 65, dining chair 5, coffee table 5, refrigerator 60, dresser 40, nightstand 5, tv 15, lamp 3)
- weight: Realistic weight in lbs (use cubicFeet * 7 as default)
- confidence: 0-100 score for how confident you are
- box: A normalized bounding box {x, y, width, height} where each value is 0-1 relative to the image dimensions (x,y = top-left corner). Be tight around the visible item.

Skip:
- Small decor items (books, picture frames, vases, plants under 2ft)
- Items inside drawers/cabinets
- Built-in fixtures (cabinets, sinks, ceiling lights)

Return ONLY items you can clearly see. Be thorough but accurate. ALWAYS provide a bounding box for each item.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageUrl, roomHint } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "imageUrl (data URL or https URL) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userText = roomHint
      ? `This photo is from the ${roomHint}. Identify every movable item you can see and provide a normalized bounding box (0-1) for each.`
      : "Identify every movable item you can see in this photo and provide a normalized bounding box (0-1) for each.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_detected_items",
              description: "Report all movable items detected in the photo with bounding boxes",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        room: { type: "string" },
                        quantity: { type: "number" },
                        cubicFeet: { type: "number" },
                        weight: { type: "number" },
                        confidence: { type: "number" },
                        box: {
                          type: "object",
                          description: "Normalized bounding box (0-1) of the item in the image",
                          properties: {
                            x: { type: "number", description: "Left edge (0-1)" },
                            y: { type: "number", description: "Top edge (0-1)" },
                            width: { type: "number", description: "Width (0-1)" },
                            height: { type: "number", description: "Height (0-1)" },
                          },
                          required: ["x", "y", "width", "height"],
                          additionalProperties: false,
                        },
                      },
                      required: ["name", "room", "quantity", "cubicFeet", "weight", "confidence", "box"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["items"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_detected_items" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI vision detection failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let items: Array<{ name: string; room: string; quantity: number; cubicFeet: number; weight: number; confidence: number; box?: { x: number; y: number; width: number; height: number } }> = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        items = Array.isArray(parsed.items) ? parsed.items : [];
      } catch (e) {
        console.error("Failed to parse tool args:", e);
      }
    }

    // Sanitize - ensure realistic values + clamp box to 0-1
    const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
    items = items.map((it) => {
      const cuft = Math.max(1, Math.round(it.cubicFeet || 5));
      const wt = Math.max(5, Math.round(it.weight || cuft * DENSITY));
      let box = it.box;
      if (box && typeof box.x === "number") {
        const x = clamp01(box.x);
        const y = clamp01(box.y);
        const width = clamp01(box.width);
        const height = clamp01(box.height);
        // Ensure box stays inside image bounds
        box = {
          x,
          y,
          width: Math.min(width, 1 - x),
          height: Math.min(height, 1 - y),
        };
      }
      return {
        name: String(it.name || "Unknown item").slice(0, 80),
        room: String(it.room || roomHint || "Other").slice(0, 40),
        quantity: Math.max(1, Math.min(20, Math.round(it.quantity || 1))),
        cubicFeet: cuft,
        weight: wt,
        confidence: Math.max(0, Math.min(100, Math.round(it.confidence || 80))),
        box,
      };
    });

    return new Response(
      JSON.stringify({ success: true, items }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("detect-inventory error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
