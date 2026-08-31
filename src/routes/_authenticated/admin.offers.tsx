import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { adminListOffers, adminSaveOffer, adminDeleteOffer } from "@/lib/adminx.functions";
import { adminListVendors } from "@/lib/admin.functions";
import { AdminShell, Card, Field, inputCls } from "@/components/admin/AdminShell";

const opts = queryOptions({ queryKey: ["admin-offers"], queryFn: () => adminListOffers() });
const vendorOpts = queryOptions({ queryKey: ["admin-vendors"], queryFn: () => adminListVendors() });

export const Route = createFileRoute("/_authenticated/admin/offers")({
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(opts), context.queryClient.ensureQueryData(vendorOpts)]),
  component: Page,
});

const today = () => new Date().toISOString().slice(0, 10);

function Page() {
  const { data } = useSuspenseQuery(opts);
  const { data: vendors } = useSuspenseQuery(vendorOpts);
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any | null>(null);

  const save = useMutation({
    mutationFn: (v: any) =>
      adminSaveOffer({
        data: {
          id: v.id,
          vendor_id: v.vendor_id,
          title: v.title,
          description: v.description ?? "",
          discount_percent: Number(v.discount_percent),
          starts_on: v.starts_on || today(),
          ends_on: v.ends_on || null,
          is_active: Boolean(v.is_active),
        },
      }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin-offers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminDeleteOffer({ data: { id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["admin-offers"] });
    },
  });

  return (
    <AdminShell title="العروض والخصومات">
      <button
        onClick={() =>
          setDraft({
            vendor_id: (vendors as any[])[0]?.id ?? "",
            title: "",
            description: "",
            discount_percent: 15,
            starts_on: today(),
            ends_on: "",
            is_active: true,
          })
        }
        className="rounded-full gradient-pink text-white font-bold px-4 py-2 text-xs flex items-center gap-1"
      >
        <Plus className="size-3.5" /> عرض جديد
      </button>

      {draft && (
        <Card className="mt-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="مقدّم الخدمة">
              <select
                className={inputCls}
                value={draft.vendor_id}
                onChange={(e) => setDraft({ ...draft, vendor_id: e.target.value })}
              >
                {(vendors as any[]).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="عنوان العرض">
              <input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field label="نسبة الخصم %">
              <input
                className={inputCls}
                type="number"
                value={draft.discount_percent}
                onChange={(e) => setDraft({ ...draft, discount_percent: Number(e.target.value) })}
              />
            </Field>
            <Field label="يبدأ في">
              <input className={inputCls} type="date" value={draft.starts_on} onChange={(e) => setDraft({ ...draft, starts_on: e.target.value })} />
            </Field>
            <Field label="ينتهي في">
              <input className={inputCls} type="date" value={draft.ends_on ?? ""} onChange={(e) => setDraft({ ...draft, ends_on: e.target.value })} />
            </Field>
            <Field label="الوصف">
              <textarea className={inputCls} rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={Boolean(draft.is_active)} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
            العرض مفعّل
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => save.mutate(draft)}
              disabled={save.isPending || !draft.title.trim()}
              className="rounded-full gradient-pink text-white font-bold px-4 py-2 text-xs disabled:opacity-50"
            >
              حفظ
            </button>
            <button onClick={() => setDraft(null)} className="rounded-full app-pill px-4 py-2 text-xs">
              إلغاء
            </button>
          </div>
        </Card>
      )}

      <div className="mt-4 space-y-2">
        {(data as any[]).map((o) => (
          <Card key={o.id} className="flex items-center gap-3">
            {o.vendors?.image_url && <img src={o.vendors.image_url} alt="" className="size-12 rounded-xl object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm truncate">{o.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {o.vendors?.name} · خصم {o.discount_percent}% · {o.starts_on} → {o.ends_on ?? "بدون نهاية"}
              </p>
            </div>
            <button
              aria-label="تبديل الحالة"
              onClick={() => save.mutate({ ...o, is_active: !o.is_active })}
              className="size-8 grid place-items-center rounded-full app-pill"
            >
              {o.is_active ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 text-muted-foreground" />}
            </button>
            <button onClick={() => setDraft({ ...o })} className="rounded-full app-pill px-3 py-1.5 text-xs">
              تعديل
            </button>
            <button
              aria-label="حذف"
              onClick={() => confirm("حذف العرض؟") && del.mutate(o.id)}
              className="size-8 grid place-items-center rounded-full app-pill text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </Card>
        ))}
        {(data as any[]).length === 0 && <p className="text-sm text-muted-foreground">لا توجد عروض</p>}
      </div>
    </AdminShell>
  );
}
