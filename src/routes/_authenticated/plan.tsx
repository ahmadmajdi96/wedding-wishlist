import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Calendar, Check } from "lucide-react";
import { listTasks, toggleTask, getMyProfile, listBookings } from "@/lib/user.functions";
import { BottomNav, Phone, TopBar, fmt } from "@/components/app/Shell";

const tasksOpts = queryOptions({ queryKey: ["tasks"], queryFn: () => listTasks() });
const meOpts = queryOptions({ queryKey: ["me"], queryFn: () => getMyProfile() });
const bookingsOpts = queryOptions({ queryKey: ["bookings"], queryFn: () => listBookings() });

export const Route = createFileRoute("/_authenticated/plan")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(tasksOpts),
      context.queryClient.ensureQueryData(meOpts),
      context.queryClient.ensureQueryData(bookingsOpts),
    ]),
  component: Page,
});

function Page() {
  const { data: tasks } = useSuspenseQuery(tasksOpts);
  const { data: me } = useSuspenseQuery(meOpts);
  const { data: bookings } = useSuspenseQuery(bookingsOpts);
  const qc = useQueryClient();
  const toggleFn = useServerFn(toggleTask);
  const toggle = useMutation({
    mutationFn: (vars: { id: string; status: "todo" | "done" }) => toggleFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const daysLeft = me?.wedding_date
    ? Math.max(0, Math.ceil((new Date(me.wedding_date).getTime() - Date.now()) / 86400000))
    : null;
  const budgetMax = Number(me?.budget_max ?? 0);
  const spent = (bookings as any[])
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + Number(b.total), 0);
  const pct = budgetMax > 0 ? Math.min(100, Math.round((spent / budgetMax) * 100)) : 0;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <Phone>
      <TopBar title="خطة زفافي" back="/home" action={<Bell className="size-4" />} />
      <div className="px-5">
        <div className="app-section rounded-2xl p-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, var(--soft-rose), white)" }}>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">يوم زفافي</p>
            <p className="font-display font-bold text-sm flex items-center gap-1 mt-1">
              <Calendar className="size-3.5 text-[color:var(--color-primary)]" />
              {me?.wedding_date || "غير محدد"}
            </p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-4xl text-[color:var(--color-primary)] leading-none">
              {daysLeft ?? "—"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">يوم متبقي</p>
          </div>
        </div>

        <div className="app-section rounded-2xl p-4 mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-bold text-sm">الميزانية</p>
            <span className="text-xs font-bold text-[color:var(--color-primary)]">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[color:var(--color-primary)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] mt-2">
            <div>
              <p className="text-muted-foreground">الميزانية</p>
              <p className="font-bold">{fmt(budgetMax)} ر.س</p>
            </div>
            <div className="text-left">
              <p className="text-muted-foreground">المصروف</p>
              <p className="font-bold">{fmt(spent)} ر.س</p>
            </div>
          </div>
        </div>

        <div className="app-section rounded-2xl p-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-sm">
              المهام ({done} من {tasks.length} مكتملة)
            </p>
          </div>
          <ul className="space-y-2.5">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <button
                  onClick={() =>
                    toggle.mutate({ id: t.id, status: t.status === "done" ? "todo" : "done" })
                  }
                  className="flex items-center gap-2 text-right"
                >
                  <span
                    className={`size-5 rounded-full grid place-items-center shrink-0 ${
                      t.status === "done" ? "bg-[color:var(--color-primary)] text-white" : "border border-border"
                    }`}
                  >
                    {t.status === "done" && <Check className="size-3" />}
                  </span>
                  <span className={t.status === "done" ? "line-through text-muted-foreground" : ""}>
                    {t.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="h-4" />
      <BottomNav />
    </Phone>
  );
}
