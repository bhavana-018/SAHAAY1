import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useLang, VOICE_PHRASES } from "../../lib/i18n";

export default function VoiceMic({ onTranscript, compact = false }) {
  const { lang, t } = useLang();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleClick = () => {
    if (listening) return;
    setListening(true);
    setTranscript("");
    const phrase = VOICE_PHRASES[lang][Math.floor(Math.random() * VOICE_PHRASES[lang].length)];
    let shown = "";
    const chars = phrase.split("");
    let i = 0;
    const interval = setInterval(() => {
      shown += chars[i];
      setTranscript(shown);
      i++;
      if (i >= chars.length) {
        clearInterval(interval);
        setTimeout(() => {
          setListening(false);
          onTranscript?.(phrase);
        }, 400);
      }
    }, 35);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleClick}
        aria-label={listening ? t("listening") : t("tapToSpeak")}
        className={`rounded-full p-2.5 transition-colors shrink-0 ${
          listening ? "bg-alert-500 text-sand-50 animate-pulse-ring" : "bg-sand-100 text-teal-600 hover:bg-teal-100"
        } ${compact ? "" : ""}`}
      >
        {listening ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
      {listening && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-ink text-sand-50 text-xs px-3 py-1.5 shadow-pop z-10">
          {transcript || t("listening")}
          <span className="animate-pulse">|</span>
        </div>
      )}
    </div>
  );
}
