import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalEvent = {
  id: string;
  date: string; // yyyy-mm-dd
  label: string;
  sub?: string;
  status?: string;
};

const DAY_NAMES = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-emerald-500",
  cancelled: "bg-slate-300",
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function MonthCalendar({
  events,
  onSelect,
  selected,
  compact = false,
}: {
  events: CalEvent[];
  onSelect?: (date: string) => void;
  selected?: string | null;
  compact?: boolean;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const byDate = useMemo(() => {
    const m: Record<string, CalEvent[]> = {};
    for (const e of events) (m[e.date] ||= []).push(e);
    return m;
  }, [events]);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const lead = first.getDay();
    const out: (Date | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const move = (delta: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  return (
    <div className="app-section rounded-3xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => move(-1)} className="size-9 rounded-full app-pill grid place-items-center" aria-label="الشهر السابق">
          <ChevronRight className="size-4" />
        </button>
        <p className="font-display font-bold text-sm">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <button onClick={() => move(1)} className="size-9 rounded-full app-pill grid place-items-center" aria-label="الشهر التالي">
          <ChevronLeft className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
        {DAY_NAMES.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const key = iso(d);
          const list = byDate[key] ?? [];
          const isToday = key === iso(today);
          const isSel = selected === key;
          return (
            <button
              key={key}
              onClick={() => onSelect?.(key)}
              className={`relative aspect-square rounded-xl text-xs flex flex-col items-center justify-center gap-1 transition
                ${isSel ? "gradient-pink text-white font-bold shadow-[0_10px_20px_-12px_rgb(244_123_165/0.9)]" : list.length ? "bg-[color:var(--color-soft-rose)]/60 font-bold" : "hover:bg-[color:var(--color-muted)]"}
                ${isToday && !isSel ? "ring-1 ring-[color:var(--color-primary)]" : ""}`}
            >
              <span>{d.getDate()}</span>
              {list.length > 0 && (
                <span className="flex gap-0.5">
                  {list.slice(0, compact ? 2 : 3).map((e) => (
                    <span key={e.id} className={`size-1.5 rounded-full ${isSel ? "bg-white" : STATUS_DOT[e.status ?? "pending"] ?? "bg-amber-400"}`} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
        {[["confirmed", "مؤكد"], ["pending", "قيد التأكيد"], ["cancelled", "ملغي"]].map(([k, l]) => (
          <span key={k} className="flex items-center gap-1">
            <span className={`size-2 rounded-full ${STATUS_DOT[k]}`} /> {l}
          </span>
        ))}
      </div>
    </div>
  );
}
