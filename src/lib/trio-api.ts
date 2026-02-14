import { supabase } from "@/integrations/supabase/client";

export interface CheckOnceResult {
  triggered: boolean;
  explanation: string;
  latency_ms: number;
}

export interface LiveMonitorResult {
  job_id: string;
  status: string;
}

export interface TrioError {
  error: {
    code: string;
    message: string;
    remediation: string;
  };
}

export async function checkOnce(
  streamUrl: string,
  condition: string
): Promise<CheckOnceResult> {
  const { data, error } = await supabase.functions.invoke("trio-api", {
    body: { endpoint: "check-once", stream_url: streamUrl, condition },
  });

  if (error) throw new Error(error.message);
  if (data.error) throw new Error(typeof data.error === "string" ? data.error : data.error.message || JSON.stringify(data.error));
  return data as CheckOnceResult;
}

export async function liveMonitor(
  streamUrl: string,
  condition: string,
  webhookUrl: string
): Promise<LiveMonitorResult> {
  const { data, error } = await supabase.functions.invoke("trio-api", {
    body: {
      endpoint: "live-monitor",
      stream_url: streamUrl,
      condition,
      webhook_url: webhookUrl,
    },
  });

  if (error) throw new Error(error.message);
  if (data.error) throw new Error(typeof data.error === "string" ? data.error : data.error.message || JSON.stringify(data.error));
  return data as LiveMonitorResult;
}

export async function liveDigest(
  streamUrl: string,
  onMessage: (message: string) => void,
  onError: (error: string) => void
): Promise<AbortController> {
  const controller = new AbortController();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/trio-api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
      body: JSON.stringify({ endpoint: "live-digest", stream_url: streamUrl }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      const read = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            // Parse SSE events
            const lines = text.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                onMessage(line.slice(6));
              }
            }
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name !== "AbortError") {
            onError(err.message);
          }
        }
      };
      read();
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name !== "AbortError") {
      onError(err.message);
    }
  }

  return controller;
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/live\/)([^?\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
