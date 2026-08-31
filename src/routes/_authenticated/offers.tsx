import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Tag, Star } from "lucide-react";
import { listOffers } from "@/lib/saas.functions";
import { BottomNav, Phone, TopBar, fmt } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["offers"], queryFn: () => listOffers() });

export const Route = createFileRoute("/_authenticated/offers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
  head: () => ({
    meta: [
      { title: "العروض والخصومات | يلا نجهّز" },
      { name: "description", content: "أحدث عروض قاعات الأفراح والمصورين والفساتين بخصومات حصرية." },
      { property: "og:title", content: "العروض والخصومات | يلا نجهّز" },
      { property: "og:description", content: "وفّري أكثر على تجهيزات فرحك مع عروضنا الحصرية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Page() {
  const { data } = useSuspenseQuery(opts);
  const rows = data as any[];

  return (
    <Phone>
      <TopBar title="العروض" back="/home" />
      <div className="px-5 space-y-3">
        {rows.length === 0 && (
          <div className="app-section rounded-2xl p-8 text-center mt-4">
            <Tag className="mx-auto size-9 text-[color:var(--color-primary)]/60" />
            <p className="font-display font-bold mt-2 text-sm">لا توجد عروض حالياً</p>
            <p className="text-xs text-muted-foreground mt-1">تابعينا قريباً — نضيف عروضاً موسمية باستمرار.</p>
          </div>
        )}
        {rows.map((o, i) => (
          <Link
            key={o.id}
            to="/vendors/$id"
            params={{ id: o.vendor_id }}
            className="block app-section rounded-2xl overflow-hidden animate-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="relative h-36">
              <img src={o.vendors?.image_url} alt={o.vendors?.name} className="size-full object-cover" loading="lazy" />
              <span className="absolute top-3 right-3 rounded-full gradient-pink text-white text-xs font-bold px-3 py-1">
                خصم {o.discount_percent}%
              </span>
            </div>
            <div className="p-3.5">
              <p className="font-display font-bold text-sm">{o.title}</p>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{o.description}</p>
              <div className="flex items-center justify-between mt-2 text-[11px]">
                <span className="flex items-center gap-1 text-[color:var(--color-accent-foreground)]">
                  <Star className="size-3.5 fill-[color:var(--color-accent)] text-[color:var(--color-accent)]" />
                  {o.vendors?.rating}
                </span>
                <span className="font-bold">
                  يبدأ من {fmt(Number(o.vendors?.price_from ?? 0) * (1 - o.discount_percent / 100))} د.أ
                </span>
              </div>
              {o.ends_on && (
                <p className="text-[10px] text-muted-foreground mt-1">ينتهي في {o.ends_on}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="h-4" />
      <BottomNav />
    </Phone>
  );
}
