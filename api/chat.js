// Vercel serverless function: keeps the Hugging Face token on the server.
// The browser calls /api/chat; this function calls Hugging Face's
// OpenAI-compatible Inference Providers endpoint.

const HF_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b:fastest";

export const maxDuration = 60;

function json(res, status, body) {
  return res.status(status).json(body);
}

function getText(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("")
      .trim();
  }
  return "";
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { error: "Method not allowed." });
  }

  const token = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || DEFAULT_MODEL;

  if (!token) {
    console.error("[SAHAAY API] HF_TOKEN is not configured in Vercel.");
    return json(res, 500, {
      error: "Hugging Face is not configured on the server. Add HF_TOKEN in Vercel Environment Variables.",
    });
  }

  const body = req.body || {};
  const messages = body.messages;
  const requestedMaxTokens = Number(body.max_tokens ?? 200);
  const maxTokens = Math.max(1, Math.min(500, Number.isFinite(requestedMaxTokens) ? requestedMaxTokens : 200));

  if (!Array.isArray(messages) || messages.length === 0) {
    return json(res, 400, { error: "messages must be a non-empty array." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const hfResponse = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.6,
        stream: false,
      }),
      signal: controller.signal,
    });

    const raw = await hfResponse.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: raw };
    }

    if (!hfResponse.ok) {
      console.error("[SAHAAY API] Hugging Face error:", hfResponse.status, data?.error || raw.slice(0, 300));
      return json(res, hfResponse.status === 429 ? 429 : 502, {
        error:
          hfResponse.status === 429
            ? "Hugging Face rate limit reached. Please try again shortly."
            : `Hugging Face request failed (${hfResponse.status}).`,
      });
    }

    const text = getText(data?.choices?.[0]?.message?.content);
    if (!text) {
      console.error("[SAHAAY API] Empty Hugging Face response:", data);
      return json(res, 502, { error: "Hugging Face returned an empty response." });
    }

    return json(res, 200, { text });
  } catch (error) {
    const message = error?.name === "AbortError" ? "Hugging Face request timed out." : "Unable to reach Hugging Face.";
    console.error("[SAHAAY API] Request error:", error);
    return json(res, 504, { error: message });
  } finally {
    clearTimeout(timeout);
  }
}
