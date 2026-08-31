import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  adminListCategories,
  adminSaveCategory,
  adminDeleteCategory,
} from "@/lib/admin.functions";
import { AdminShell, Card, Field, inputCls } from "@/components/admin/AdminShell";

const opts = queryOptions({ queryKey: ["admin-categories"], queryFn: () => adminListCategories() });

export const Route = createFileRoute("/_authenticated/admin/categories")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

type Form = { id?: string; slug: string; name_ar: string; icon: string; sort_order: number };
const EMPTY: Form = { slug: "", name_ar: "", icon: "sparkles", sort_order: 0 };

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);

  const save = useMutation({
    mutationFn: (f: Form) => adminSaveCategory({ data: f }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setForm(null);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminDeleteCategory({ data: { id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="التصنيفات">
      <button
        onClick={() => setForm({ ...EMPTY, sort_order: data.length })}
        className="rounded-full gradient-pink text-white px-4 py-2 text-sm font-bold flex items-center gap-1.5"
      >
        <Plus className="size-4" /> تصنيف جديد
      </button>

      {form && (
        <Card className="mt-4">
          <div className="grid md:grid-cols-4 gap-3">
            <Field label="الاسم بالعربية">
              <input className={inputCls} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
            </Field>
            <Field label="المعرّف (slug)">
              <input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            <Field label="الأيقونة">
              <input className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </Field>
            <Field label="الترتيب">
              <input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => save.mutate(form)} disabled={save.isPending} className="rounded-full gradient-pink text-white px-5 py-2 text-sm font-bold">
              حفظ
            </button>
            <button onClick={() => setForm(null)} className="rounded-full app-pill px-5 py-2 text-sm">
              إلغاء
            </button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {data.map((c: any) => (
          <Card key={c.id} className="flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-sm">{c.name_ar}</p>
              <p className="text-[11px] text-muted-foreground">{c.slug} · ترتيب {c.sort_order}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setForm(c)} className="size-8 grid place-items-center rounded-full app-pill">
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => confirm("حذف التصنيف؟") && del.mutate(c.id)}
                className="size-8 grid place-items-center rounded-full app-pill text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
