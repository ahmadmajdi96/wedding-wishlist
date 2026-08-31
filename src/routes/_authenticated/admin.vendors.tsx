import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Search, Images, Package } from "lucide-react";
import {
  adminListVendors,
  adminSaveVendor,
  adminDeleteVendor,
  adminListPackages,
  adminSavePackage,
  adminDeletePackage,
  adminListVendorImages,
  adminAddVendorImage,
  adminDeleteVendorImage,
  adminListCategories,
} from "@/lib/admin.functions";
import { AdminShell, Card, Field, inputCls } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { fmt } from "@/components/app/Shell";

const vendorsOpts = queryOptions({ queryKey: ["admin-vendors"], queryFn: () => adminListVendors() });
const catsOpts = queryOptions({ queryKey: ["admin-categories"], queryFn: () => adminListCategories() });

export const Route = createFileRoute("/_authenticated/admin/vendors")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(vendorsOpts),
      context.queryClient.ensureQueryData(catsOpts),
    ]),
  component: Page,
});

type Form = {
  id?: string;
  name: string;
  city: string;
  category_id: string;
  image_url: string;
  price_from: number;
  description: string;
  capacity: number | null;
  area_m2: number | null;
  parking: number | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_verified: boolean;
};

const EMPTY: Form = {
  name: "",
  city: "",
  category_id: "",
  image_url: "",
  price_from: 0,
  description: "",
  capacity: null,
  area_m2: null,
  parking: null,
  phone: null,
  whatsapp: null,
  address: null,
  is_active: true,
  is_featured: false,
  is_verified: false,
};

