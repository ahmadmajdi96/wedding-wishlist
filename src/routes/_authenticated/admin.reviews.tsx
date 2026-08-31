import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Check, X, Trash2 } from "lucide-react";
import { adminListReviews, adminModerateReview, adminDeleteReview } from "@/lib/adminx.functions";
import { AdminShell, Card } from "@/components/admin/AdminShell";

const opts = queryOptions({ queryKey: ["admin-reviews"], queryFn: () => adminListReviews() });

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

const FILTERS = [
  { k: "all", label: "الكل" },
  { k: "approved", label: "منشورة" },
  { k: "pending", label: "بانتظار المراجعة" },
  { k: "rejected", label: "مرفوضة" },
] as const;

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const [f, setF] = useState<string>("all");

  const mod = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "pending" | "rejected" }) =>
      adminModerateReview({ data: v }),
    onSuccess: () => {
      toast.success("تم التحديث");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminDeleteReview({ data: { id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  const rows = (data as any[]).filter((r) => f === "all" || r.status === f);

  return (
    <AdminShell title="إدارة التقييمات">
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((x) => (
          <button
            key={x.k}
            onClick={() => setF(x.k)}
            className={`rounded-full px-3 py-1.5 text-xs ${f === x.k ? "gradient-pink text-white font-bold" : "app-pill"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <Card key={r.id} className="flex items-start gap-3">
            {r.vendors?.image_url && (
              <img src={r.vendors.image_url} alt="" className="size-12 rounded-xl object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm">{r.vendors?.name}</p>
              <p className="text-[11px] text-[color:var(--color-accent-foreground)] flex items-center gap-1">
                <Star className="size-3 fill-[color:var(--color-accent)] text-[color:var(--color-accent)]" />
                {r.rating} · {new Date(r.created_at).toLocaleDateString("ar")}
                {r.is_reported && <span className="text-destructive font-bold">· مُبلّغ عنه</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{r.comment || "بدون تعليق"}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                aria-label="اعتماد"
                onClick={() => mod.mutate({ id: r.id, status: "approved" })}
                className={`size-8 grid place-items-center rounded-full ${r.status === "approved" ? "gradient-pink text-white" : "app-pill"}`}
              >
                <Check className="size-3.5" />
              </button>
              <button
                aria-label="رفض"
                onClick={() => mod.mutate({ id: r.id, status: "rejected" })}
                className={`size-8 grid place-items-center rounded-full ${r.status === "rejected" ? "gradient-pink text-white" : "app-pill"}`}
              >
                <X className="size-3.5" />
              </button>
              <button
                aria-label="حذف"
                onClick={() => confirm("حذف التقييم؟") && del.mutate(r.id)}
                className="size-8 grid place-items-center rounded-full app-pill text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">لا توجد تقييمات</p>}
      </div>
    </AdminShell>
  );
}
