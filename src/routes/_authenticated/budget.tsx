import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Wallet } from "lucide-react";
import { listBudget, saveBudgetItem, deleteBudgetItem } from "@/lib/saas.functions";
import { getMyProfile } from "@/lib/user.functions";
import { BottomNav, Phone, TopBar, fmt } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["budget"], queryFn: () => listBudget() });
const meOpts = queryOptions({ queryKey: ["me"], queryFn: () => getMyProfile() });

export const Route = createFileRoute("/_authenticated/budget")({
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(opts), context.queryClient.ensureQueryData(meOpts)]),
  component: Page,
  head: () => ({
    meta: [
      { title: "ميزانية الزفاف | يلا نجهّز" },
      { name: "description", content: "خططي ميزانية زفافك وتابعي المصروف الفعلي بند بند." },
      { property: "og:title", content: "ميزانية الزفاف | يلا نجهّز" },
      { property: "og:description", content: "أداة ذكية لتتبع مصاريف فرحك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const inputCls =
  "w-full rounded-xl border border-[color:var(--color-border)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--color-primary)]";

function Page() {
  const { data } = useSuspenseQuery(opts);
  const { data: me } = useSuspenseQuery(meOpts);
  const qc = useQueryClient();
  const saveFn = useServerFn(saveBudgetItem);
  const delFn = useServerFn(deleteBudgetItem);
  const [draft, setDraft] = useState<any | null>(null);

  const save = useMutation({
    mutationFn: (v: any) => saveFn({ data: v }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budget"] }),
  });

  const rows = data as any[];
  const planned = rows.reduce((s, r) => s + Number(r.planned), 0);
  const actual = rows.reduce((s, r) => s + Number(r.actual), 0);
  const cap = Number(me?.budget_max ?? 0) || planned;
  const pct = cap > 0 ? Math.min(100, Math.round((actual / cap) * 100)) : 0;

  return (
    <Phone>
      <TopBar
        title="ميزانية الزفاف"
        back="/plan"
        action={
          <button
            aria-label="إضافة بند"
            onClick={() => setDraft({ label: "", category_slug: "", planned: 0, actual: 0, sort_order: rows.length })}
            className="size-9 rounded-full gradient-pink text-white grid place-items-center"
          >
            <Plus className="size-4" />
          </button>
        }
      />
      <div className="px-5">
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: "linear-gradient(135deg, #0D2340, #1d3a6b)" }}
        >
          <p className="text-xs opacity-80">إجمالي المصروف</p>
          <p className="font-display font-bold text-3xl mt-1">{fmt(actual)} ر.س</p>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden mt-3">
            <div className="h-full rounded-full bg-[color:var(--color-accent)] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] mt-2 opacity-90">
            <span>المخطط: {fmt(planned)} ر.س</span>
            <span>الحد الأقصى: {fmt(cap)} ر.س</span>
          </div>
        </div>

        {draft && (
          <div className="app-section rounded-2xl p-4 mt-3 space-y-3">
            <input
              className={inputCls}
              placeholder="اسم البند (قاعة، فستان…)"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">
                المخطط
                <input
                  className={inputCls}
                  type="number"
                  value={draft.planned}
                  onChange={(e) => setDraft({ ...draft, planned: Number(e.target.value) })}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                المصروف الفعلي
                <input
                  className={inputCls}
                  type="number"
                  value={draft.actual}
                  onChange={(e) => setDraft({ ...draft, actual: Number(e.target.value) })}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => save.mutate(draft)}
                disabled={!draft.label.trim() || save.isPending}
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
              <Wallet className="mx-auto size-9 text-[color:var(--color-primary)]/60" />
              <p className="font-display font-bold mt-2 text-sm">لم تضيفي بنوداً بعد</p>
              <p className="text-xs text-muted-foreground mt-1">أضيفي بنود ميزانيتك لتتبع المصاريف بدقة.</p>
            </div>
          )}
          {rows.map((r, i) => {
            const p = Number(r.planned) || 0;
            const a = Number(r.actual) || 0;
            const w = p > 0 ? Math.min(100, Math.round((a / p) * 100)) : 0;
            return (
              <div
                key={r.id}
                className="app-section rounded-2xl p-3.5 animate-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-sm">{r.label}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDraft({ ...r })} className="rounded-full app-pill px-3 py-1 text-[11px]">
                      تعديل
                    </button>
                    <button
                      aria-label="حذف"
                      onClick={() => del.mutate(r.id)}
                      className="size-7 grid place-items-center rounded-full app-pill text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${a > p ? "bg-destructive" : "bg-[color:var(--color-primary)]"}`}
                    style={{ width: `${w}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] mt-1.5 text-muted-foreground">
                  <span>المخطط {fmt(p)} ر.س</span>
                  <span className={a > p ? "text-destructive font-bold" : ""}>المصروف {fmt(a)} ر.س</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-4" />
      <BottomNav />
    </Phone>
  );
}
