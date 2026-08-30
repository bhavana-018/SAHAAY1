import { useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import VoiceMic from "../../components/shared/VoiceMic";
import { useLang } from "../../lib/i18n";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Availability() {
  const { lang } = useLang();
  const [status, setStatus] = useState(DAYS.map((_, i) => i !== 5 && i !== 6));
  const [voiceLog, setVoiceLog] = useState([]);

  const toggle = (i) => setStatus((s) => s.map((v, idx) => (idx === i ? !v : v)));

  const handleTranscript = (phrase) => {
    setVoiceLog((log) => [{ phrase, ts: new Date().toLocaleTimeString() }, ...log].slice(0, 5));
    // The spec's own worked example: "कल मैं उपलब्ध नहीं हूं" / "I am not available tomorrow" → marks tomorrow unavailable.
    const marksTomorrowUnavailable = ["कल मैं उपलब्ध नहीं हूं", "I am not available tomorrow", "నేను రేపు అందుబాటులో లేను"];
    if (marksTomorrowUnavailable.includes(phrase)) {
      const todayIdx = new Date().getDay(); // 0=Sun
      const tomorrowIdx = (todayIdx + 1) % 7;
      const mapped = tomorrowIdx === 0 ? 6 : tomorrowIdx - 1; // convert to Mon-first index
      setStatus((s) => s.map((v, idx) => (idx === mapped ? false : v)));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Availability</h1>
        <p className="text-sm text-ink-soft/60 mt-1">Tap a day to toggle it, or just tell us out loud.</p>
      </div>

      <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => toggle(i)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
                status[i] ? "border-coop-500/30 bg-coop-500/10" : "border-alert-400/30 bg-alert-500/5"
              }`}
            >
              <span className="text-xs font-semibold text-ink-soft/70">{d}</span>
              {status[i] ? <CheckCircle2 size={18} className="text-coop-500" /> : <XCircle size={18} className="text-alert-500" />}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl2 border border-marigold-300 bg-marigold-100/40 p-5">
        <div className="flex items-center gap-2 mb-1">
          <VoiceMic onTranscript={handleTranscript} />
          <p className="text-sm font-semibold text-ink">Set availability by voice</p>
        </div>
        <p className="text-xs text-ink-soft/60 mb-3 ml-11">
          {lang === "hi" ? 'Try saying: "कल मैं उपलब्ध नहीं हूं"' : lang === "te" ? 'Try saying: "నేను రేపు అందుబాటులో లేను"' : 'Try saying: "I am not available tomorrow"'}
        </p>
        {voiceLog.length > 0 && (
          <div className="ml-11 space-y-1.5">
            {voiceLog.map((v, i) => (
              <p key={i} className="text-xs text-ink-soft/70 bg-white rounded-lg px-3 py-1.5 border border-sand-200">
                "{v.phrase}" <span className="text-ink-soft/40">· {v.ts}</span>
              </p>
            ))}
          </div>
        )}
        <p className="ml-11 mt-3 text-[11px] text-ink-soft/45 flex items-start gap-1">
          <Info size={12} className="shrink-0 mt-0.5" /> Voice input uses a small set of recognised phrases in the
          language selected above — not open speech recognition.
        </p>
      </div>
    </div>
  );
}
