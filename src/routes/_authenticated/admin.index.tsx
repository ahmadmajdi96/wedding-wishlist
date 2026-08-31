import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Store, Grid3x3, Users, CalendarCheck, Star, Wallet, Send } from "lucide-react";
import { adminStats, adminBroadcast } from "@/lib/admin.functions";
import { AdminShell, Card, Field, inputCls } from "@/components/admin/AdminShell";
import { fmt } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["admin-stats"], queryFn: () => adminStats() });

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(opts);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const send = useMutation({
    mutationFn: () => adminBroadcast({ data: { title, body } }),
    onSuccess: (r) => {
      toast.success(`تم إرسال الإشعار إلى ${r.sent} مستخدم`);
      setTitle("");
      setBody("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const tiles = [
    { l: "مقدّمو الخدمات", v: data.vendors, icon: Store, to: "/admin/vendors" },
    { l: "التصنيفات", v: data.categories, icon: Grid3x3, to: "/admin/categories" },
    { l: "الحجوزات", v: data.bookings, icon: CalendarCheck, to: "/admin/bookings" },
    { l: "المستخدمون", v: data.users, icon: Users, to: "/admin/users" },
  ] as const;

  return (
    <AdminShell title="لوحة التحكم">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.l} to={t.to}>
              <Card className="hover:shadow-lg transition">
                <Icon className="size-5 text-[color:var(--color-primary)]" />
                <p className="text-2xl font-display font-bold mt-2">{fmt(t.v)}</p>
                <p className="text-xs text-muted-foreground">{t.l}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <Card>
          <p className="text-xs text-muted-foreground">حجوزات قيد التأكيد</p>
          <p className="text-2xl font-display font-bold mt-1">{fmt(data.pending)}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground">حجوزات مؤكدة</p>
          <p className="text-2xl font-display font-bold mt-1">{fmt(data.confirmed)}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Wallet className="size-3.5" /> إجمالي الإيرادات المؤكدة
          </p>
          <p className="text-2xl font-display font-bold mt-1 text-[color:var(--color-primary)]">
            {fmt(data.revenue)} ر.س
          </p>
        </Card>
      </div>

      <Card className="mt-4">
        <p className="font-display font-bold text-sm flex items-center gap-2">
          <Star className="size-4 text-[color:var(--gold,#D4AF37)]" /> التقييمات المنشورة: {fmt(data.reviews)}
        </p>
      </Card>

      <Card className="mt-4">
        <p className="font-display font-bold mb-3 flex items-center gap-2">
          <Send className="size-4" /> إرسال إشعار لكل المستخدمين
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="العنوان">
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="النص">
            <input className={inputCls} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
        </div>
        <button
          disabled={title.trim().length < 2 || send.isPending}
          onClick={() => send.mutate()}
          className="mt-3 rounded-full gradient-pink text-white px-5 py-2 text-sm font-bold disabled:opacity-50"
        >
          إرسال
        </button>
      </Card>
    </AdminShell>
  );
}
