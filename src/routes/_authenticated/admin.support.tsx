import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { adminListTickets, adminReplyTicket } from "@/lib/adminx.functions";
import { AdminShell, Card, inputCls } from "@/components/admin/AdminShell";

const opts = queryOptions({ queryKey: ["admin-tickets"], queryFn: () => adminListTickets() });

export const Route = createFileRoute("/_authenticated/admin/support")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

const STATUS: Record<string, string> = { open: "مفتوحة", answered: "تم الرد", closed: "مغلقة" };

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");

  const reply = useMutation({
    mutationFn: (v: { id: string; admin_reply: string; status: "open" | "answered" | "closed" }) =>
      adminReplyTicket({ data: v }),
    onSuccess: () => {
      toast.success("تم إرسال الرد");
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data as any[]).filter((t) => filter === "all" || t.status === filter);

  return (
    <AdminShell title="طلبات الدعم">
      <div className="flex gap-2 flex-wrap">
        {["all", "open", "answered", "closed"].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1.5 text-xs ${filter === k ? "gradient-pink text-white font-bold" : "app-pill"}`}
          >
            {k === "all" ? "الكل" : STATUS[k]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((t) => (
          <Card key={t.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-sm">{t.subject}</p>
              <span className="rounded-full app-pill px-2 py-0.5 text-[10px]">{STATUS[t.status]}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t.message}</p>
            {t.admin_reply && (
              <p className="text-xs rounded-xl bg-[color:var(--color-muted)] p-2.5">
                <span className="font-bold text-[color:var(--color-primary)]">الرد: </span>
                {t.admin_reply}
              </p>
            )}
            <textarea
              className={inputCls}
              rows={2}
              placeholder="اكتب رداً…"
              value={replies[t.id] ?? ""}
              onChange={(e) => setReplies({ ...replies, [t.id]: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                onClick={() =>
                  reply.mutate({ id: t.id, admin_reply: (replies[t.id] ?? "").trim(), status: "answered" })
                }
                disabled={!(replies[t.id] ?? "").trim() || reply.isPending}
                className="rounded-full gradient-pink text-white font-bold px-4 py-2 text-xs disabled:opacity-50"
              >
                إرسال الرد
              </button>
              <button
                onClick={() =>
                  reply.mutate({ id: t.id, admin_reply: t.admin_reply || "تم إغلاق الطلب.", status: "closed" })
                }
                className="rounded-full app-pill px-4 py-2 text-xs"
              >
                إغلاق الطلب
              </button>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">لا توجد طلبات</p>}
      </div>
    </AdminShell>
  );
}
