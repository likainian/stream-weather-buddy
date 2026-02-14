import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRIO_BASE_URL = "https://trio.machinefi.com/api";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const TRIO_API_KEY = Deno.env.get("TRIO_API_KEY");
  if (!TRIO_API_KEY) {
    return new Response(
      JSON.stringify({ error: "TRIO_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { endpoint, ...body } = await req.json();

    // Validate endpoint
    const allowedEndpoints = ["check-once", "live-monitor", "live-digest"];
    if (!allowedEndpoints.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: `Invalid endpoint: ${endpoint}. Allowed: ${allowedEndpoints.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trioUrl = `${TRIO_BASE_URL}/${endpoint}`;

    // For live-digest, we need to stream SSE
    if (endpoint === "live-digest") {
      const trioResponse = await fetch(trioUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TRIO_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!trioResponse.ok) {
        const errorData = await trioResponse.text();
        return new Response(
          JSON.stringify({ error: `Trio API error [${trioResponse.status}]: ${errorData}` }),
          { status: trioResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Stream the SSE response through
      return new Response(trioResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // For check-once and live-monitor, standard JSON request
    const trioResponse = await fetch(trioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIO_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await trioResponse.json();

    if (!trioResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Trio API error [${trioResponse.status}]`, details: data }),
        { status: trioResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Trio API proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
