import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { adminListBookings, adminUpdateBooking } from "@/lib/admin.functions";
import { AdminShell, Card, inputCls } from "@/components/admin/AdminShell";
import { MonthCalendar, STATUS_DOT } from "@/components/app/MonthCalendar";
import { fmt } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["admin-bookings"], queryFn: () => adminListBookings() });

export const Route = createFileRoute("/_authenticated/admin/schedule")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

const AR: Record<string, string> = {
  pending: "قيد التأكيد",
  confirmed: "مؤكد",
  cancelled: "ملغي",
};

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);

  const upd = useMutation({
    mutationFn: (v: { id: string; status: any }) => adminUpdateBooking({ data: v }),
    onSuccess: () => {
      toast.success("تم التحديث");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const events = (data as any[]).map((b) => ({
    id: b.id,
    date: b.event_date,
    label: b.vendors?.name ?? "حجز",
    status: b.status,
  }));

  const dayRows = selected ? (data as any[]).filter((b) => b.event_date === selected) : [];

  return (
    <AdminShell title="جدول الحجوزات">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
        <MonthCalendar events={events} selected={selected} onSelect={setSelected} />

        <div className="space-y-2">
          <p className="font-display font-bold text-sm flex items-center gap-2">
            <CalendarDays className="size-4 text-[color:var(--color-primary)]" />
            {selected ? `حجوزات ${selected}` : "اختاري يوماً من التقويم"}
          </p>
          {dayRows.map((b: any) => (
            <Card key={b.id} className="flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0">
                <p className="font-display font-bold text-sm flex items-center gap-2">
                  <span className={`size-2 rounded-full ${STATUS_DOT[b.status]}`} />
                  {b.vendors?.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {b.vendors?.city} · {fmt(b.total)} ر.س · {AR[b.status]}
                </p>
              </div>
              <select
                className={`${inputCls} w-auto`}
                value={b.status}
                onChange={(e) => upd.mutate({ id: b.id, status: e.target.value })}
              >
                {Object.keys(AR).map((s) => (
                  <option key={s} value={s}>{AR[s]}</option>
                ))}
              </select>
            </Card>
          ))}
          {selected && dayRows.length === 0 && (
            <p className="text-sm text-muted-foreground">لا توجد حجوزات في هذا اليوم</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
