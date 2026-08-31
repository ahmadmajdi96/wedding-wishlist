import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Send } from "lucide-react";
import { adminListConversations } from "@/lib/adminx.functions";
import { getConversation, sendMessage } from "@/lib/saas.functions";
import { AdminShell, Card } from "@/components/admin/AdminShell";

const opts = queryOptions({ queryKey: ["admin-inbox"], queryFn: () => adminListConversations() });

export const Route = createFileRoute("/_authenticated/admin/inbox")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const [active, setActive] = useState<string | null>((data as any[])[0]?.id ?? null);
  const [text, setText] = useState("");

  const thread = useQuery({
    queryKey: ["admin-conversation", active],
    queryFn: () => getConversation({ data: { id: active! } }),
    enabled: Boolean(active),
    refetchInterval: 10000,
  });

  const send = useMutation({
    mutationFn: () => sendMessage({ data: { conversationId: active!, body: text.trim() } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["admin-conversation", active] });
      qc.invalidateQueries({ queryKey: ["admin-inbox"] });
    },
  });

  return (
    <AdminShell title="صندوق الرسائل">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {(data as any[]).map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`w-full text-right rounded-2xl border p-3 transition ${
                active === c.id
                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-muted)]"
                  : "border-[color:var(--color-border)] bg-card"
              }`}
            >
              <p className="font-display font-bold text-sm truncate">
                {c.profile?.full_name || "عميلة"} · {c.vendors?.name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{c.last_message || "—"}</p>
              {c.unread_admin > 0 && (
                <span className="inline-block mt-1 rounded-full gradient-pink text-white text-[10px] px-2 py-0.5 font-bold">
                  {c.unread_admin} جديدة
                </span>
              )}
            </button>
          ))}
          {(data as any[]).length === 0 && <p className="text-sm text-muted-foreground">لا توجد محادثات</p>}
        </div>

        <Card className="flex flex-col min-h-[60vh]">
          {!active && <p className="text-sm text-muted-foreground m-auto">اختاري محادثة لعرضها</p>}
          {active && (
            <>
              <div className="flex-1 overflow-y-auto space-y-2 pb-3 max-h-[55vh]">
                {(thread.data?.messages ?? []).map((m: any) => {
                  const admin = m.sender_role === "admin";
                  return (
                    <div key={m.id} className={`flex ${admin ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm ${
                          admin ? "gradient-pink text-white" : "bg-[color:var(--color-muted)]"
                        }`}
                      >
                        {m.body}
                        <span className={`block text-[10px] mt-1 ${admin ? "text-white/70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleString("ar")}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {thread.data?.messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">لا توجد رسائل بعد</p>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) send.mutate();
                }}
                className="flex gap-2 border-t border-[color:var(--color-border)] pt-3"
              >
                <input
                  className="flex-1 rounded-full border border-[color:var(--color-border)] bg-background px-4 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]"
                  placeholder="اكتب رداً…"
                  aria-label="نص الرد"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  type="submit"
                  aria-label="إرسال"
                  disabled={send.isPending || !text.trim()}
                  className="size-11 rounded-full gradient-pink text-white grid place-items-center disabled:opacity-50"
                >
                  <Send className="size-4 rotate-180" />
                </button>
              </form>
            </>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
