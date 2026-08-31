import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { adminGetHomeContent, adminSaveHomeRow, adminDeleteHomeRow } from "@/lib/admin.functions";
import { AdminShell, Card, Field, inputCls } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/admin/ImageUpload";

const opts = queryOptions({ queryKey: ["admin-home"], queryFn: () => adminGetHomeContent() });

export const Route = createFileRoute("/_authenticated/admin/home")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

type Tab = "slides" | "sections" | "testimonials" | "features";
const TABS: { k: Tab; label: string; table: string }[] = [
  { k: "slides", label: "شرائح الواجهة", table: "home_slides" },
  { k: "sections", label: "أقسام الرئيسية", table: "home_sections" },
  { k: "testimonials", label: "آراء العرائس", table: "testimonials" },
  { k: "features", label: "شارات الثقة", table: "home_features" },
];

const BLANK: Record<Tab, any> = {
  slides: { title: "", subtitle: "", cta_label: "", cta_slug: "", image_url: "", sort_order: 0, is_visible: true },
  sections: { key: "", title: "", subtitle: "", body: "", image_url: "", cta_label: "", cta_slug: "", sort_order: 0, is_visible: true },
  testimonials: { name: "", avatar_url: "", rating: 5, quote: "", sort_order: 0, is_visible: true },
  features: { icon: "ShieldCheck", label: "", sort_order: 0, is_visible: true },
};

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("slides");
  const [draft, setDraft] = useState<any | null>(null);

  const table = TABS.find((t) => t.k === tab)!.table;
  const rows: any[] = (data as any)[tab] ?? [];

  const save = useMutation({
    mutationFn: (values: any) => adminSaveHomeRow({ data: { table: table as any, values } }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setDraft(null);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminDeleteHomeRow({ data: { table: table as any, id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editing = draft;

  return (
    <AdminShell title="محتوى الصفحة الرئيسية">
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.k}
            onClick={() => {
              setTab(t.k);
              setDraft(null);
            }}
            className={`rounded-full px-3 py-1.5 text-xs ${tab === t.k ? "gradient-pink text-white font-bold" : "app-pill"}`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setDraft({ ...BLANK[tab] })}
          className="mr-auto rounded-full gradient-pink text-white font-bold px-3 py-1.5 text-xs flex items-center gap-1"
        >
          <Plus className="size-3.5" /> إضافة
        </button>
      </div>

      {editing && (
        <Card className="mt-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            {Object.keys(BLANK[tab]).map((k) => {
              if (k === "is_visible") return null;
              if (k.endsWith("image_url") || k === "avatar_url")
                return (
                  <ImageUpload
                    key={k}
                    label={k === "avatar_url" ? "الصورة الشخصية" : "الصورة"}
                    folder="home"
                    value={editing[k] ?? ""}
                    onChange={(url) => setDraft({ ...editing, [k]: url })}
                  />
                );
              const numeric = k === "sort_order" || k === "rating";
              return (
                <Field key={k} label={LABELS[k] ?? k}>
                  {k === "quote" || k === "body" ? (
                    <textarea
                      className={inputCls}
                      rows={3}
                      value={editing[k] ?? ""}
                      onChange={(e) => setDraft({ ...editing, [k]: e.target.value })}
                    />
                  ) : (
                    <input
                      className={inputCls}
                      type={numeric ? "number" : "text"}
                      value={editing[k] ?? ""}
                      onChange={(e) =>
                        setDraft({ ...editing, [k]: numeric ? Number(e.target.value) : e.target.value })
                      }
                    />
                  )}
                </Field>
              );
            })}
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={Boolean(editing.is_visible)}
              onChange={(e) => setDraft({ ...editing, is_visible: e.target.checked })}
            />
            ظاهر في التطبيق
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => save.mutate(editing)}
              disabled={save.isPending}
              className="rounded-full gradient-pink text-white font-bold px-4 py-2 text-xs flex items-center gap-1"
            >
              <Save className="size-3.5" /> حفظ
            </button>
            <button onClick={() => setDraft(null)} className="rounded-full app-pill px-4 py-2 text-xs">
              إلغاء
            </button>
          </div>
        </Card>
      )}

      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <Card key={r.id} className="flex items-center gap-3">
            {(r.image_url || r.avatar_url) && (
              <img src={r.image_url || r.avatar_url} alt="" className="size-14 rounded-xl object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm truncate">{r.title || r.name || r.label || r.key}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {r.subtitle || r.quote || r.icon || ""} · ترتيب {r.sort_order}
              </p>
            </div>
            <button
              onClick={() => save.mutate({ ...r, is_visible: !r.is_visible })}
              className="size-8 grid place-items-center rounded-full app-pill"
              title={r.is_visible ? "إخفاء" : "إظهار"}
            >
              {r.is_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 text-muted-foreground" />}
            </button>
            <button onClick={() => setDraft({ ...r })} className="rounded-full app-pill px-3 py-1.5 text-xs">
              تعديل
            </button>
            <button
              onClick={() => confirm("حذف العنصر؟") && del.mutate(r.id)}
              className="size-8 grid place-items-center rounded-full app-pill text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">لا توجد عناصر</p>}
      </div>
    </AdminShell>
  );
}

const LABELS: Record<string, string> = {
  title: "العنوان",
  subtitle: "العنوان الفرعي",
  body: "النص",
  cta_label: "نص الزر",
  cta_slug: "رابط التصنيف",
  sort_order: "الترتيب",
  key: "المفتاح",
  name: "الاسم",
  rating: "التقييم",
  quote: "الرأي",
  icon: "الأيقونة",
  label: "النص",
};
