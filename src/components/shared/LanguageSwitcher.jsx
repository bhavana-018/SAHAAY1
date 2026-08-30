import { Languages } from "lucide-react";
import { LANGS, useLang } from "../../lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="relative inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-sand-50 pl-2.5 pr-1 py-1">
      <Languages size={14} className="text-teal-600" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-transparent text-xs font-medium text-ink outline-none cursor-pointer pr-1"
      >
        {Object.entries(LANGS).map(([code, label]) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>
  );
}
