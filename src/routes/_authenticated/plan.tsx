import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Calendar, Check, Plus, Trash2, Wallet, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saveTask, deleteTask } from "@/lib/saas.functions";
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
  const saveTaskFn = useServerFn(saveTask);
  const delTaskFn = useServerFn(deleteTask);
  const [newTask, setNewTask] = useState("");
  const addTask = useMutation({
    mutationFn: (title: string) =>
      saveTaskFn({ data: { title, notes: "", sort_order: 99, due_date: null } }),
    onSuccess: () => {
      setNewTask("");
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeTask = useMutation({
    mutationFn: (id: string) => delTaskFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
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
              <p className="font-bold">{fmt(budgetMax)} د.أ</p>
            </div>
            <div className="text-left">
              <p className="text-muted-foreground">المصروف</p>
              <p className="font-bold">{fmt(spent)} د.أ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <Link to="/budget" className="app-section rounded-2xl p-3.5 flex items-center gap-2">
            <Wallet className="size-4 text-[color:var(--color-primary)]" />
            <span className="text-sm font-bold">تفاصيل الميزانية</span>
          </Link>
          <Link to="/guests" className="app-section rounded-2xl p-3.5 flex items-center gap-2">
            <Users className="size-4 text-[color:var(--color-primary)]" />
            <span className="text-sm font-bold">قائمة الضيوف</span>
          </Link>
        </div>

        <div className="app-section rounded-2xl p-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-sm">
              المهام ({done} من {tasks.length} مكتملة)
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTask.trim()) addTask.mutate(newTask.trim());
            }}
            className="flex gap-2 mb-3"
          >
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="أضيفي مهمة جديدة…"
              aria-label="مهمة جديدة"
              className="flex-1 rounded-xl border border-[color:var(--color-border)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--color-primary)]"
            />
            <button
              type="submit"
              aria-label="إضافة مهمة"
              disabled={!newTask.trim() || addTask.isPending}
              className="size-9 rounded-full gradient-pink text-white grid place-items-center disabled:opacity-50"
            >
              <Plus className="size-4" />
            </button>
          </form>
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
                <button
                  aria-label="حذف المهمة"
                  onClick={() => removeTask.mutate(t.id)}
                  className="size-7 grid place-items-center rounded-full app-pill text-destructive"
                >
                  <Trash2 className="size-3" />
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
