// import { useState, useEffect } from "react";
// import { classifyIssue } from "../../lib/logic";
// import { runLocalAI, localAIFailed, onLocalAIProgress } from "../../lib/ai";
// import ChatShell from "../../components/shared/ChatShell";
// import SectionHeader from "../../components/shared/SectionHeader";

// const FAQ = [
//   { match: /(cancel|reschedul)/, reply: "You can cancel or reschedule any booking up to 2 hours before the scheduled slot from My Jobs, with no fee." },
//   { match: /(refund|money back)/, reply: "Refunds are processed to your original payment method within 3–5 business days if a job is cancelled by the worker or cooperative." },
//   { match: /(pay|price|cost|charge)/, reply: "Every job shows a Fair Wage Guard price breakdown before you confirm — worker share, cooperative share, and welfare fund contribution." },
//   { match: /(worker|who is coming)/, reply: "Your assigned worker's profile, trust score, and live status are visible from My Jobs once a booking is confirmed." },
//   { match: /(emergency|urgent)/, reply: "For urgent, safety-critical issues, use the Emergency Service option — it prioritizes dispatch to the nearest available verified worker." },
// ];

// // Fallback only — used if no Hugging Face token is configured, or a request fails.
// function fallbackRespond(userText, role) {
//   const service = classifyIssue(userText);
//   if (service) {
//     return `That sounds like a ${service.name.toLowerCase()} issue. I can route this straight into a booking — want me to start one for ${service.name}?`;
//   }
//   const faq = FAQ.find((f) => f.match.test(userText.toLowerCase()));
//   if (faq) return faq.reply;
//   return role === "worker"
//     ? "I can help with job status, payouts, verification, or training questions — could you tell me a bit more about what you need?"
//     : "I can help route service issues, explain pricing, or answer booking questions — could you describe the issue a bit more?";
// }

// const SYSTEM_PROMPT = (role) =>
//   role === "worker"
//     ? "You are SAHAAY's assistant for cooperative gig workers. Help with jobs, payouts, verification, and training questions. Be concise, 2-3 sentences max."
//     : "You are SAHAAY's assistant for customers booking home services through a worker cooperative. Help route service issues, explain pricing, and answer booking questions. Be concise, 2-3 sentences max.";

// // "history" is the full running conversation — this IS the recall: every prior
// // user/assistant message is passed back in on every turn, so the model has full
// // context of what was already said, not just the latest message in isolation.
// async function respond(history, role) {
//   const latest = history[history.length - 1]?.text || "";

//   // Cheap instant pre-check: if the latest message confidently matches a known
//   // service keyword, short-circuit straight to a booking prompt without waiting
//   // on the API.
//   const service = classifyIssue(latest);
//   if (service) {
//     return `That sounds like a ${service.name.toLowerCase()} issue. I can route this straight into a booking — want me to start one for ${service.name}?`;
//   }

//   try {
//     const messages = [
//       { role: "system", content: SYSTEM_PROMPT(role) },
//       ...history.map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })),
//     ];
//     return await runLocalAI(messages);
//   } catch {
//     return fallbackRespond(latest, role);
//   }
// }

// export default function Assistant({ role = "customer" }) {
//   const [messages, setMessages] = useState([
//     { from: "bot", text: role === "worker" ? "Hi! Ask me about jobs, payouts, verification, or training." : "Hi! Describe your issue and I'll help route it, or ask about bookings and payments." },
//   ]);
//   const [thinking, setThinking] = useState(false);
//   const [aiStatus, setAiStatus] = useState({ status: "idle", progress: 0 });

//   useEffect(() => onLocalAIProgress(setAiStatus), []);

//   const onSend = async (text) => {
//     const next = [...messages, { from: "user", text }];
//     setMessages(next);
//     setThinking(true);
//     const reply = localAIFailed() ? fallbackRespond(text, role) : await respond(next, role);
//     setThinking(false);
//     setMessages((m) => [...m, { from: "bot", text: reply }]);
//   };

//   const banner =
//     aiStatus.status === "no_token"
//       ? "Running on rule-based fallback replies only — the AI service is currently unavailable. Try again shortly."
//       : aiStatus.status === "rate_limited"
//       ? "Hugging Face's free-tier rate limit was just hit — falling back to rule-based replies for now. Try again shortly."
//       : null;

//   return (
//     <div className="space-y-6 h-full flex flex-col">
//       <SectionHeader eyebrow="AI Service Assistant" title="Ask SAHAAY" blurb="Powered by Hugging Face's free-tier Inference API — categorizes issues and holds a real multi-turn conversation." />
//       {banner && (
//         <p className="text-xs text-marigold-600 bg-marigold-100/60 rounded-lg px-3 py-2">{banner}</p>
//       )}
//       <div className="flex-1 min-h-[420px]">
//         <ChatShell
//           messages={thinking ? [...messages, { from: "bot", text: "…", thinking: true }] : messages}
//           onSend={onSend}
//           disclaimer="Powered by Hugging Face's free-tier Inference API — replies may occasionally be inaccurate, delayed, or unavailable if the free rate limit is reached."
//         />
//       </div>
//     </div>
//   );
// }




