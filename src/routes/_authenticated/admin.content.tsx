import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import {
  adminGetSiteContent,
  adminSaveFaq,
  adminDeleteFaq,
  adminSaveLegal,
  adminSaveSetting,
} from "@/lib/adminx.functions";
import { AdminShell, Card, Field, inputCls } from "@/components/admin/AdminShell";

const opts = queryOptions({ queryKey: ["admin-site-content"], queryFn: () => adminGetSiteContent() });

export const Route = createFileRoute("/_authenticated/admin/content")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

type Tab = "faq" | "legal" | "settings";

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("faq");
  const [faqDraft, setFaqDraft] = useState<any | null>(null);
  const [legal, setLegal] = useState<Record<string, any>>({});
  const [settings, setSettings] = useState<Record<string, string>>({});

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-site-content"] });
  const onErr = (e: Error) => toast.error(e.message);

  const saveFaq = useMutation({
    mutationFn: (v: any) =>
      adminSaveFaq({
        data: {
          id: v.id,
          question: v.question,
          answer: v.answer ?? "",
          sort_order: Number(v.sort_order ?? 0),
          is_visible: Boolean(v.is_visible ?? true),
        },
      }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setFaqDraft(null);
      invalidate();
    },
    onError: onErr,
  });
  const delFaq = useMutation({
    mutationFn: (id: string) => adminDeleteFaq({ data: { id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      invalidate();
    },
    onError: onErr,
  });
  const saveLegal = useMutation({
    mutationFn: (v: { slug: string; title: string; body: string }) => adminSaveLegal({ data: v }),
    onSuccess: () => {
      toast.success("تم حفظ الصفحة");
      invalidate();
    },
    onError: onErr,
  });
  const saveSetting = useMutation({
    mutationFn: (v: { key: string; value: string; label: string }) => adminSaveSetting({ data: v }),
    onSuccess: () => {
      toast.success("تم حفظ الإعداد");
      invalidate();
    },
    onError: onErr,
  });

  return (
    <AdminShell title="محتوى المنصة">
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { k: "faq", label: "الأسئلة الشائعة" },
            { k: "legal", label: "الصفحات القانونية" },
            { k: "settings", label: "إعدادات التطبيق" },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`rounded-full px-3 py-1.5 text-xs ${tab === t.k ? "gradient-pink text-white font-bold" : "app-pill"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "faq" && (
        <div className="mt-4 space-y-2">
          <button
            onClick={() => setFaqDraft({ question: "", answer: "", sort_order: data.faq.length, is_visible: true })}
            className="rounded-full gradient-pink text-white font-bold px-4 py-2 text-xs flex items-center gap-1"
          >
            <Plus className="size-3.5" /> سؤال جديد
          </button>
          {faqDraft && (
            <Card className="space-y-3">
              <Field label="السؤال">
                <input className={inputCls} value={faqDraft.question} onChange={(e) => setFaqDraft({ ...faqDraft, question: e.target.value })} />
              </Field>
              <Field label="الإجابة">
                <textarea className={inputCls} rows={3} value={faqDraft.answer} onChange={(e) => setFaqDraft({ ...faqDraft, answer: e.target.value })} />
              </Field>
              <Field label="الترتيب">
                <input className={inputCls} type="number" value={faqDraft.sort_order} onChange={(e) => setFaqDraft({ ...faqDraft, sort_order: Number(e.target.value) })} />
              </Field>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={Boolean(faqDraft.is_visible)} onChange={(e) => setFaqDraft({ ...faqDraft, is_visible: e.target.checked })} />
                ظاهر في التطبيق
              </label>
              <div className="flex gap-2">
                <button onClick={() => saveFaq.mutate(faqDraft)} className="rounded-full gradient-pink text-white font-bold px-4 py-2 text-xs">
                  حفظ
                </button>
                <button onClick={() => setFaqDraft(null)} className="rounded-full app-pill px-4 py-2 text-xs">
                  إلغاء
                </button>
              </div>
            </Card>
          )}
          {(data.faq as any[]).map((f) => (
            <Card key={f.id} className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-sm">{f.question}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{f.answer}</p>
              </div>
              <button onClick={() => setFaqDraft({ ...f })} className="rounded-full app-pill px-3 py-1.5 text-xs">
                تعديل
              </button>
              <button
                aria-label="حذف"
                onClick={() => confirm("حذف السؤال؟") && delFaq.mutate(f.id)}
                className="size-8 grid place-items-center rounded-full app-pill text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {tab === "legal" && (
        <div className="mt-4 space-y-3">
          {(data.legal as any[]).map((p) => {
            const v = legal[p.slug] ?? p;
            return (
              <Card key={p.slug} className="space-y-3">
                <Field label={`العنوان (${p.slug})`}>
                  <input className={inputCls} value={v.title} onChange={(e) => setLegal({ ...legal, [p.slug]: { ...v, title: e.target.value } })} />
                </Field>
                <Field label="المحتوى">
                  <textarea className={inputCls} rows={6} value={v.body} onChange={(e) => setLegal({ ...legal, [p.slug]: { ...v, body: e.target.value } })} />
                </Field>
                <button
                  onClick={() => saveLegal.mutate({ slug: p.slug, title: v.title, body: v.body })}
                  className="rounded-full gradient-pink text-white font-bold px-4 py-2 text-xs flex items-center gap-1"
                >
                  <Save className="size-3.5" /> حفظ
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "settings" && (
        <Card className="mt-4 space-y-3">
          {(data.settings as any[]).map((s) => (
            <div key={s.key} className="flex items-end gap-2">
              <Field label={`${s.label || s.key}`}>
                <input
                  className={inputCls}
                  value={settings[s.key] ?? s.value}
                  onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                />
              </Field>
              <button
                onClick={() => saveSetting.mutate({ key: s.key, value: settings[s.key] ?? s.value, label: s.label })}
                className="rounded-full gradient-pink text-white font-bold px-4 py-2 text-xs mb-0.5"
              >
                حفظ
              </button>
            </div>
          ))}
        </Card>
      )}
    </AdminShell>
  );
}
