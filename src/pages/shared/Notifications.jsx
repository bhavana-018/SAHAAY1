import { useState } from "react";
import { NOTIFICATIONS } from "../../data/seed";
import SectionHeader from "../../components/shared/SectionHeader";
import { Bell, CheckCheck } from "lucide-react";

const TONE_DOT = { teal: "bg-teal-500", coop: "bg-coop-500", marigold: "bg-marigold-400", alert: "bg-alert-500" };

export default function Notifications({ role = "customer" }) {
  const [items, setItems] = useState(NOTIFICATIONS[role] || []);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader eyebrow="Notification Center" title="Notifications" blurb={unread ? `${unread} unread` : "You're all caught up."} />
        {unread > 0 && (
          <button onClick={() => setItems((its) => its.map((i) => ({ ...i, read: true })))} className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="rounded-xl2 border border-teal-100 bg-white shadow-card divide-y divide-sand-200">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => setItems((its) => its.map((i) => (i.id === n.id ? { ...i, read: true } : i)))}
            className={`w-full text-left px-4 py-3.5 flex items-start gap-3 ${!n.read ? "bg-teal-50/40" : ""}`}
          >
            <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-sand-200" : TONE_DOT[n.tone] || "bg-teal-500"}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${n.read ? "text-ink-soft/70" : "font-semibold text-ink"}`}>{n.title}</p>
              <p className="text-xs text-ink-soft/55 mt-0.5">{n.body}</p>
              <p className="text-[10px] text-ink-soft/35 mt-1">{n.daysAgo === 0 ? "Today" : `${n.daysAgo}d ago`}</p>
            </div>
          </button>
        ))}
        {!items.length && (
          <div className="px-4 py-8 text-center text-sm text-ink-soft/50 flex flex-col items-center gap-2">
            <Bell size={20} /> No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
