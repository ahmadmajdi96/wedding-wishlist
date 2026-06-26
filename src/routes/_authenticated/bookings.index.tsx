import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Calendar, MapPin } from "lucide-react";
import { listBookings } from "@/lib/user.functions";
import { BottomNav, Phone, TopBar, fmt } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["bookings"], queryFn: () => listBookings() });
const STATUS: Record<string, { l: string; cls: string }> = {
  pending: { l: "قيد التأكيد", cls: "bg-[color:var(--gold-soft)] text-yellow-800" },
  confirmed: { l: "مؤكد", cls: "bg-[color:var(--success-soft)] text-green-700" },
  cancelled: { l: "ملغي", cls: "bg-muted text-muted-foreground" },
};

export const Route = createFileRoute("/_authenticated/bookings/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(opts);
  return (
    <Phone>
      <TopBar title="حجوزاتي" back="/home" />
      {data.length === 0 && (
        <div className="px-6 py-20 text-center">
          <Calendar className="mx-auto size-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">لا توجد حجوزات بعد</p>
          <Link to="/categories" className="text-[color:var(--color-primary)] font-bold text-sm mt-2 inline-block">
            ابدئي بالحجز
          </Link>
        </div>
      )}
      <div className="px-5 space-y-3 pb-6">
        {data.map((b: any) => {
          const s = STATUS[b.status] ?? STATUS.pending;
          return (
            <Link
              key={b.id}
              to="/bookings/$id"
              params={{ id: b.id }}
              className="app-section rounded-2xl p-3 block"
            >
              <div className="flex gap-3 items-center">
                <img src={b.vendors?.image_url} className="size-16 rounded-xl object-cover" alt="" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-sm">{b.vendors?.name}</p>
                    <span className={`text-[10px] rounded-full px-2 py-0.5 ${s.cls}`}>{s.l}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3" />
                    {b.vendors?.city}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" /> {b.event_date}
                    </p>
                    <p className="text-sm font-bold text-[color:var(--color-primary)]">{fmt(b.total)} ر.س</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <BottomNav />
    </Phone>
  );
}
