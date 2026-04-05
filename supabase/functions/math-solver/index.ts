import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert math teacher specializing in traditional and Vedic Mathematics.

IMPORTANT: First check if the input contains a math problem (equation, calculation, or numbers to compute).

If NO math problem found, return ONLY: {"error": "no_question"}

If math problem found, return ONLY this JSON (no markdown, no code blocks):
{
  "problem": "47 × 53",
  "traditional": {
    "steps": ["step 1", "step 2", "final answer"],
    "time": "45 seconds",
    "explanation_hi": "Hindi explanation",
    "explanation_en": "English explanation"
  },
  "vedic": {
    "method": "Vedic Sutra Name",
    "steps": ["step 1", "step 2", "final answer"],
    "time": "12 seconds",
    "explanation_hi": "Hindi explanation",
    "explanation_en": "English explanation"
  },
  "speedup": "3.75x",
  "difficulty": "Easy"
}`;

const TEXT_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];

const VISION_MODELS = [
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "google/gemma-3-27b-it:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, textProblem } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    if (!imageBase64 && !textProblem) {
      return new Response(JSON.stringify({ error: "No input provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let messages: unknown[];
    let models: string[];

    if (imageBase64) {
      const imageUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
      messages = [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: `${SYSTEM_PROMPT}\n\nSolve the math problem in this image. Return JSON only. If no math problem visible, return {"error": "no_question"}.` },
        ],
      }];
      models = VISION_MODELS;
    } else {
      messages = [{
        role: "user",
        content: `${SYSTEM_PROMPT}\n\nSolve: ${textProblem}. Return JSON only.`,
      }];
      models = TEXT_MODELS;
    }

    for (const model of models) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://vedic-math-app.vercel.app",
          "X-Title": "Vedic Math App",
        },
        body: JSON.stringify({ model, messages }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) continue;

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
        } catch {
          parsed = { error: "Could not parse AI response" };
        }

        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const errText = await res.text();
      console.error(`${model} error ${res.status}: ${errText}`);
      if (res.status === 429 && models.indexOf(model) < models.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
    }

    return new Response(JSON.stringify({ error: "quota_exceeded" }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("math-solver error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