function Page() {
  const { data: vendors } = useSuspenseQuery(vendorsOpts);
  const { data: cats } = useSuspenseQuery(catsOpts);
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [manage, setManage] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const save = useMutation({
    mutationFn: (f: Form) => adminSaveVendor({ data: f }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setForm(null);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminDeleteVendor({ data: { id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = vendors.filter(
    (v: any) => v.name.includes(q) || v.city.includes(q) || q === "",
  );

  return (
    <AdminShell title="مقدّمو الخدمات">
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => setForm({ ...EMPTY, category_id: cats[0]?.id ?? "" })}
          className="rounded-full gradient-pink text-white px-4 py-2 text-sm font-bold flex items-center gap-1.5"
        >
          <Plus className="size-4" /> إضافة مزوّد
        </button>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input className={`${inputCls} pr-9`} placeholder="بحث" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {form && (
        <Card className="mt-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="الاسم">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="المدينة">
              <input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="التصنيف">
              <select className={inputCls} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                {cats.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name_ar}</option>
                ))}
              </select>
            </Field>
            <ImageUpload
              label="الصورة الرئيسية"
              folder="vendors"
              value={form.image_url}
              onChange={(u) => setForm({ ...form, image_url: u })}
            />

            <Field label="السعر يبدأ من">
              <input type="number" className={inputCls} value={form.price_from} onChange={(e) => setForm({ ...form, price_from: Number(e.target.value) })} />
            </Field>
            <Field label="الهاتف">
              <input className={inputCls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="واتساب">
              <input className={inputCls} value={form.whatsapp ?? ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </Field>
            <Field label="العنوان">
              <input className={inputCls} value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
            <Field label="السعة">
              <input type="number" className={inputCls} value={form.capacity ?? ""} onChange={(e) => setForm({ ...form, capacity: e.target.value ? Number(e.target.value) : null })} />
            </Field>
            <Field label="المساحة (م²)">
              <input type="number" className={inputCls} value={form.area_m2 ?? ""} onChange={(e) => setForm({ ...form, area_m2: e.target.value ? Number(e.target.value) : null })} />
            </Field>
            <Field label="مواقف">
              <input type="number" className={inputCls} value={form.parking ?? ""} onChange={(e) => setForm({ ...form, parking: e.target.value ? Number(e.target.value) : null })} />
            </Field>
          </div>
          <Field label="الوصف">
            <textarea className={`${inputCls} h-24`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="flex gap-4 mt-3 text-xs">
            {([
              ["is_active", "مفعّل"],
              ["is_featured", "مميّز"],
              ["is_verified", "موثّق"],
            ] as const).map(([k, l]) => (
              <label key={k} className="flex items-center gap-1.5">
                <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />
                {l}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => save.mutate(form)} disabled={save.isPending} className="rounded-full gradient-pink text-white px-5 py-2 text-sm font-bold">
              حفظ
            </button>
            <button onClick={() => setForm(null)} className="rounded-full app-pill px-5 py-2 text-sm">إلغاء</button>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
        {rows.map((v: any) => (
          <Card key={v.id}>
            <div className="flex gap-3">
              <img src={v.image_url} alt="" className="size-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-sm truncate">{v.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {v.categories?.name_ar} · {v.city}
                </p>
                <p className="text-[11px] mt-1 flex items-center gap-2">
                  <span className="text-[color:var(--color-primary)] font-bold">{fmt(v.price_from)} ر.س</span>
                  <span className="flex items-center gap-0.5 text-muted-foreground">
                    <Star className="size-3 fill-current" /> {v.rating} ({v.reviews_count})
                  </span>
                </p>
                <div className="flex gap-1 mt-1 text-[10px]">
                  {!v.is_active && <span className="rounded-full bg-muted px-2 py-0.5">معطّل</span>}
                  {v.is_featured && <span className="rounded-full bg-[color:var(--gold-soft,#F7EBCB)] px-2 py-0.5">مميّز</span>}
                  {v.is_verified && <span className="rounded-full bg-[color:var(--success-soft,#DCF5E4)] px-2 py-0.5">موثّق</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-1 mt-3">
              <button onClick={() => setForm({ ...EMPTY, ...v })} className="flex-1 rounded-full app-pill py-1.5 text-xs flex items-center justify-center gap-1">
                <Pencil className="size-3" /> تعديل
              </button>
              <button onClick={() => setManage(manage === v.id ? null : v.id)} className="flex-1 rounded-full app-pill py-1.5 text-xs flex items-center justify-center gap-1">
                <Package className="size-3" /> الباقات والصور
              </button>
              <button onClick={() => confirm("حذف المزوّد؟") && del.mutate(v.id)} className="rounded-full app-pill px-3 text-destructive">
                <Trash2 className="size-3.5" />
              </button>
            </div>
            {manage === v.id && <VendorExtras vendorId={v.id} />}
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}

function VendorExtras({ vendorId }: { vendorId: string }) {
  const qc = useQueryClient();
  const packages = useQuery({
    queryKey: ["admin-packages", vendorId],
    queryFn: () => adminListPackages({ data: { vendorId } }),
  });
  const images = useQuery({
    queryKey: ["admin-vendor-images", vendorId],
    queryFn: () => adminListVendorImages({ data: { vendorId } }),
  });
  const [pkg, setPkg] = useState({ name: "", price: 0, includes: "" });
  

  const savePkg = useMutation({
    mutationFn: () => adminSavePackage({ data: { vendor_id: vendorId, ...pkg, sort_order: 0 } }),
    onSuccess: () => {
      setPkg({ name: "", price: 0, includes: "" });
      qc.invalidateQueries({ queryKey: ["admin-packages", vendorId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delPkg = useMutation({
    mutationFn: (id: string) => adminDeletePackage({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-packages", vendorId] }),
  });
  const addImg = useMutation({
    mutationFn: (u: string) => adminAddVendorImage({ data: { vendor_id: vendorId, url: u, sort_order: 0 } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vendor-images", vendorId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delImg = useMutation({
    mutationFn: (id: string) => adminDeleteVendorImage({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vendor-images", vendorId] }),
  });

  return (
    <div className="mt-3 border-t border-[color:var(--color-border)] pt-3 space-y-3">
      <div>
        <p className="text-xs font-bold mb-1.5 flex items-center gap-1"><Package className="size-3.5" /> الباقات</p>
        <div className="space-y-1">
          {(packages.data ?? []).map((p: any) => (
            <div key={p.id} className="flex items-center justify-between text-[11px] bg-[color:var(--color-muted)]/60 rounded-lg px-2 py-1.5">
              <span>{p.name} — {fmt(p.price)} ر.س</span>
              <button onClick={() => delPkg.mutate(p.id)} className="text-destructive"><Trash2 className="size-3" /></button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1 mt-2">
          <input className={inputCls} placeholder="اسم الباقة" value={pkg.name} onChange={(e) => setPkg({ ...pkg, name: e.target.value })} />
          <input type="number" className={inputCls} placeholder="السعر" value={pkg.price} onChange={(e) => setPkg({ ...pkg, price: Number(e.target.value) })} />
          <input className={inputCls} placeholder="تشمل" value={pkg.includes} onChange={(e) => setPkg({ ...pkg, includes: e.target.value })} />
        </div>
        <button onClick={() => savePkg.mutate()} disabled={pkg.name.length < 2} className="mt-1.5 rounded-full app-pill px-3 py-1 text-[11px]">إضافة باقة</button>
      </div>

      <div>
        <p className="text-xs font-bold mb-1.5 flex items-center gap-1"><Images className="size-3.5" /> معرض الصور</p>
        <div className="flex gap-1.5 flex-wrap">
          {(images.data ?? []).map((im: any) => (
            <div key={im.id} className="relative">
              <img src={im.url} alt="" className="size-14 rounded-lg object-cover" />
              <button onClick={() => delImg.mutate(im.id)} className="absolute -top-1 -left-1 size-5 rounded-full bg-card border border-[color:var(--color-border)] grid place-items-center text-destructive">
                <Trash2 className="size-2.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <ImageUpload
            label="أضيفي صورة للمعرض"
            folder={`vendors/${vendorId}`}
            value=""
            onChange={(u) => u && addImg.mutate(u)}
          />
        </div>

      </div>
    </div>
  );
}
