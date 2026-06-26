import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Building2, Sparkles, Camera, Gift, Gem, Heart, Car, Mail } from "lucide-react";
import { listCategories } from "@/lib/catalog.functions";
import { BottomNav, Phone, TopBar } from "@/components/app/Shell";

const ICONS: Record<string, any> = { Building2, Sparkles, Camera, Gift, Gem, Heart, Car, Mail };
const opts = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });

export const Route = createFileRoute("/_authenticated/categories/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data: cats } = useSuspenseQuery(opts);
  return (
    <Phone>
      <TopBar title="التصنيفات" back="/home" />
      <div className="px-5 grid grid-cols-3 gap-3 pb-6">
        {cats.map((c) => {
          const Icon = ICONS[c.icon] ?? Building2;
          return (
            <Link
              key={c.id}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="app-section rounded-2xl p-3 flex flex-col items-center gap-2"
            >
              <span className="size-12 rounded-xl grid place-items-center app-icon-chip">
                <Icon className="size-5 text-[color:var(--color-primary)]" />
              </span>
              <span className="font-display font-bold text-xs text-center">{c.name_ar}</span>
            </Link>
          );
        })}
      </div>
      <BottomNav />
    </Phone>
  );
}
