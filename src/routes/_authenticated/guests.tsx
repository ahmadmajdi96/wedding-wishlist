import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Users, Check, X, Clock } from "lucide-react";
import { listGuests, saveGuest, deleteGuest } from "@/lib/saas.functions";
import { BottomNav, Phone, TopBar } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["guests"], queryFn: () => listGuests() });

export const Route = createFileRoute("/_authenticated/guests")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
  head: () => ({
    meta: [
      { title: "قائمة الضيوف | يلا نجهّز" },
      { name: "description", content: "أضيفي ضيوف حفلك وتابعي تأكيد الحضور وعدد المقاعد بسهولة." },
      { property: "og:title", content: "قائمة الضيوف | يلا نجهّز" },
      { property: "og:description", content: "إدارة كاملة لقائمة ضيوف زفافك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const SIDES: Record<string, string> = { bride: "العروس", groom: "العريس", shared: "مشترك" };
const RSVP: Record<string, { label: string; cls: string }> = {
  pending: { label: "بانتظار الرد", cls: "bg-amber-100 text-amber-700" },
  yes: { label: "سيحضر", cls: "bg-emerald-100 text-emerald-700" },
  no: { label: "معتذر", cls: "bg-slate-100 text-slate-600" },
};

const inputCls =
  "w-full rounded-xl border border-[color:var(--color-border)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--color-primary)]";

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const saveFn = useServerFn(saveGuest);
  const delFn = useServerFn(deleteGuest);
  const [draft, setDraft] = useState<any | null>(null);
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "pending">("all");

  const save = useMutation({
    mutationFn: (v: any) => saveFn({ data: v }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["guests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guests"] }),
  });

  const rows = (data as any[]).filter((g) => filter === "all" || g.rsvp === filter);
  const seats = (data as any[]).filter((g) => g.rsvp === "yes").reduce((s, g) => s + g.seats, 0);

  return (
    <Phone>
      <TopBar
        title="قائمة الضيوف"
        back="/plan"
        action={
          <button
            onClick={() => setDraft({ name: "", phone: "", side: "bride", seats: 1, rsvp: "pending" })}
            aria-label="إضافة ضيف"
            className="size-9 rounded-full gradient-pink text-white grid place-items-center"
          >
            <Plus className="size-4" />
          </button>
        }
      />
      <div className="px-5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "إجمالي الضيوف", value: data.length },
            { label: "مؤكد الحضور", value: (data as any[]).filter((g) => g.rsvp === "yes").length },
            { label: "المقاعد المحجوزة", value: seats },
          ].map((s) => (
            <div key={s.label} className="app-section rounded-2xl p-3 text-center">
              <p className="font-display font-bold text-xl text-[color:var(--color-primary)]">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {(["all", "yes", "pending", "no"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
                filter === f ? "gradient-pink text-white font-bold" : "app-pill"
              }`}
            >
              {f === "all" ? "الكل" : RSVP[f].label}
            </button>
          ))}
        </div>

        {draft && (
          <div className="app-section rounded-2xl p-4 mt-3 space-y-3">
            <input
              className={inputCls}
              placeholder="اسم الضيف"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="رقم الجوال"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                className={inputCls}
                aria-label="الجهة"
                value={draft.side}
                onChange={(e) => setDraft({ ...draft, side: e.target.value })}
              >
                {Object.entries(SIDES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <input
                className={inputCls}
                type="number"
                min={1}
                aria-label="عدد المقاعد"
                value={draft.seats}
                onChange={(e) => setDraft({ ...draft, seats: Number(e.target.value) })}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => save.mutate(draft)}
                disabled={save.isPending || !draft.name.trim()}
                className="rounded-full gradient-pink text-white font-bold px-4 py-2 text-xs disabled:opacity-50"
              >
                حفظ
              </button>
              <button onClick={() => setDraft(null)} className="rounded-full app-pill px-4 py-2 text-xs">
                إلغاء
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {rows.length === 0 && (
            <div className="app-section rounded-2xl p-8 text-center">
              <Users className="mx-auto size-9 text-[color:var(--color-primary)]/60" />
              <p className="font-display font-bold mt-2 text-sm">لا يوجد ضيوف بعد</p>
              <p className="text-xs text-muted-foreground mt-1">أضيفي ضيوفك لمتابعة تأكيدات الحضور.</p>
            </div>
          )}
          {rows.map((g, i) => (
            <div
              key={g.id}
              className="app-section rounded-2xl p-3 flex items-center gap-3 animate-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-sm truncate">{g.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {SIDES[g.side]} · {g.seats} مقعد {g.phone ? `· ${g.phone}` : ""}
                </p>
                <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] ${RSVP[g.rsvp].cls}`}>
                  {RSVP[g.rsvp].label}
                </span>
              </div>
              <div className="flex gap-1">
                {(["yes", "pending", "no"] as const).map((r) => {
                  const Icon = r === "yes" ? Check : r === "no" ? X : Clock;
                  return (
                    <button
                      key={r}
                      aria-label={RSVP[r].label}
                      onClick={() => save.mutate({ ...g, rsvp: r })}
                      className={`size-8 grid place-items-center rounded-full ${
                        g.rsvp === r ? "gradient-pink text-white" : "app-pill"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </button>
                  );
                })}
                <button
                  aria-label="حذف"
                  onClick={() => del.mutate(g.id)}
                  className="size-8 grid place-items-center rounded-full app-pill text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-4" />
      <BottomNav />
    </Phone>
  );
}
