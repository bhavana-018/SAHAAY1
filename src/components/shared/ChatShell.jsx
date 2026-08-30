import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import VoiceMic from "./VoiceMic";

export default function ChatShell({ messages, onSend, placeholder = "Describe the issue…", disclaimer }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col h-full rounded-xl2 border border-teal-100 bg-white shadow-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-sand-200 px-4 py-3 bg-teal-700 text-sand-50">
        <div className="rounded-full bg-sand-50/15 p-1.5"><Bot size={16} /></div>
        <div>
          <p className="text-sm font-semibold">SAHAAY Assistant</p>
          <p className="text-[11px] text-sand-100/80">AI via Hugging Face's free Inference API</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px] max-h-[420px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.from === "user" ? "bg-teal-600 text-sand-50 rounded-br-sm" : "bg-sand-100 text-ink rounded-bl-sm"
              }`}
            >
              {m.text}
              {m.chip && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-marigold-100 text-marigold-600 text-[11px] font-semibold px-2 py-0.5">
                  <Sparkles size={11} /> {m.chip}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {disclaimer && (
        <p className="px-4 py-1.5 text-[10.5px] text-ink-soft/50 bg-sand-50 border-t border-sand-200">{disclaimer}</p>
      )}

      <div className="flex items-center gap-2 border-t border-sand-200 p-3">
        <VoiceMic onTranscript={(t) => setText(t)} compact />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder}
          className="flex-1 rounded-full border border-sand-200 bg-sand-50 px-4 py-2 text-sm outline-none focus:border-teal-400"
        />
        <button onClick={submit} className="rounded-full bg-teal-600 hover:bg-teal-700 text-sand-50 p-2.5 transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
