import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ChevronRight, MapPin, Star, Heart, Calendar, Phone as PhoneIcon, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getVendor } from "@/lib/catalog.functions";
import { listReviews, upsertMyReview, deleteMyReview } from "@/lib/reviews.functions";
import { listFavorites, toggleFavorite, createBooking } from "@/lib/user.functions";
import { Phone, PrimaryBtn, fmt } from "@/components/app/Shell";


export const Route = createFileRoute("/_authenticated/vendors/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      queryOptions({ queryKey: ["vendor", params.id], queryFn: () => getVendor({ data: { id: params.id } }) }),
    ),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"about" | "packages" | "reviews">("about");
  const [pkgId, setPkgId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);

  const vendor = useSuspenseQuery(
    queryOptions({ queryKey: ["vendor", id], queryFn: () => getVendor({ data: { id } }) }),
  ).data as any;

  const favs = useQuery({ queryKey: ["favorites"], queryFn: () => listFavorites() });
  const isFav = !!favs.data?.some((f: any) => f.vendor_id === id);

  const toggleFavFn = useServerFn(toggleFavorite);
  const createBookingFn = useServerFn(createBooking);

  const toggle = useMutation({
    mutationFn: () => toggleFavFn({ data: { vendorId: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const book = useMutation({
    mutationFn: () => {
      if (!date) throw new Error("اختاري تاريخ");
      const selectedPkg = vendor.vendor_packages?.find((p: any) => p.id === pkgId);
      const total = selectedPkg?.price ?? vendor.price_from;
      return createBookingFn({
        data: { vendor_id: id, package_id: pkgId, event_date: date, total: Number(total) },
      });
    },
    onSuccess: (r) => {
      toast.success("تم إنشاء الحجز");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      nav({ to: "/bookings/$id", params: { id: r.id } });
    },
    onError: (e: any) => toast.error(e.message || "تعذر الحجز"),
  });

  return (
    <Phone>
      <div className="relative h-72">
        <img src={vendor.image_url} className="absolute inset-0 w-full h-full object-cover" alt={vendor.name} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        <button
          onClick={() => nav({ to: ".." as any })}
          className="absolute top-4 right-4 size-9 rounded-full bg-white/90 grid place-items-center"
        >
          <ChevronRight className="size-4" />
        </button>
        <button
          onClick={() => toggle.mutate()}
          className="absolute top-4 left-4 size-9 rounded-full bg-white/90 grid place-items-center"
        >
          <Heart className={`size-4 ${isFav ? "fill-[color:var(--color-primary)] text-[color:var(--color-primary)]" : "text-[color:var(--color-primary)]"}`} />
        </button>
      </div>

      <div className="-mt-6 relative bg-card rounded-t-[2rem] flex-1 px-5 pt-5 pb-32">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-xl">{vendor.name}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="size-3" /> {vendor.city}
            </p>
          </div>
          <span className="text-xs flex items-center gap-1 bg-[color:var(--gold-soft)] rounded-full px-2 py-1">
            <Star className="size-3 fill-current text-[color:var(--color-accent)]" /> <b>{vendor.rating}</b> ({vendor.reviews_count})
          </span>
        </div>

        {(vendor.capacity || vendor.area_m2 || vendor.parking) && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {vendor.area_m2 && (
              <Stat label="المساحة" value={`${vendor.area_m2} م²`} />
            )}
            {vendor.capacity && <Stat label="الضيوف" value={`حتى ${vendor.capacity}`} />}
            {vendor.parking && <Stat label="مواقف" value={`${vendor.parking}`} />}
          </div>
        )}

        <div className="flex gap-2 mt-5 border-b border-border">
          {[
            { id: "about", l: "نبذة" },
            { id: "packages", l: "الباقات" },
            { id: "reviews", l: "التقييمات" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`pb-2 px-1 text-sm font-semibold ${tab === t.id ? "text-[color:var(--color-primary)] border-b-2 border-[color:var(--color-primary)]" : "text-muted-foreground"}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {tab === "about" && (
          <div className="mt-4 text-sm text-muted-foreground leading-relaxed">{vendor.description}</div>
        )}
        {tab === "packages" && (
          <div className="mt-4 space-y-2">
            {(vendor.vendor_packages ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد باقات. السعر الأساسي: {fmt(vendor.price_from)} ر.س</p>
            )}
            {(vendor.vendor_packages ?? []).map((p: any) => (
              <button
                key={p.id}
                onClick={() => setPkgId(p.id)}
                className={`w-full text-right app-section rounded-2xl p-3 ${pkgId === p.id ? "ring-2 ring-[color:var(--color-primary)]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-sm">{p.name}</p>
                  <p className="font-bold text-[color:var(--color-primary)]">{fmt(p.price)} ر.س</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{p.includes}</p>
              </button>
            ))}
          </div>
        )}
        {tab === "reviews" && <ReviewsPanel vendorId={id} />}

        {(vendor.vendor_images ?? []).length > 0 && (
          <div className="mt-6">
            <p className="font-display font-bold text-sm mb-2">معرض الصور</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {vendor.vendor_images.map((im: any) => (
                <img key={im.id} src={im.url} alt={vendor.name} loading="lazy" className="size-28 rounded-2xl object-cover shrink-0" />
              ))}
            </div>
          </div>
        )}

        {(vendor.phone || vendor.whatsapp) && (
          <div className="flex gap-2 mt-6">
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`} className="flex-1 app-pill rounded-full py-2.5 text-center text-sm font-bold flex items-center justify-center gap-1.5">
                <PhoneIcon className="size-4" /> اتصال
              </a>
            )}
            {vendor.whatsapp && (
              <a
                href={`https://wa.me/${String(vendor.whatsapp).replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 app-pill rounded-full py-2.5 text-center text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="size-4" /> واتساب
              </a>
            )}
          </div>
        )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-card border-t border-border p-4">
        {open ? (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">تاريخ الحفل</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="app-pill w-full rounded-2xl px-4 py-3 text-sm bg-transparent outline-none"
            />
            <PrimaryBtn onClick={() => book.mutate()} disabled={book.isPending}>
              {book.isPending ? "جارٍ التأكيد..." : "تأكيد الحجز"}
            </PrimaryBtn>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground">السعر يبدأ من</p>
              <p className="font-display font-bold text-lg text-[color:var(--color-primary)]">
                {fmt(vendor.price_from)} ر.س
              </p>
            </div>
            <button onClick={() => setOpen(true)} className="app-primary-btn rounded-full px-6 py-3 font-display font-bold flex items-center gap-2">
              <Calendar className="size-4" /> احجزي الآن
            </button>
          </div>
        )}
      </div>
    </Phone>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-pill rounded-2xl py-2.5 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-display font-bold text-sm mt-0.5">{value}</p>
    </div>
  );
}

function ReviewsPanel({ vendorId }: { vendorId: string }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const reviews = useQuery({
    queryKey: ["reviews", vendorId],
    queryFn: () => listReviews({ data: { vendorId } }),
  });

  const save = useMutation({
    mutationFn: () => upsertMyReview({ data: { vendor_id: vendorId, rating, comment } }),
    onSuccess: () => {
      toast.success("شكراً لتقييمك");
      setComment("");
      qc.invalidateQueries({ queryKey: ["reviews", vendorId] });
      qc.invalidateQueries({ queryKey: ["vendor", vendorId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteMyReview({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", vendorId] });
      qc.invalidateQueries({ queryKey: ["vendor", vendorId] });
    },
  });

  return (
    <div className="mt-4 space-y-3">
      <div className="app-section rounded-2xl p-3">
        <p className="text-sm font-display font-bold mb-2">شاركينا تجربتك</p>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} نجوم`}>
              <Star className={`size-5 ${n <= rating ? "fill-[color:var(--color-accent)] text-[color:var(--color-accent)]" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتبي رأيك…"
          className="w-full rounded-2xl bg-[color:var(--color-muted)]/70 p-3 text-sm outline-none h-20"
        />
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="mt-2 rounded-full gradient-pink text-white px-5 py-2 text-sm font-bold disabled:opacity-60"
        >
          نشر التقييم
        </button>
      </div>

      {(reviews.data ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد — كوني الأولى!</p>
      )}
      {(reviews.data ?? []).map((r: any) => (
        <div key={r.id} className="app-section rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`size-3.5 ${n <= r.rating ? "fill-[color:var(--color-accent)] text-[color:var(--color-accent)]" : "text-muted-foreground"}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString("ar-EG")}
              </span>
              <button onClick={() => del.mutate(r.id)} className="text-muted-foreground hover:text-destructive" aria-label="حذف">
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
          {r.comment && <p className="text-sm mt-1.5 leading-relaxed">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
}
