import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a friendly and expert Vedic Math teacher who helps students understand math concepts.
- If the student asks in Hindi, respond in Hindi. If in English, respond in English.
- Use examples to make things easy to understand
- Be encouraging and supportive
- Focus on both traditional and Vedic Math methods
- Keep responses concise but helpful`;

// Multiple models across different providers to avoid rate limits
const MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "microsoft/phi-4-reasoning-plus:free",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const [firstMsg, ...restMsgs] = messages as { role: string; content: string }[];
    const augmentedMessages = [
      { role: "user", content: `${SYSTEM_PROMPT}\n\n${firstMsg.content}` },
      ...restMsgs,
    ];

    for (const model of MODELS) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://vedic-math-app.vercel.app",
          "X-Title": "Vedic Math App",
        },
        body: JSON.stringify({
          model,
          messages: augmentedMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return new Response(JSON.stringify({ content }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        const err = await response.text();
        console.error(`${model} error ${response.status}: ${err}`);
        if (response.status !== 429) throw new Error(`Error ${response.status}`);
        // 429 → try next model
      }
    }

    throw new Error("All models busy. Please try again shortly.");

  } catch (e) {
    console.error("solver-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
