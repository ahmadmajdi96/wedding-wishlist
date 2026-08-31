import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  MapPin,
  Star,
  Heart,
  Calendar,
  Phone as PhoneIcon,
  MessageCircle,
  Trash2,
  BadgeCheck,
  Sparkles,
  Share2,
  X,
  Check,
  Users,
  Ruler,
  Car,
  ShieldCheck,
  Clock,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { getVendor, listVendors } from "@/lib/catalog.functions";
import { listReviews, upsertMyReview, deleteMyReview } from "@/lib/reviews.functions";
import { listFavorites, toggleFavorite, createBooking } from "@/lib/user.functions";
import { Phone, fmt } from "@/components/app/Shell";

export const Route = createFileRoute("/_authenticated/vendors/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      queryOptions({ queryKey: ["vendor", params.id], queryFn: () => getVendor({ data: { id: params.id } }) }),
    ),
  component: Page,
  head: () => ({
    meta: [
      { title: "تفاصيل مقدّم الخدمة | يلا نجهّز" },
      { name: "description", content: "استعرضي الباقات والصور والتقييمات واحجزي مقدّم خدمات فرحك مباشرة من تطبيق يلا نجهّز." },
      { property: "og:title", content: "تفاصيل مقدّم الخدمة | يلا نجهّز" },
      { property: "og:description", content: "باقات وأسعار وصور وتقييمات حقيقية لمقدّمي خدمات الأفراح." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Page() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"about" | "packages" | "reviews">("about");
  const [pkgId, setPkgId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const vendor = useSuspenseQuery(
    queryOptions({ queryKey: ["vendor", id], queryFn: () => getVendor({ data: { id } }) }),
  ).data as any;

  const shots: string[] = useMemo(() => {
    const gallery = (vendor.vendor_images ?? []).map((im: any) => im.url as string);
    return [vendor.image_url, ...gallery].filter(Boolean).slice(0, 6);
  }, [vendor]);

  useEffect(() => {
    if (shots.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % shots.length), 4200);
    return () => clearInterval(t);
  }, [shots.length]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 190);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const favs = useQuery({ queryKey: ["favorites"], queryFn: () => listFavorites() });
  const isFav = !!favs.data?.some((f: any) => f.vendor_id === id);

  const categorySlug = vendor.categories?.slug as string | undefined;
  const similar = useQuery({
    queryKey: ["similar", categorySlug],
    queryFn: () => listVendors({ data: { categorySlug } }),
    enabled: !!categorySlug,
  });

  const toggleFavFn = useServerFn(toggleFavorite);
  const createBookingFn = useServerFn(createBooking);

  const toggle = useMutation({
    mutationFn: () => toggleFavFn({ data: { vendorId: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(isFav ? "تمت الإزالة من المفضلة" : "أُضيف إلى المفضلة");
    },
  });

  const selectedPkg = (vendor.vendor_packages ?? []).find((p: any) => p.id === pkgId);
  const total = Number(selectedPkg?.price ?? vendor.price_from);

  const book = useMutation({
    mutationFn: () => {
      if (!date) throw new Error("اختاري تاريخ الحفل أولاً");
      return createBookingFn({
        data: { vendor_id: id, package_id: pkgId, event_date: date, total },
      });
    },
    onSuccess: (r) => {
      toast.success("تم إنشاء الحجز بنجاح");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      nav({ to: "/bookings/$id", params: { id: r.id } });
    },
    onError: (e: any) => toast.error(e.message || "تعذر الحجز"),
  });

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: vendor.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("تم نسخ الرابط");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <Phone className="pb-0">
      {/* Sticky glass header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 mx-auto max-w-[480px] transition-all duration-300 ${
          scrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-3 bg-card/85 backdrop-blur-xl border-b border-border">
          <button onClick={() => nav({ to: ".." as any })} className="size-9 rounded-full app-pill grid place-items-center">
            <ChevronRight className="size-4" />
          </button>
          <p className="font-display font-bold text-sm truncate flex-1">{vendor.name}</p>
          <button onClick={() => toggle.mutate()} className="size-9 rounded-full app-pill grid place-items-center">
            <Heart className={`size-4 ${isFav ? "fill-[color:var(--color-primary)] text-[color:var(--color-primary)]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Hero carousel */}
      <div className="relative h-[24rem] overflow-hidden">
        {shots.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`${vendor.name} - صورة ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-out ${
              i === slide ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/65" />

        <div className="absolute top-4 inset-x-4 flex items-center justify-between">
          <button
            onClick={() => nav({ to: ".." as any })}
            className="size-10 rounded-full bg-white/25 backdrop-blur-md border border-white/40 grid place-items-center hover:scale-105 transition"
            aria-label="رجوع"
          >
            <ChevronRight className="size-4 text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={share}
              className="size-10 rounded-full bg-white/25 backdrop-blur-md border border-white/40 grid place-items-center hover:scale-105 transition"
              aria-label="مشاركة"
            >
              <Share2 className="size-4 text-white" />
            </button>
            <button
              onClick={() => toggle.mutate()}
              className="size-10 rounded-full bg-white/25 backdrop-blur-md border border-white/40 grid place-items-center hover:scale-105 transition"
              aria-label="المفضلة"
            >
              <Heart className={`size-4 transition ${isFav ? "fill-white text-white scale-110" : "text-white"}`} />
            </button>
          </div>
        </div>

        {/* badges */}
        <div className="absolute bottom-16 right-5 flex flex-wrap gap-2 animate-slide-up">
          {vendor.is_verified && (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[color:var(--color-primary)]">
              <BadgeCheck className="size-3.5" /> موثّق
            </span>
          )}
          {vendor.is_featured && (
            <span className="flex items-center gap-1 rounded-full gradient-pink px-3 py-1 text-[11px] font-bold text-white">
              <Sparkles className="size-3.5" /> مميّز
            </span>
          )}
          {vendor.categories?.name_ar && (
            <span className="rounded-full bg-[color:var(--color-navy)]/70 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white">
              {vendor.categories.name_ar}
            </span>
          )}
        </div>

        {shots.length > 1 && (
          <div className="absolute bottom-9 inset-x-0 flex justify-center gap-1.5">
            {shots.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`صورة ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="-mt-7 relative bg-card rounded-t-[2.25rem] flex-1 px-5 pt-6 pb-40 shadow-[0_-20px_40px_-30px_rgb(35_54_96/0.4)]">
        <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-border" />

        <div className="flex items-start justify-between gap-3 animate-slide-up">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-2xl leading-snug">{vendor.name}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="size-3.5" /> {vendor.address || vendor.city}
            </p>
          </div>
          <div className="shrink-0 text-center rounded-2xl bg-[color:var(--gold-soft)] px-3 py-2">
            <div className="flex items-center gap-1 justify-center">
              <Star className="size-3.5 fill-current text-[color:var(--color-accent)]" />
              <b className="text-sm">{Number(vendor.rating).toFixed(1)}</b>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{fmt(vendor.reviews_count)} تقييم</p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-4 grid grid-cols-3 gap-2 animate-slide-up stagger-1">
          <Trust icon={ShieldCheck} label="حجز آمن" />
          <Trust icon={Clock} label="رد سريع" />
          <Trust icon={CreditCard} label="دفع مرن" />
        </div>

        {(vendor.capacity || vendor.area_m2 || vendor.parking) && (
          <div className="grid grid-cols-3 gap-2 mt-3 animate-slide-up stagger-2">
            {vendor.area_m2 && <Stat icon={Ruler} label="المساحة" value={`${vendor.area_m2} م²`} />}
            {vendor.capacity && <Stat icon={Users} label="الضيوف" value={`حتى ${vendor.capacity}`} />}
            {vendor.parking && <Stat icon={Car} label="مواقف" value={`${vendor.parking}`} />}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6 grid grid-cols-3 gap-1 rounded-full bg-[color:var(--color-muted)]/70 p-1 animate-slide-up stagger-3">
          {[
            { id: "about", l: "نبذة" },
            { id: "packages", l: "الباقات" },
            { id: "reviews", l: "التقييمات" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`rounded-full py-2 text-sm font-display font-bold transition-all duration-300 ${
                tab === t.id
                  ? "gradient-pink text-white shadow-[0_10px_20px_-12px_rgb(244_123_165/0.9)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>

        <div key={tab} className="animate-fade-soft">
          {tab === "about" && (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-loose">{vendor.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {["تنسيق كامل", "فريق محترف", "باقات مرنة", "تغطية كل المدن"].map((f) => (
                  <div key={f} className="app-section rounded-2xl px-3 py-2.5 flex items-center gap-2">
                    <span className="size-6 rounded-full gradient-pink grid place-items-center">
                      <Check className="size-3.5 text-white" />
                    </span>
                    <span className="text-xs font-semibold">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "packages" && (
            <div className="mt-5 space-y-3">
              {(vendor.vendor_packages ?? []).length === 0 && (
                <div className="app-section rounded-3xl p-5 text-center">
                  <p className="text-sm text-muted-foreground">لا توجد باقات محددة</p>
                  <p className="font-display font-bold text-lg mt-1 text-[color:var(--color-primary)]">
                    {fmt(vendor.price_from)} ر.س
                  </p>
                </div>
              )}
              {(vendor.vendor_packages ?? []).map((p: any, i: number) => {
                const active = pkgId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPkgId(active ? null : p.id)}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className={`animate-slide-up w-full text-right rounded-3xl p-4 transition-all duration-300 ${
                      active
                        ? "gradient-cream border-2 border-[color:var(--color-primary)] shadow-[0_18px_40px_-24px_rgb(244_123_165/0.7)] -translate-y-0.5"
                        : "app-section hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-5 rounded-full grid place-items-center border transition ${
                            active ? "gradient-pink border-transparent" : "border-border"
                          }`}
                        >
                          {active && <Check className="size-3 text-white" />}
                        </span>
                        <p className="font-display font-bold text-sm">{p.name}</p>
                      </div>
                      <p className="font-display font-bold text-[color:var(--color-primary)]">{fmt(p.price)} ر.س</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed pr-7">{p.includes}</p>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "reviews" && <ReviewsPanel vendorId={id} rating={Number(vendor.rating)} count={vendor.reviews_count} />}
        </div>

        {/* Gallery */}
        {(vendor.vendor_images ?? []).length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold text-base">معرض الأعمال</p>
              <span className="text-[11px] text-muted-foreground">{vendor.vendor_images.length} صورة</span>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-2">
              {vendor.vendor_images.map((im: any, i: number) => (
                <button
                  key={im.id}
                  onClick={() => setLightbox(im.url)}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="animate-slide-up relative shrink-0 overflow-hidden rounded-3xl group"
                >
                  <img
                    src={im.url}
                    alt={`${vendor.name} عمل ${i + 1}`}
                    loading="lazy"
                    className="h-36 w-32 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {(vendor.phone || vendor.whatsapp) && (
          <div className="mt-7">
            <p className="font-display font-bold text-base mb-3">تواصلي مباشرة</p>
            <div className="flex gap-3">
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="flex-1 app-pill rounded-2xl py-3 text-center text-sm font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition"
                >
                  <PhoneIcon className="size-4 text-[color:var(--color-primary)]" /> اتصال
                </a>
              )}
              {vendor.whatsapp && (
                <a
                  href={`https://wa.me/${String(vendor.whatsapp).replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 app-pill rounded-2xl py-3 text-center text-sm font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition"
                >
                  <MessageCircle className="size-4 text-[color:var(--color-primary)]" /> واتساب
                </a>
              )}
            </div>
          </div>
        )}

        {/* Similar vendors */}
        {(similar.data ?? []).filter((v: any) => v.id !== id).length > 0 && (
          <div className="mt-8">
            <p className="font-display font-bold text-base mb-3">قد يعجبكِ أيضاً</p>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-2">
              {(similar.data ?? [])
                .filter((v: any) => v.id !== id)
                .slice(0, 8)
                .map((v: any) => (
                  <Link
                    key={v.id}
                    to="/vendors/$id"
                    params={{ id: v.id }}
                    className="shrink-0 w-40 app-section rounded-3xl overflow-hidden hover:-translate-y-1 transition duration-300"
                  >
                    <img src={v.image_url} alt={v.name} loading="lazy" className="h-24 w-full object-cover" />
                    <div className="p-2.5">
                      <p className="font-display font-bold text-xs truncate">{v.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{v.city}</span>
                        <span className="text-[10px] font-bold text-[color:var(--color-primary)]">
                          {fmt(v.price_from)} ر.س
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-40 bg-card/95 backdrop-blur-xl border-t border-border px-4 pt-3 pb-4 rounded-t-[1.75rem] shadow-[0_-18px_40px_-28px_rgb(35_54_96/0.5)]">
        {open ? (
          <div className="space-y-3 animate-slide-up">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-sm">تفاصيل الحجز</p>
              <button onClick={() => setOpen(false)} aria-label="إغلاق" className="size-8 rounded-full app-pill grid place-items-center">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[color:var(--color-muted)]/60 px-4 py-2.5">
              <span className="text-xs text-muted-foreground">{selectedPkg ? selectedPkg.name : "السعر الأساسي"}</span>
              <span className="font-display font-bold text-sm text-[color:var(--color-primary)]">{fmt(total)} ر.س</span>
            </div>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="app-pill w-full rounded-2xl px-4 py-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-[color:var(--color-ring)]"
            />
            <button
              onClick={() => book.mutate()}
              disabled={book.isPending}
              className="app-primary-btn w-full rounded-full py-3.5 font-display font-bold text-base disabled:opacity-60"
            >
              {book.isPending ? "جارٍ التأكيد..." : "تأكيد الحجز"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground">{selectedPkg ? selectedPkg.name : "السعر يبدأ من"}</p>
              <p className="font-display font-bold text-xl text-[color:var(--color-primary)]">{fmt(total)} ر.س</p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="app-primary-btn animate-glow rounded-full px-7 py-3.5 font-display font-bold flex items-center gap-2"
            >
              <Calendar className="size-4" /> احجزي الآن
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm grid place-items-center p-6 animate-fade-soft"
        >
          <img src={lightbox} alt={vendor.name} className="max-h-[80vh] w-auto rounded-3xl object-contain" />
          <button className="absolute top-6 left-6 size-10 rounded-full bg-white/20 grid place-items-center" aria-label="إغلاق">
            <X className="size-5 text-white" />
          </button>
        </div>
      )}
    </Phone>
  );
}

function Trust({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="app-pill rounded-2xl py-2 flex items-center justify-center gap-1.5">
      <Icon className="size-3.5 text-[color:var(--color-primary)]" />
      <span className="text-[11px] font-semibold">{label}</span>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="app-section rounded-2xl py-3 text-center">
      <Icon className="size-4 mx-auto text-[color:var(--color-accent)]" />
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
      <p className="font-display font-bold text-sm mt-0.5">{value}</p>
    </div>
  );
}

function ReviewsPanel({ vendorId, rating, count }: { vendorId: string; rating: number; count: number }) {
  const qc = useQueryClient();
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const reviews = useQuery({
    queryKey: ["reviews", vendorId],
    queryFn: () => listReviews({ data: { vendorId } }),
  });

  const dist = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    (reviews.data ?? []).forEach((r: any) => {
      d[5 - r.rating] = (d[5 - r.rating] ?? 0) + 1;
    });
    return d;
  }, [reviews.data]);
  const totalReviews = (reviews.data ?? []).length || count || 0;

  const save = useMutation({
    mutationFn: () => upsertMyReview({ data: { vendor_id: vendorId, rating: stars, comment } }),
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
    <div className="mt-5 space-y-4">
      {/* summary */}
      <div className="app-section rounded-3xl p-4 flex items-center gap-4 animate-slide-up">
        <div className="text-center shrink-0">
          <p className="font-display font-bold text-3xl gold-text">{Number(rating || 0).toFixed(1)}</p>
          <div className="flex gap-0.5 justify-center mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`size-3 ${n <= Math.round(rating) ? "fill-[color:var(--color-accent)] text-[color:var(--color-accent)]" : "text-muted-foreground"}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{fmt(totalReviews)} تقييم</p>
        </div>
        <div className="flex-1 space-y-1">
          {dist.map((n, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] w-3 text-muted-foreground">{5 - i}</span>
              <div className="h-1.5 flex-1 rounded-full bg-[color:var(--color-muted)] overflow-hidden">
                <div
                  className="h-full rounded-full gradient-pink transition-all duration-700"
                  style={{ width: `${totalReviews ? (n / totalReviews) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="gradient-cream rounded-3xl p-4 border border-border">
        <p className="text-sm font-display font-bold mb-2">شاركينا تجربتك</p>
        <div className="flex gap-1 mb-3" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} نجوم`}>
              <Star
                className={`size-6 transition-transform duration-200 hover:scale-125 ${
                  n <= (hover || stars)
                    ? "fill-[color:var(--color-accent)] text-[color:var(--color-accent)]"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتبي رأيك…"
          className="w-full rounded-2xl bg-card/80 border border-border p-3 text-sm outline-none h-20 focus:ring-2 focus:ring-[color:var(--color-ring)]"
        />
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="mt-2 rounded-full gradient-pink text-white px-6 py-2.5 text-sm font-bold disabled:opacity-60 hover:-translate-y-0.5 transition"
        >
          نشر التقييم
        </button>
      </div>

      {(reviews.data ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">لا توجد تقييمات بعد — كوني الأولى!</p>
      )}
      {(reviews.data ?? []).map((r: any, i: number) => (
        <div key={r.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-slide-up app-section rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`size-3.5 ${n <= r.rating ? "fill-[color:var(--color-accent)] text-[color:var(--color-accent)]" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-EG")}</span>
              <button onClick={() => del.mutate(r.id)} className="text-muted-foreground hover:text-destructive" aria-label="حذف">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
          {r.comment && <p className="text-sm mt-2 leading-relaxed">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
}
