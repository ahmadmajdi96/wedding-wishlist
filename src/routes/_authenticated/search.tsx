import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search as SearchIcon, Star, MapPin, BadgeCheck, SlidersHorizontal } from "lucide-react";
import { searchVendors, listCities, listCategories } from "@/lib/catalog.functions";
import { BottomNav, Phone, TopBar, fmt } from "@/components/app/Shell";

const citiesOpts = queryOptions({ queryKey: ["cities"], queryFn: () => listCities() });
const catsOpts = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });

export const Route = createFileRoute("/_authenticated/search")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(citiesOpts),
      context.queryClient.ensureQueryData(catsOpts),
    ]),
  component: Page,
  head: () => ({
    meta: [
      { title: "البحث عن مزوّدي خدمات الأفراح | يلا نجهّز" },
      { name: "description", content: "ابحثي عن قاعات، مصورين، فساتين ومزوّدي خدمات الأفراح حسب المدينة والسعر والتقييم." },
    ],
  }),
});

const SORTS = [
  { v: "rating", l: "الأعلى تقييماً" },
  { v: "price_asc", l: "الأقل سعراً" },
  { v: "price_desc", l: "الأعلى سعراً" },
  { v: "newest", l: "الأحدث" },
] as const;

function Page() {
  const { data: cities } = useSuspenseQuery(citiesOpts);
  const { data: cats } = useSuspenseQuery(catsOpts);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<(typeof SORTS)[number]["v"]>("rating");
  const [openFilters, setOpenFilters] = useState(false);

  const results = useQuery({
    queryKey: ["search", q, city, cat, maxPrice, minRating, sort],
    queryFn: () =>
      searchVendors({
        data: {
          q: q || undefined,
          city: city || undefined,
          categorySlug: cat || undefined,
          maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
          minRating: minRating || undefined,
          sort,
        },
      }),
  });

  return (
    <Phone>
      <TopBar title="البحث" back="/home" />
      <div className="px-5 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحثي عن قاعة، مصور، فستان…"
            className="w-full rounded-full bg-[color:var(--color-muted)]/70 py-3 pr-11 pl-4 text-sm outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setOpenFilters((v) => !v)}
            className="shrink-0 rounded-full app-pill px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <SlidersHorizontal className="size-3.5" /> فلاتر
          </button>
          <button
            onClick={() => setCat("")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${cat === "" ? "gradient-pink text-white font-bold" : "app-pill"}`}
          >
            الكل
          </button>
          {cats.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setCat(c.slug)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${cat === c.slug ? "gradient-pink text-white font-bold" : "app-pill"}`}
            >
              {c.name_ar}
            </button>
          ))}
        </div>

        {openFilters && (
          <div className="app-section rounded-2xl p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] text-muted-foreground">
                المدينة
                <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-xl bg-[color:var(--color-muted)]/70 px-3 py-2 text-xs">
                  <option value="">كل المدن</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] text-muted-foreground">
                الترتيب
                <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="mt-1 w-full rounded-xl bg-[color:var(--color-muted)]/70 px-3 py-2 text-xs">
                  {SORTS.map((s) => (
                    <option key={s.v} value={s.v}>{s.l}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-[11px] text-muted-foreground">
              أقصى سعر: {maxPrice === "" ? "بدون حد" : `${fmt(maxPrice)} د.أ`}
              <input
                type="range"
                min={0}
                max={20000}
                step={250}
                value={maxPrice === "" ? 20000 : maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value) >= 20000 ? "" : Number(e.target.value))}
                className="w-full accent-[color:var(--color-primary)]"
              />
            </label>
            <div className="flex gap-1.5">
              {[0, 3, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`rounded-full px-3 py-1 text-[11px] ${minRating === r ? "gradient-pink text-white font-bold" : "app-pill"}`}
                >
                  {r === 0 ? "كل التقييمات" : `${r}+`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 mt-4 space-y-3 pb-6">
        <p className="text-[11px] text-muted-foreground">{(results.data ?? []).length} نتيجة</p>
        {(results.data ?? []).map((v: any) => (
          <Link key={v.id} to="/vendors/$id" params={{ id: v.id }} className="app-section rounded-2xl p-3 flex gap-3 items-center">
            <img src={v.image_url} alt={v.name} loading="lazy" className="size-20 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm flex items-center gap-1">
                {v.name}
                {v.is_verified && <BadgeCheck className="size-3.5 text-[color:var(--color-primary)]" />}
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" /> {v.city} · {v.categories?.name_ar}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] flex items-center gap-0.5 text-muted-foreground">
                  <Star className="size-3 fill-current text-[color:var(--gold,#D4AF37)]" /> {v.rating} ({v.reviews_count})
                </span>
                <span className="text-sm font-bold text-[color:var(--color-primary)]">من {fmt(v.price_from)} د.أ</span>
              </div>
            </div>
          </Link>
        ))}
        {results.isFetched && (results.data ?? []).length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">لا توجد نتائج مطابقة</p>
        )}
      </div>
      <BottomNav />
    </Phone>
  );
}