import { useState, useEffect } from "react";
import { classifyIssue } from "../../lib/logic";
import { runLocalAI, localAIFailed, onLocalAIProgress } from "../../lib/ai";
import ChatShell from "../../components/shared/ChatShell";
import SectionHeader from "../../components/shared/SectionHeader";

const FAQ = [
  { match: /(cancel|reschedul)/, reply: "You can cancel or reschedule any booking up to 2 hours before the scheduled slot from My Jobs, with no fee." },
  { match: /(refund|money back)/, reply: "Refunds are processed to your original payment method within 3–5 business days if a job is cancelled by the worker or cooperative." },
  { match: /(pay|price|cost|charge)/, reply: "Every job shows a Fair Wage Guard price breakdown before you confirm — worker share, cooperative share, and welfare fund contribution." },
  { match: /(worker|who is coming)/, reply: "Your assigned worker's profile, trust score, and live status are visible from My Jobs once a booking is confirmed." },
  { match: /(emergency|urgent)/, reply: "For urgent, safety-critical issues, use the Emergency Service option — it prioritizes dispatch to the nearest available verified worker." },
];

// Fallback only — used if no Hugging Face token is configured, or a request fails.
function fallbackRespond(userText, role) {
  const service = classifyIssue(userText);
  if (service) {
    return `That sounds like a ${service.name.toLowerCase()} issue. I can route this straight into a booking — want me to start one for ${service.name}?`;
  }
  const faq = FAQ.find((f) => f.match.test(userText.toLowerCase()));
  if (faq) return faq.reply;
  return role === "worker"
    ? "I can help with job status, payouts, verification, or training questions — could you tell me a bit more about what you need?"
    : "I can help route service issues, explain pricing, or answer booking questions — could you describe the issue a bit more?";
}

const SYSTEM_PROMPT = (role) =>
  role === "worker"
    ? "You are SAHAAY's assistant for cooperative gig workers. Help with jobs, payouts, verification, and training questions. Be concise, 2-3 sentences max."
    : "You are SAHAAY's assistant for customers booking home services through a worker cooperative. Help route service issues, explain pricing, and answer booking questions. Be concise, 2-3 sentences max.";

// "history" is the full running conversation — this IS the recall: every prior
// user/assistant message is passed back in on every turn, so the model has full
// context of what was already said, not just the latest message in isolation.
async function respond(history, role) {
  const latest = history[history.length - 1]?.text || "";

  // Cheap instant pre-check: if the latest message confidently matches a known
  // service keyword, short-circuit straight to a booking prompt without waiting
  // on the API.
  const service = classifyIssue(latest);
  if (service) {
    return `That sounds like a ${service.name.toLowerCase()} issue. I can route this straight into a booking — want me to start one for ${service.name}?`;
  }

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT(role) },
      ...history.map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })),
    ];
    return await runLocalAI(messages);
  } catch (err) {
    console.error("[SAHAAY AI] Hugging Face request failed, falling back to rule-based reply:", err);
    return fallbackRespond(latest, role);
  }
}

export default function Assistant({ role = "customer" }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: role === "worker" ? "Hi! Ask me about jobs, payouts, verification, or training." : "Hi! Describe your issue and I'll help route it, or ask about bookings and payments." },
  ]);
  const [thinking, setThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState({ status: "idle", progress: 0 });

  useEffect(() => onLocalAIProgress(setAiStatus), []);

  const onSend = async (text) => {
    const next = [...messages, { from: "user", text }];
    setMessages(next);
    setThinking(true);
    const reply = localAIFailed() ? fallbackRespond(text, role) : await respond(next, role);
    setThinking(false);
    setMessages((m) => [...m, { from: "bot", text: reply }]);
  };

  const banner =
    aiStatus.status === "no_token"
      ? "Running on rule-based fallback replies only — the AI service is currently unavailable. Try again shortly."
      : aiStatus.status === "rate_limited"
      ? "Hugging Face's free-tier rate limit was just hit — falling back to rule-based replies for now. Try again shortly."
      : null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <SectionHeader eyebrow="AI Service Assistant" title="Ask SAHAAY" blurb="Powered by Hugging Face's free-tier Inference API — categorizes issues and holds a real multi-turn conversation." />
      {banner && (
        <p className="text-xs text-marigold-600 bg-marigold-100/60 rounded-lg px-3 py-2">{banner}</p>
      )}
      <div className="flex-1 min-h-[420px]">
        <ChatShell
          messages={thinking ? [...messages, { from: "bot", text: "…", thinking: true }] : messages}
          onSend={onSend}
          disclaimer="Powered by Hugging Face's free-tier Inference API — replies may occasionally be inaccurate, delayed, or unavailable if the free rate limit is reached."
        />
      </div>
    </div>
  );
}