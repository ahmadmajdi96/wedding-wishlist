import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Bell, Search, MapPin, Star, Building2, Sparkles, Camera, Gift, Gem, Heart, Car, Mail,
  Flower2, Music, Cake, PartyPopper, ChevronLeft, Crown, ShieldCheck, Headphones, Calendar,
} from "lucide-react";
import { listCategories, listVendors } from "@/lib/catalog.functions";
import { getMyProfile } from "@/lib/user.functions";
import { BottomNav, BrandLogo, Phone, fmt } from "@/components/app/Shell";

const ICONS: Record<string, any> = {
  Building2, Sparkles, Camera, Gift, Gem, Heart, Car, Mail, Flower2, Music, Cake, PartyPopper,
};

const catsOpts = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });
const topVendorsOpts = queryOptions({ queryKey: ["vendors", "top"], queryFn: () => listVendors({ data: {} }) });
const meOpts = queryOptions({ queryKey: ["me"], queryFn: () => getMyProfile() });

export const Route = createFileRoute("/_authenticated/home")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(catsOpts),
      context.queryClient.ensureQueryData(topVendorsOpts),
      context.queryClient.ensureQueryData(meOpts),
    ]),
  component: HomePage,
});

const HERO_SLIDES = [
  {
    title: "احجزي قاعتكِ المثالية ليوم لا يُنسى",
    sub: "أرقى قاعات الأفراح بعروض حصرية",
    cta: "اكتشفي القاعات",
    slug: "halls",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
  },
  {
    title: "كوش وديكور بأنامل فنانين",
    sub: "تصاميم رومانسية بالورد الطبيعي",
    cta: "تصفّحي الكوش",
    slug: "decor",
    img: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1600&q=80",
  },
  {
    title: "تصوير سينمائي لذكرياتكِ",
    sub: "خصم 20٪ على باقات التصوير هذا الشهر",
    cta: "احجزي مصوّر",
    slug: "photo",
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&q=80",
  },
];

