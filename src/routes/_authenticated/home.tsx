import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Search, MapPin, Star, Building2, Sparkles, Camera, Gift, Gem, Heart, Car, Mail } from "lucide-react";
import { listCategories, listVendors } from "@/lib/catalog.functions";
import { getMyProfile } from "@/lib/user.functions";
import { BottomNav, BrandMark, Phone, fmt } from "@/components/app/Shell";

const ICONS: Record<string, any> = { Building2, Sparkles, Camera, Gift, Gem, Heart, Car, Mail };

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

function HomePage() {
  const nav = useNavigate();
  const { data: cats } = useSuspenseQuery(catsOpts);
  const { data: vendors } = useSuspenseQuery(topVendorsOpts);
  const { data: me } = useSuspenseQuery(meOpts);
  const meFn = useServerFn(getMyProfile);

  // Onboarding gate
  if (me && !me.onboarding_completed) {
    nav({ to: "/onboarding", replace: true });
  }
  void meFn;

  return (
    <Phone>
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <Link to="/notifications" className="relative size-10 rounded-full app-pill grid place-items-center">
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-2 rounded-full bg-[color:var(--color-primary)]" />
        </Link>
        <BrandMark size={36} />
        <div className="app-pill rounded-full px-3 py-1.5 flex items-center gap-1 text-xs">
          <MapPin className="size-3 text-[color:var(--color-primary)]" />
          {me?.city || "الرياض"}
        </div>
      </div>

      <div className="px-5 mb-3">
        <Link to="/categories" className="app-pill rounded-2xl flex items-center gap-3 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <span className="flex-1 text-sm text-muted-foreground">ابحثي عن قاعة، مصور، خدمة...</span>
        </Link>
      </div>

      <div className="px-5">
        <div className="relative rounded-3xl overflow-hidden h-44 app-section">
          {vendors[0] && (
            <img src={vendors[0].image_url} className="absolute inset-0 w-full h-full object-cover" alt="عرض" />
          )}
          <div className="absolute inset-0 bg-gradient-to-tl from-black/60 via-black/10 to-transparent" />
          <div className="absolute top-4 right-4 text-white max-w-[62%]">
            <p className="text-[11px] opacity-90">عرض مميز</p>
            <h3 className="font-display font-bold text-lg leading-tight">احجزي قاعتكِ المثالية ليوم لا يُنسى</h3>
            <Link
              to="/categories/$slug"
              params={{ slug: "halls" }}
              className="mt-2 inline-block bg-white text-[color:var(--color-primary)] text-xs font-bold rounded-full px-4 py-1.5"
            >
              اكتشفي الآن
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="grid grid-cols-4 gap-3">
          {cats.slice(0, 4).map((c) => {
            const Icon = ICONS[c.icon] ?? Building2;
            return (
              <Link
                key={c.id}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="size-14 rounded-2xl grid place-items-center app-icon-chip">
                  <Icon className="size-6 text-[color:var(--color-primary)]" />
                </span>
                <span className="text-[11px] font-semibold">{c.name_ar}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-6 flex items-center justify-between">
        <h3 className="font-display font-bold">الأكثر طلباً</h3>
        <Link to="/categories" className="text-xs text-[color:var(--color-primary)] font-bold">
          عرض الكل
        </Link>
      </div>

      <div className="px-5 mt-3 grid grid-cols-2 gap-3 pb-4">
        {vendors.slice(0, 4).map((v: any) => (
          <Link
            key={v.id}
            to="/vendors/$id"
            params={{ id: v.id }}
            className="app-section rounded-2xl overflow-hidden text-right"
          >
            <div className="relative h-24">
              <img src={v.image_url} className="w-full h-full object-cover" alt={v.name} />
              <span className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                <Star className="size-3 text-[color:var(--color-accent)] fill-current" /> {v.rating}
              </span>
            </div>
            <div className="p-2.5">
              <p className="font-display font-bold text-sm">{v.name}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="size-3" />
                {v.city}
              </p>
              <p className="text-[11px] font-bold text-[color:var(--color-primary)] mt-1">
                {fmt(v.price_from)} ر.س
              </p>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </Phone>
  );
}
