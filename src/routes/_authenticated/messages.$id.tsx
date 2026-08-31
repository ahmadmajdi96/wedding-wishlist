import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { getConversation, sendMessage } from "@/lib/saas.functions";
import { Phone, TopBar } from "@/components/app/Shell";

export const Route = createFileRoute("/_authenticated/messages/$id")({
  component: Page,
  head: () => ({
    meta: [
      { title: "محادثة | يلا نجهّز" },
      { name: "description", content: "تحدثي مباشرة مع فريق يلا نجهّز حول مقدّم الخدمة الذي اخترتِه." },
      { property: "og:title", content: "محادثة | يلا نجهّز" },
      { property: "og:description", content: "دردشة فورية لتنسيق تفاصيل حجزك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Page() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const q = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => getConversation({ data: { id } }),
    refetchInterval: 8000,
  });
  const sendFn = useServerFn(sendMessage);
  const send = useMutation({
    mutationFn: (body: string) => sendFn({ data: { conversationId: id, body } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["conversation", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [q.data?.messages.length]);

  const conv: any = q.data?.conversation;

  return (
    <Phone>
      <TopBar title={conv?.vendors?.name ?? "محادثة"} back="/messages" />
      <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-4">
        {q.isLoading && <p className="text-center text-xs text-muted-foreground py-8">جارِ التحميل…</p>}
        {q.data?.messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">
            أرسلي أول رسالة وسيتم الرد عليكِ خلال وقت قصير.
          </p>
        )}
        {(q.data?.messages ?? []).map((m: any) => {
          const mine = m.sender_role === "user";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  mine
                    ? "gradient-pink text-white rounded-bl-sm"
                    : "bg-[color:var(--color-muted)] rounded-br-sm"
                }`}
              >
                {m.body}
                <span className={`block text-[10px] mt-1 ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) send.mutate(text.trim());
        }}
        className="sticky bottom-0 bg-card/90 backdrop-blur-xl border-t border-[color:var(--color-border)] p-3 flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتبي رسالتك…"
          aria-label="نص الرسالة"
          className="flex-1 rounded-full border border-[color:var(--color-border)] bg-background px-4 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]"
        />
        <button
          type="submit"
          disabled={send.isPending || !text.trim()}
          aria-label="إرسال"
          className="size-11 shrink-0 rounded-full gradient-pink text-white grid place-items-center disabled:opacity-50"
        >
          <Send className="size-4 rotate-180" />
        </button>
      </form>
    </Phone>
  );
}