function HomePage() {
  const nav = useNavigate();
  const { data: cats } = useSuspenseQuery(catsOpts);
  const { data: vendors } = useSuspenseQuery(topVendorsOpts);
  const { data: me } = useSuspenseQuery(meOpts);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (me && !me.onboarding_completed) nav({ to: "/onboarding", replace: true });
  }, [me, nav]);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const featured = vendors.slice(0, 6);
  const popular = vendors.slice(0, 8);
  const newArrivals = vendors.slice().reverse().slice(0, 4);

  return (
    <Phone>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between animate-fade-soft">
        <Link to="/notifications" className="relative size-11 rounded-2xl app-pill grid place-items-center">
          <Bell className="size-[18px] text-[color:var(--color-primary)]" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[color:var(--color-primary)] animate-glow" />
        </Link>
        <div className="flex items-center gap-2">
          <BrandLogo size={42} />
          <div className="leading-tight">
            <p className="text-[10px] text-muted-foreground">أهلاً بكِ</p>
            <p className="font-display font-bold text-sm">{me?.full_name || "عروسنا الجميلة"}</p>
          </div>
        </div>
        <div className="app-pill rounded-2xl px-3 py-2 flex items-center gap-1 text-xs">
          <MapPin className="size-3.5 text-[color:var(--color-primary)]" />
          <span className="font-semibold">{me?.city || "الرياض"}</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4 animate-slide-up">
        <Link to="/categories" className="app-pill rounded-2xl flex items-center gap-3 px-4 py-3.5">
          <Search className="size-[18px] text-[color:var(--color-primary)]" />
          <span className="flex-1 text-sm text-muted-foreground">ابحثي عن قاعة، مصور، خدمة...</span>
          <span className="text-[10px] bg-[color:var(--color-soft-rose)] text-[color:var(--color-primary)] font-bold rounded-full px-2 py-1">جديد</span>
        </Link>
      </div>

      {/* Hero carousel */}
      <div className="px-5 animate-slide-up stagger-1">
        <div className="relative rounded-[28px] overflow-hidden h-52 shadow-gold">
          {HERO_SLIDES.map((s, i) => (
            <div
              key={s.slug}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: slide === i ? 1 : 0 }}
            >
              <img src={s.img} className="absolute inset-0 w-full h-full object-cover" alt={s.title} />
              <div className="absolute inset-0 bg-gradient-to-tl from-black/75 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <p className="text-[11px] opacity-90 flex items-center gap-1.5">
                  <Crown className="size-3" /> {s.sub}
                </p>
                <h3 className="font-display font-bold text-xl leading-snug mt-1 max-w-[80%]">{s.title}</h3>
                <Link
                  to="/categories/$slug"
                  params={{ slug: s.slug }}
                  className="mt-3 inline-flex items-center gap-1 w-fit bg-white text-[color:var(--color-primary)] text-xs font-bold rounded-full px-4 py-2"
                >
                  {s.cta} <ChevronLeft className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
          <div className="absolute bottom-3 right-5 flex gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${slide === i ? "w-6 bg-white" : "w-1.5 bg-white/60"}`}
                aria-label={`عرض ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Categories grid (4x3) */}
      <div className="px-5 mt-6 animate-slide-up stagger-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-base">التصنيفات</h3>
          <Link to="/categories" className="text-[11px] text-[color:var(--color-primary)] font-bold flex items-center gap-0.5">
            عرض الكل <ChevronLeft className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {cats.slice(0, 8).map((c, i) => {
            const Icon = ICONS[c.icon] ?? Building2;
            return (
              <Link
                key={c.id}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className={`flex flex-col items-center gap-1.5 animate-slide-up stagger-${(i % 5) + 1}`}
              >
                <span className="size-16 rounded-2xl grid place-items-center app-icon-chip">
                  <Icon className="size-6 text-[color:var(--color-primary)]" />
                </span>
                <span className="text-[11px] font-semibold text-center leading-tight">{c.name_ar}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Promo banner: gold/navy */}
      <div className="px-5 mt-6 animate-slide-up stagger-3">
        <div className="relative rounded-3xl overflow-hidden gradient-navy p-5 text-white">
          <div className="absolute -top-6 -left-6 size-32 rounded-full bg-[color:var(--color-gold)]/20 blur-2xl" />
          <div className="absolute -bottom-8 right-0 size-40 rounded-full bg-[color:var(--color-primary)]/30 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="gold-text font-display font-bold text-xs tracking-wider">باقة العروس الذهبية</p>
              <h3 className="font-display font-bold text-lg mt-1 leading-tight">احصلي على خصم 25٪ على باقات التجهيز الكامل</h3>
              <button className="mt-3 bg-white text-[color:var(--color-navy)] text-xs font-bold rounded-full px-4 py-2 inline-flex items-center gap-1">
                اطلبي الباقة <ChevronLeft className="size-3.5" />
              </button>
            </div>
            <div className="shrink-0 size-20 rounded-2xl bg-white/10 grid place-items-center animate-float border border-white/20">
              <Crown className="size-9 text-[color:var(--color-gold)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured horizontal */}
      <div className="mt-6 animate-slide-up stagger-4">
        <div className="flex items-center justify-between px-5 mb-3">
          <div>
            <h3 className="font-display font-bold text-base">مميزون لكِ</h3>
            <p className="text-[11px] text-muted-foreground">اخترناهم بعناية حسب ذوقكِ</p>
          </div>
          <Link to="/categories" className="text-[11px] text-[color:var(--color-primary)] font-bold flex items-center gap-0.5">
            الكل <ChevronLeft className="size-3" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 hide-scrollbar snap-x">
          {featured.map((v: any) => (
            <Link
              key={v.id}
              to="/vendors/$id"
              params={{ id: v.id }}
              className="snap-start shrink-0 w-[230px] app-section rounded-3xl overflow-hidden"
            >
              <div className="relative h-32">
                <img src={v.image_url} className="w-full h-full object-cover" alt={v.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <span className="absolute top-2 right-2 bg-white/95 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                  <Star className="size-3 text-[color:var(--color-accent)] fill-current" /> {v.rating}
                </span>
                <button className="absolute top-2 left-2 size-7 rounded-full bg-white/95 grid place-items-center">
                  <Heart className="size-3.5 text-[color:var(--color-primary)]" />
                </button>
                <span className="absolute bottom-2 right-2 text-[10px] bg-[color:var(--color-primary)] text-white rounded-full px-2 py-0.5 font-bold">
                  {v.categories?.name_ar}
                </span>
              </div>
              <div className="p-3">
                <p className="font-display font-bold text-sm truncate">{v.name}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3" /> {v.city}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">يبدأ من</span>
                  <span className="text-sm font-display font-bold text-[color:var(--color-primary)]">{fmt(v.price_from)} ر.س</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular grid */}
      <div className="px-5 mt-6 animate-slide-up stagger-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-base">الأكثر طلباً</h3>
          <Link to="/categories" className="text-[11px] text-[color:var(--color-primary)] font-bold flex items-center gap-0.5">
            عرض الكل <ChevronLeft className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {popular.slice(0, 4).map((v: any) => (
            <Link key={v.id} to="/vendors/$id" params={{ id: v.id }} className="app-section rounded-2xl overflow-hidden text-right">
              <div className="relative h-28">
                <img src={v.image_url} className="w-full h-full object-cover" alt={v.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute top-2 right-2 bg-white/95 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                  <Star className="size-3 text-[color:var(--color-accent)] fill-current" /> {v.rating}
                </span>
              </div>
              <div className="p-2.5">
                <p className="font-display font-bold text-sm truncate">{v.name}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3" /> {v.city}
                </p>
                <p className="text-xs font-bold text-[color:var(--color-primary)] mt-1.5">{fmt(v.price_from)} ر.س</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Wedding plan widget */}
      <div className="px-5 mt-6 animate-slide-up">
        <Link to="/plan" className="block">
          <div className="relative gradient-cream rounded-3xl p-5 overflow-hidden border border-[color:var(--color-border)]/60">
            <div className="absolute -right-6 -bottom-6 size-28 rounded-full bg-[color:var(--color-primary)]/20 blur-2xl" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] gold-text font-bold tracking-wider">خطة فرحكِ</p>
                <h3 className="font-display font-bold text-lg mt-1">عدّاد العد التنازلي</h3>
                <p className="text-xs text-muted-foreground mt-1">تابعي مهامكِ، ميزانيتكِ، وموعدكِ المنتظر</p>
              </div>
              <div className="shrink-0 grid place-items-center size-14 rounded-2xl bg-white shadow-gold">
                <Calendar className="size-6 text-[color:var(--color-primary)]" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[{ n: 84, l: "يوم" }, { n: 12, l: "ساعة" }, { n: 32, l: "دقيقة" }].map((b) => (
                <div key={b.l} className="bg-white/80 backdrop-blur rounded-2xl py-2">
                  <p className="font-display font-bold text-lg text-[color:var(--color-primary)]">{b.n}</p>
                  <p className="text-[10px] text-muted-foreground">{b.l}</p>
                </div>
              ))}
            </div>
          </div>
        </Link>
      </div>

      {/* New arrivals */}
      <div className="mt-6 animate-slide-up">
        <div className="flex items-center justify-between px-5 mb-3">
          <h3 className="font-display font-bold text-base">وصل حديثاً</h3>
          <span className="text-[10px] bg-[color:var(--color-soft-rose)] text-[color:var(--color-primary)] font-bold rounded-full px-2 py-1">جديد</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 hide-scrollbar snap-x">
          {newArrivals.map((v: any) => (
            <Link key={v.id} to="/vendors/$id" params={{ id: v.id }} className="snap-start shrink-0 w-[160px]">
              <div className="relative h-44 rounded-3xl overflow-hidden shadow-gold">
                <img src={v.image_url} className="w-full h-full object-cover" alt={v.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                  <p className="font-display font-bold text-sm leading-tight truncate">{v.name}</p>
                  <p className="text-[10px] opacity-90 mt-0.5">{v.city}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="px-5 mt-6 animate-slide-up">
        <h3 className="font-display font-bold text-base mb-3">قالوا عنّا</h3>
        <div className="app-section rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80" alt="" className="size-12 rounded-full object-cover" />
            <div className="flex-1">
              <p className="font-display font-bold text-sm">سارة المطيري</p>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-[color:var(--color-accent)] text-[color:var(--color-accent)]" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            "يلا نجهّز خلّى كل تفاصيل فرحي سهلة ومنظمة. لقيت كل اللي أحتاجه بمكان واحد وبأسعار ممتازة!"
          </p>
        </div>
      </div>

      {/* Trust strip */}
      <div className="px-5 mt-6 mb-2 grid grid-cols-3 gap-2 animate-slide-up">
        {[
          { Icon: ShieldCheck, t: "مزوّدون موثوقون" },
          { Icon: Headphones, t: "دعم 24/7" },
          { Icon: Crown, t: "أسعار حصرية" },
        ].map(({ Icon, t }) => (
          <div key={t} className="app-pill rounded-2xl p-3 text-center">
            <Icon className="size-5 text-[color:var(--color-primary)] mx-auto" />
            <p className="text-[10px] font-bold mt-1.5">{t}</p>
          </div>
        ))}
      </div>

      <div className="h-4" />
      <BottomNav />
    </Phone>
  );
}
