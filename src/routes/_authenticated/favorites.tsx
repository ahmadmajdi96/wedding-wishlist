import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Heart, MapPin } from "lucide-react";
import { listFavorites } from "@/lib/user.functions";
import { BottomNav, Phone, TopBar, fmt } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["favorites"], queryFn: () => listFavorites() });

export const Route = createFileRoute("/_authenticated/favorites")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(opts);
  return (
    <Phone>
      <TopBar title="المفضلة" back="/home" />
      {data.length === 0 && (
        <div className="px-6 py-20 text-center">
          <Heart className="mx-auto size-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">لا توجد عناصر في مفضلتكِ بعد</p>
          <Link to="/categories" className="text-[color:var(--color-primary)] font-bold text-sm mt-2 inline-block">
            تصفحي التصنيفات
          </Link>
        </div>
      )}
      <div className="px-5 space-y-3 pb-6">
        {data.map((f: any) => (
          <Link
            key={f.vendor_id}
            to="/vendors/$id"
            params={{ id: f.vendor_id }}
            className="app-section rounded-2xl p-2.5 flex gap-3 items-center text-right"
          >
            <img src={f.vendors.image_url} className="size-16 rounded-xl object-cover" alt={f.vendors.name} />
            <div className="flex-1">
              <p className="font-display font-bold text-sm">{f.vendors.name}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" />
                {f.vendors.city}
              </p>
              <p className="text-xs font-bold text-[color:var(--color-primary)] mt-1">
                {fmt(f.vendors.price_from)} ر.س
              </p>
            </div>
            <Heart className="size-5 fill-current text-[color:var(--color-primary)]" />
          </Link>
        ))}
      </div>
      <BottomNav />
    </Phone>
  );
}
