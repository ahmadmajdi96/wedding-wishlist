import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { LifeBuoy, ChevronDown } from "lucide-react";
import { listFaq, listMyTickets, createTicket } from "@/lib/saas.functions";
import { BottomNav, Phone, TopBar } from "@/components/app/Shell";

const faqOpts = queryOptions({ queryKey: ["faq"], queryFn: () => listFaq() });
const ticketOpts = queryOptions({ queryKey: ["my-tickets"], queryFn: () => listMyTickets() });

export const Route = createFileRoute("/_authenticated/support")({
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(faqOpts), context.queryClient.ensureQueryData(ticketOpts)]),
  component: Page,
  head: () => ({
    meta: [
      { title: "مركز المساعدة | يلا نجهّز" },
      { name: "description", content: "أسئلة شائعة وتذاكر دعم للحصول على مساعدة سريعة في تجهيزات فرحك." },
      { property: "og:title", content: "مركز المساعدة | يلا نجهّز" },
      { property: "og:description", content: "فريق الدعم جاهز للإجابة على استفساراتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const inputCls =
  "w-full rounded-xl border border-[color:var(--color-border)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--color-primary)]";

const STATUS: Record<string, string> = { open: "مفتوحة", answered: "تم الرد", closed: "مغلقة" };

function Page() {
  const { data: faq } = useSuspenseQuery(faqOpts);
  const { data: tickets } = useSuspenseQuery(ticketOpts);
  const qc = useQueryClient();
  const createFn = useServerFn(createTicket);
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: "", message: "" });

  const send = useMutation({
    mutationFn: () => createFn({ data: form }),
    onSuccess: () => {
      toast.success("تم إرسال طلبك، سنرد عليكِ قريباً");
      setForm({ subject: "", message: "" });
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Phone>
      <TopBar title="مركز المساعدة" back="/account" />
      <div className="px-5 space-y-4">
        <div className="app-section rounded-2xl p-4">
          <p className="font-display font-bold text-sm mb-2">الأسئلة الشائعة</p>
          <div className="divide-y divide-border">
            {(faq as any[]).map((f) => (
              <div key={f.id} className="py-2.5">
                <button
                  onClick={() => setOpen(open === f.id ? null : f.id)}
                  className="w-full flex items-center justify-between gap-2 text-right"
                >
                  <span className="text-sm font-semibold">{f.question}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition ${open === f.id ? "rotate-180" : ""}`}
                  />
                </button>
                {open === f.id && (
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">{f.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="app-section rounded-2xl p-4">
          <p className="font-display font-bold text-sm mb-2 flex items-center gap-2">
            <LifeBuoy className="size-4 text-[color:var(--color-primary)]" /> تواصلي مع الدعم
          </p>
          <div className="space-y-2">
            <input
              className={inputCls}
              placeholder="عنوان الطلب"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <textarea
              className={inputCls}
              rows={4}
              placeholder="اشرحي مشكلتك أو استفسارك"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button
              onClick={() => send.mutate()}
              disabled={send.isPending || form.subject.trim().length < 2 || form.message.trim().length < 2}
              className="rounded-full gradient-pink text-white font-bold px-5 py-2.5 text-xs disabled:opacity-50"
            >
              إرسال الطلب
            </button>
          </div>
        </div>

        {(tickets as any[]).length > 0 && (
          <div className="space-y-2">
            <p className="font-display font-bold text-sm">طلباتي السابقة</p>
            {(tickets as any[]).map((t) => (
              <div key={t.id} className="app-section rounded-2xl p-3.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">{t.subject}</p>
                  <span className="rounded-full app-pill px-2 py-0.5 text-[10px]">{STATUS[t.status]}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t.message}</p>
                {t.admin_reply && (
                  <p className="text-xs mt-2 rounded-xl bg-[color:var(--color-muted)] p-2.5 leading-relaxed">
                    <span className="font-bold text-[color:var(--color-primary)]">رد الدعم: </span>
                    {t.admin_reply}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 text-xs">
          <Link to="/legal/$slug" params={{ slug: "terms" }} className="app-pill rounded-full px-3 py-1.5">
            الشروط والأحكام
          </Link>
          <Link to="/legal/$slug" params={{ slug: "privacy" }} className="app-pill rounded-full px-3 py-1.5">
            سياسة الخصوصية
          </Link>
          <Link to="/legal/$slug" params={{ slug: "about" }} className="app-pill rounded-full px-3 py-1.5">
            عن التطبيق
          </Link>
        </div>
      </div>
      <div className="h-4" />
      <BottomNav />
    </Phone>
  );
}
