import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { MapPin, Star, Heart, SlidersHorizontal, Search, ChevronLeft } from "lucide-react";
import { listVendors, listCategories } from "@/lib/catalog.functions";
import { BottomNav, Phone, TopBar, fmt } from "@/components/app/Shell";

const COVERS: Record<string, string> = {
  halls: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80",
  dresses: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=1400&q=80",
  photo: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1400&q=80",
  catering: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80",
  jewelry: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&q=80",
  beauty: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80",
  cars: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=80",
  invites: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1400&q=80",
  decor: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1400&q=80",
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400&q=80",
  cake: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1400&q=80",
  gifts: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1400&q=80",
};

export const Route = createFileRoute("/_authenticated/categories/$slug")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        queryOptions({
          queryKey: ["vendors", params.slug],
          queryFn: () => listVendors({ data: { categorySlug: params.slug } }),
        }),
      ),
      context.queryClient.ensureQueryData(
        queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() }),
      ),
    ]),
  component: Page,
});

const SORTS = [
  { id: "rating", l: "الأعلى تقييماً" },
  { id: "price_asc", l: "السعر الأقل" },
  { id: "price_desc", l: "السعر الأعلى" },
  { id: "reviews", l: "الأكثر طلباً" },
] as const;

function Page() {
  const { slug } = Route.useParams();
  const { data: vendors } = useSuspenseQuery(
    queryOptions({ queryKey: ["vendors", slug], queryFn: () => listVendors({ data: { categorySlug: slug } }) }),
  );
  const { data: cats } = useSuspenseQuery(
    queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() }),
  );
  const cat = cats.find((c) => c.slug === slug);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<typeof SORTS[number]["id"]>("rating");

  const list = useMemo(() => {
    let r = [...(vendors as any[])];
    if (q) r = r.filter((v) => v.name.includes(q) || v.city.includes(q));
    switch (sort) {
      case "price_asc": r.sort((a, b) => Number(a.price_from) - Number(b.price_from)); break;
      case "price_desc": r.sort((a, b) => Number(b.price_from) - Number(a.price_from)); break;
      case "reviews": r.sort((a, b) => b.reviews_count - a.reviews_count); break;
      default: r.sort((a, b) => Number(b.rating) - Number(a.rating));
    }
    return r;
  }, [vendors, q, sort]);

  return (
    <Phone>
      {/* Hero header */}
      <div className="relative h-44 -mb-6">
        <img src={COVERS[slug] ?? COVERS.halls} className="absolute inset-0 w-full h-full object-cover" alt={cat?.name_ar} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-card" />
        <div className="absolute inset-x-0 top-0">
          <TopBar title="" back="/categories" />
        </div>
        <div className="absolute bottom-8 inset-x-5 text-white">
          <p className="text-[11px] opacity-90">تصنيف</p>
          <h1 className="font-display font-bold text-2xl mt-1">{cat?.name_ar}</h1>
          <p className="text-xs opacity-90 mt-1">{vendors.length} مزوّد متاح</p>
        </div>
      </div>

      <div className="relative bg-card rounded-t-[2rem] pt-5 px-5 flex-1">
        <div className="app-pill rounded-2xl flex items-center gap-3 px-4 py-3">
          <Search className="size-4 text-[color:var(--color-primary)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحثي بالاسم أو المدينة..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <button className="size-7 rounded-xl bg-[color:var(--color-soft-rose)] grid place-items-center">
            <SlidersHorizontal className="size-3.5 text-[color:var(--color-primary)]" />
          </button>
        </div>

        <div className="flex gap-2 mt-3 mb-4 overflow-x-auto hide-scrollbar">
          {SORTS.map((s) => {
            const active = s.id === sort;
            return (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold shrink-0 transition ${
                  active ? "gradient-pink text-white shadow-gold" : "app-pill"
                }`}
              >
                {s.l}
              </button>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة</div>
        )}

        <div className="space-y-3 pb-8">
          {list.map((v: any, i: number) => (
            <Link
              key={v.id}
              to="/vendors/$id"
              params={{ id: v.id }}
              className={`app-section w-full rounded-3xl p-2.5 flex gap-3 items-center text-right animate-slide-up stagger-${(i % 5) + 1}`}
            >
              <div className="relative size-24 rounded-2xl overflow-hidden shrink-0">
                <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                <span className="absolute top-1 right-1 bg-white/95 rounded-full px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-0.5">
                  <Star className="size-2.5 text-[color:var(--color-accent)] fill-current" /> {v.rating}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display font-bold truncate">{v.name}</p>
                  <button className="shrink-0 size-7 rounded-full app-pill grid place-items-center">
                    <Heart className="size-3.5 text-[color:var(--color-primary)]" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3" /> {v.city}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">{v.reviews_count} تقييم</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">يبدأ من</span>
                  <span className="text-sm font-display font-bold text-[color:var(--color-primary)] flex items-center gap-0.5">
                    {fmt(v.price_from)} ر.س <ChevronLeft className="size-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </Phone>
  );
}
