import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { adminListAudit } from "@/lib/adminx.functions";
import { AdminShell, Card } from "@/components/admin/AdminShell";

const opts = queryOptions({ queryKey: ["admin-audit"], queryFn: () => adminListAudit() });

export const Route = createFileRoute("/_authenticated/admin/audit")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

const ACTIONS: Record<string, string> = {
  moderate_review: "مراجعة تقييم",
  delete_review: "حذف تقييم",
  create_offer: "إنشاء عرض",
  update_offer: "تعديل عرض",
  delete_offer: "حذف عرض",
  reply_ticket: "رد على طلب دعم",
};

function Page() {
  const { data } = useSuspenseQuery(opts);
  return (
    <AdminShell title="سجل النشاط">
      <div className="space-y-2">
        {(data as any[]).map((a) => (
          <Card key={a.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display font-bold text-sm">{ACTIONS[a.action] ?? a.action}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {a.entity} · {a.entity_id || "—"}
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0">
              {new Date(a.created_at).toLocaleString("ar")}
            </span>
          </Card>
        ))}
        {(data as any[]).length === 0 && <p className="text-sm text-muted-foreground">لا يوجد نشاط مسجل</p>}
      </div>
    </AdminShell>
  );
}
