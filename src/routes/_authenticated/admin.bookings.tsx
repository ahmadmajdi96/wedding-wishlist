import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { adminListBookings, adminUpdateBooking, adminDeleteBooking } from "@/lib/admin.functions";
import { AdminShell, Card, inputCls } from "@/components/admin/AdminShell";
import { fmt } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["admin-bookings"], queryFn: () => adminListBookings() });

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

const STATUSES = ["pending", "confirmed", "cancelled"] as const;
const PAYMENTS = ["unpaid", "deposit", "paid"] as const;
const AR: Record<string, string> = {
  pending: "قيد التأكيد",
  confirmed: "مؤكد",
  cancelled: "ملغي",
  unpaid: "غير مدفوع",
  deposit: "عربون",
  paid: "مدفوع",
};

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const upd = useMutation({
    mutationFn: (v: { id: string; status?: any; payment_status?: any }) => adminUpdateBooking({ data: v }),
    onSuccess: () => {
      toast.success("تم التحديث");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminDeleteBooking({ data: { id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = filter === "all" ? data : data.filter((b: any) => b.status === filter);

  return (
    <AdminShell title="الحجوزات">
      <div className="flex gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs ${filter === s ? "gradient-pink text-white font-bold" : "app-pill"}`}
          >
            {s === "all" ? "الكل" : AR[s]}
          </button>
        ))}
      </div>

      <div className="space-y-2 mt-4">
        {rows.map((b: any) => (
          <Card key={b.id} className="flex flex-wrap items-center gap-3 justify-between">
            <div className="min-w-0">
              <p className="font-display font-bold text-sm">{b.vendors?.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {b.vendors?.city} · {b.event_date} · {fmt(b.total)} د.أ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className={`${inputCls} w-auto`}
                value={b.status}
                onChange={(e) => upd.mutate({ id: b.id, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{AR[s]}</option>
                ))}
              </select>
              <select
                className={`${inputCls} w-auto`}
                value={b.payment_status}
                onChange={(e) => upd.mutate({ id: b.id, payment_status: e.target.value })}
              >
                {PAYMENTS.map((s) => (
                  <option key={s} value={s}>{AR[s]}</option>
                ))}
              </select>
              <button
                onClick={() => confirm("حذف الحجز؟") && del.mutate(b.id)}
                className="size-8 grid place-items-center rounded-full app-pill text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">لا توجد حجوزات</p>}
      </div>
    </AdminShell>
  );
}
