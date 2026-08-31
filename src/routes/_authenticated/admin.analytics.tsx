import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { TrendingUp, Users, Store, Star, CalendarCheck, Percent } from "lucide-react";
import { adminAnalytics } from "@/lib/adminx.functions";
import { AdminShell, Card } from "@/components/admin/AdminShell";
import { fmt } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["admin-analytics"], queryFn: () => adminAnalytics() });

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(opts);
  const maxRevenue = Math.max(1, ...data.series.map((s) => s.revenue));
  const maxBookings = Math.max(1, ...data.series.map((s) => s.bookings));

  const kpis = [
    { icon: TrendingUp, label: "الإيرادات المؤكدة", value: `${fmt(data.totals.revenue)} ر.س` },
    { icon: CalendarCheck, label: "إجمالي الحجوزات", value: data.totals.bookings },
    { icon: Users, label: "المستخدمات", value: data.totals.users },
    { icon: Store, label: "مقدّمو الخدمات", value: data.totals.vendors },
    { icon: Star, label: "متوسط التقييم", value: data.totals.avgRating },
    { icon: Percent, label: "معدل التحويل", value: `${data.totals.conversion}%` },
  ];

  return (
    <AdminShell title="التحليلات">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label} className="flex items-center gap-3">
            <span className="size-10 rounded-2xl gradient-pink text-white grid place-items-center shrink-0">
              <k.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-display font-bold text-lg truncate">{k.value}</p>
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <p className="font-display font-bold text-sm mb-4">الإيرادات والحجوزات — آخر 6 أشهر</p>
        <div className="flex items-end gap-3 h-44">
          {data.series.map((s) => (
            <div key={s.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-1 h-full">
                <div
                  title={`إيرادات ${fmt(s.revenue)}`}
                  className="w-1/2 rounded-t-lg gradient-pink transition-all"
                  style={{ height: `${(s.revenue / maxRevenue) * 100}%`, minHeight: 4 }}
                />
                <div
                  title={`حجوزات ${s.bookings}`}
                  className="w-1/3 rounded-t-lg bg-[color:var(--color-accent)] transition-all"
                  style={{ height: `${(s.bookings / maxBookings) * 100}%`, minHeight: 4 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{s.month.slice(5)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-[11px] text-muted-foreground mt-3">
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded gradient-pink inline-block" /> الإيرادات
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded bg-[color:var(--color-accent)] inline-block" /> الحجوزات
          </span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 mt-4">
        <Card>
          <p className="font-display font-bold text-sm mb-3">الأكثر حجزاً</p>
          <div className="space-y-2">
            {data.topVendors.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{v.name}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {v.bookings} حجز · ⭐ {v.rating}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="font-display font-bold text-sm mb-3">التوزّع حسب المدينة</p>
          <div className="space-y-2">
            {data.cities.slice(0, 8).map((c) => {
              const max = data.cities[0]?.count || 1;
              return (
                <div key={c.city}>
                  <div className="flex justify-between text-[11px]">
                    <span>{c.city}</span>
                    <span className="text-muted-foreground">{c.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                    <div className="h-full gradient-pink rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
