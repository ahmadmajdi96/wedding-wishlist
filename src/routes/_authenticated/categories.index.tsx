import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Building2, Sparkles, Camera, Gift, Gem, Heart, Car, Mail, Flower2, Music, Cake, PartyPopper, ChevronLeft } from "lucide-react";
import { listCategories, listVendors } from "@/lib/catalog.functions";
import { BottomNav, Phone, TopBar } from "@/components/app/Shell";

const ICONS: Record<string, any> = { Building2, Sparkles, Camera, Gift, Gem, Heart, Car, Mail, Flower2, Music, Cake, PartyPopper };

const COVERS: Record<string, string> = {
  halls: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
  dresses: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=900&q=80",
  photo: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80",
  catering: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80",
  jewelry: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80",
  beauty: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
  cars: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80",
  invites: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=900&q=80",
  decor: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=900&q=80",
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=80",
  cake: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=900&q=80",
  gifts: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=80",
};

const catsOpts = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });
const allVendorsOpts = queryOptions({ queryKey: ["vendors", "all"], queryFn: () => listVendors({ data: {} }) });

export const Route = createFileRoute("/_authenticated/categories/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(catsOpts),
      context.queryClient.ensureQueryData(allVendorsOpts),
    ]),
  component: Page,
});

function Page() {
  const { data: cats } = useSuspenseQuery(catsOpts);
  const { data: vendors } = useSuspenseQuery(allVendorsOpts);
  const [q, setQ] = useState("");

  const counts: Record<string, number> = {};
  for (const v of vendors as any[]) {
    const slug = v.categories?.slug;
    if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
  }

  const filtered = q
    ? cats.filter((c) => c.name_ar.includes(q))
    : cats;

  return (
    <Phone>
      <TopBar title="التصنيفات" back="/home" />

      <div className="px-5 mb-4">
        <div className="app-pill rounded-2xl flex items-center gap-3 px-4 py-3.5">
          <Search className="size-[18px] text-[color:var(--color-primary)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحثي عن تصنيف..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="px-5 pb-6 grid grid-cols-2 gap-3 animate-slide-up">
        {filtered.map((c, i) => {
          const Icon = ICONS[c.icon] ?? Building2;
          return (
            <Link
              key={c.id}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className={`relative rounded-3xl overflow-hidden h-36 group animate-slide-up stagger-${(i % 5) + 1}`}
            >
              <img src={COVERS[c.slug] ?? COVERS.halls} alt={c.name_ar} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
              <div className="absolute top-3 right-3 size-9 rounded-2xl bg-white/95 grid place-items-center">
                <Icon className="size-4 text-[color:var(--color-primary)]" />
              </div>
              <div className="absolute bottom-3 inset-x-3 text-white flex items-end justify-between">
                <div>
                  <p className="font-display font-bold text-base leading-tight">{c.name_ar}</p>
                  <p className="text-[10px] opacity-90 mt-0.5">{counts[c.slug] ?? 0} مزوّد</p>
                </div>
                <ChevronLeft className="size-5" />
              </div>
            </Link>
          );
        })}
      </div>

      <BottomNav />
    </Phone>
  );
}
