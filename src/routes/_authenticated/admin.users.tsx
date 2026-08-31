import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, ShieldCheck } from "lucide-react";
import { adminListUsers, adminSetRole } from "@/lib/admin.functions";
import { AdminShell, Card, inputCls } from "@/components/admin/AdminShell";

const opts = queryOptions({ queryKey: ["admin-users"], queryFn: () => adminListUsers() });

export const Route = createFileRoute("/_authenticated/admin/users")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const setRole = useMutation({
    mutationFn: (v: { userId: string; grant: boolean }) =>
      adminSetRole({ data: { userId: v.userId, role: "admin", grant: v.grant } }),
    onSuccess: () => {
      toast.success("تم تحديث الصلاحية");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data.filter((u: any) =>
    (u.full_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
    (u.city ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AdminShell title="المستخدمون">
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input className={`${inputCls} pr-9`} placeholder="بحث بالاسم أو المدينة" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="space-y-2 mt-4">
        {rows.map((u: any) => {
          const isAdmin = u.roles.includes("admin");
          return (
            <Card key={u.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display font-bold text-sm truncate">{u.full_name || "بدون اسم"}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {u.city || "—"} · {u.phone || "بدون رقم"} · {u.wedding_date || "بدون تاريخ زفاف"}
                </p>
              </div>
              <button
                onClick={() => setRole.mutate({ userId: u.id, grant: !isAdmin })}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1 ${isAdmin ? "gradient-pink text-white" : "app-pill"}`}
              >
                <ShieldCheck className="size-3.5" />
                {isAdmin ? "مشرف" : "ترقية لمشرف"}
              </button>
            </Card>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">لا يوجد مستخدمون</p>}
      </div>
    </AdminShell>
  );
}
