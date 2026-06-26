import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { MapPin, Star, Heart, SlidersHorizontal, Filter } from "lucide-react";
import { listVendors, listCategories } from "@/lib/catalog.functions";
import { BottomNav, Phone, TopBar, fmt } from "@/components/app/Shell";

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

function Page() {
  const { slug } = Route.useParams();
  const { data: vendors } = useSuspenseQuery(
    queryOptions({ queryKey: ["vendors", slug], queryFn: () => listVendors({ data: { categorySlug: slug } }) }),
  );
  const { data: cats } = useSuspenseQuery(
    queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() }),
  );
  const cat = cats.find((c) => c.slug === slug);

  return (
    <Phone>
      <TopBar title={cat?.name_ar ?? "التصنيف"} back="/categories" />
      <div className="px-5 flex gap-2 mb-3 overflow-x-auto">
        <button className="app-pill rounded-full px-3 py-2 flex items-center gap-1.5 text-xs font-semibold shrink-0">
          <SlidersHorizontal className="size-3.5" /> تصفية
        </button>
        <button className="app-pill rounded-full px-3 py-2 flex items-center gap-1.5 text-xs font-semibold shrink-0">
          <Filter className="size-3.5" /> الأقرب لي
        </button>
        <button className="app-pill rounded-full px-3 py-2 text-xs font-semibold shrink-0">الأعلى تقييماً</button>
      </div>

      {vendors.length === 0 && (
        <div className="px-6 py-16 text-center text-sm text-muted-foreground">لا يوجد مزودون لهذه الفئة بعد</div>
      )}

      <div className="px-5 space-y-3 pb-6">
        {vendors.map((v: any) => (
          <Link
            key={v.id}
            to="/vendors/$id"
            params={{ id: v.id }}
            className="app-section w-full rounded-2xl p-2.5 flex gap-3 items-center text-right"
          >
            <img src={v.image_url} alt={v.name} className="size-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold">{v.name}</p>
                <Heart className="size-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="size-3" />
                {v.city}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs flex items-center gap-1">
                  <Star className="size-3 text-[color:var(--color-accent)] fill-current" />
                  <b>{v.rating}</b> <span className="text-muted-foreground">({v.reviews_count})</span>
                </span>
                <span className="text-sm font-display font-bold text-[color:var(--color-primary)]">
                  {fmt(v.price_from)} ر.س
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <BottomNav />
    </Phone>
  );
}
