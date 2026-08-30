// SAHAAY AI client.
// Production: browser -> /api/chat -> Vercel -> Hugging Face.
// This keeps the Hugging Face token out of the public Vite bundle.

const DEFAULT_MODEL = "openai/gpt-oss-120b:fastest";
const HF_MODEL = import.meta.env.VITE_HF_MODEL || DEFAULT_MODEL;
const DEV_TOKEN = import.meta.env.DEV ? import.meta.env.VITE_DEV_HF_TOKEN : "";
const DEV_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";

let permanentlyFailed = false;
let statusListeners = new Set();
let lastStatus = { status: "idle", progress: 0 };

function notify(update) {
  lastStatus = update;
  statusListeners.forEach((fn) => fn(update));
}

export function onLocalAIProgress(fn) {
  statusListeners.add(fn);
  fn(lastStatus);
  return () => statusListeners.delete(fn);
}

export function warmLocalAI() {
  // Production configuration is server-side, so there is no client token to check.
  // For local Vite development, a VITE_DEV_HF_TOKEN enables direct HF calls.
  if (import.meta.env.DEV && !DEV_TOKEN) {
    notify({ status: "no_token", progress: 0 });
  } else {
    notify({ status: "idle", progress: 0 });
  }
}

export function localAIFailed() {
  return permanentlyFailed;
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function callDevelopmentHF(messages, maxNewTokens) {
  return fetch(DEV_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEV_TOKEN}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      max_tokens: maxNewTokens,
      temperature: 0.6,
      stream: false,
    }),
  });
}

async function callVercelAPI(messages, maxNewTokens) {
  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      max_tokens: maxNewTokens,
    }),
  });
}

export async function runLocalAI(messages, { maxNewTokens = 200 } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("AI messages must be a non-empty array.");
  }

  notify({ status: "loading", progress: 0 });

  try {
    const res = await withTimeout(
      import.meta.env.DEV && DEV_TOKEN
        ? callDevelopmentHF(messages, maxNewTokens)
        : callVercelAPI(messages, maxNewTokens),
      55_000,
      "SAHAAY AI request"
    );

    if (res.status === 429) {
      notify({ status: "rate_limited", progress: 0 });
      throw new Error("Hugging Face rate limit reached — try again shortly.");
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      notify({ status: "error", progress: 0 });
      throw new Error(data?.error || `AI request failed (${res.status}).`);
    }

    // Production endpoint returns { text }. Local development calls HF directly.
    const text =
      typeof data?.text === "string"
        ? data.text.trim()
        : typeof data?.choices?.[0]?.message?.content === "string"
        ? data.choices[0].message.content.trim()
        : Array.isArray(data?.choices?.[0]?.message?.content)
        ? data.choices[0].message.content.map((p) => p?.text || "").join("").trim()
        : "";

    if (!text) {
      notify({ status: "error", progress: 0 });
      throw new Error("AI returned an empty response.");
    }

    notify({ status: "ready", progress: 100 });
    return text;
  } catch (err) {
    console.error("[SAHAAY AI] runLocalAI error:", err);
    if (lastStatus.status === "loading") notify({ status: "error", progress: 0 });
    // Do not permanently disable AI after a transient network/provider failure.
    throw err;
  }
}
