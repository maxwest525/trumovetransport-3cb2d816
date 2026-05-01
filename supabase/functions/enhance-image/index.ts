import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Uses Lovable AI's Gemini image-edit model to upscale + sharpen the photo so
// the downstream inventory scan has more pixels and clearer edges to work with.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    const prompt =
      "Enhance this room photo for an AI inventory scan. Increase resolution, sharpen details, reduce noise and motion blur, improve lighting and color accuracy, and recover detail in shadows. Keep the exact same scene, framing, perspective, and every object in its original position. Do not add, remove, or move anything. Output a clean, high-resolution photographic version of the same image.";

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Enhance image upstream error", resp.status, txt);
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits required to enhance images." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error(`Enhance failed: ${resp.status}`);
    }

    const data = await resp.json();
    const enhancedUrl: string | undefined =
      data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!enhancedUrl) {
      console.error("No enhanced image returned", JSON.stringify(data).slice(0, 500));
      throw new Error("Model did not return an enhanced image");
    }

    return new Response(JSON.stringify({ enhancedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enhance-image error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});