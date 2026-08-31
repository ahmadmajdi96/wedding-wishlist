import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { listConversations } from "@/lib/saas.functions";
import { BottomNav, Phone, TopBar } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["conversations"], queryFn: () => listConversations() });

export const Route = createFileRoute("/_authenticated/messages/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
  head: () => ({
    meta: [
      { title: "الرسائل | يلا نجهّز" },
      { name: "description", content: "تابعي محادثاتك مع مقدّمي خدمات الأفراح في مكان واحد." },
      { property: "og:title", content: "الرسائل | يلا نجهّز" },
      { property: "og:description", content: "محادثات مباشرة مع مقدّمي خدمات فرحك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  return `قبل ${Math.floor(h / 24)} يوم`;
}

function Page() {
  const { data } = useSuspenseQuery(opts);

  return (
    <Phone>
      <TopBar title="الرسائل" back="/home" />
      <div className="px-5 space-y-2">
        {data.length === 0 && (
          <div className="app-section rounded-2xl p-8 text-center mt-6">
            <MessageCircle className="mx-auto size-10 text-[color:var(--color-primary)]/60" />
            <p className="font-display font-bold mt-3">لا توجد محادثات بعد</p>
            <p className="text-xs text-muted-foreground mt-1">
              ابدئي محادثة من صفحة أي مقدّم خدمة للاستفسار عن التفاصيل.
            </p>
            <Link
              to="/categories"
              className="inline-block mt-4 rounded-full gradient-pink text-white font-bold px-5 py-2.5 text-xs"
            >
              تصفّحي التصنيفات
            </Link>
          </div>
        )}
        {(data as any[]).map((c, i) => (
          <Link
            key={c.id}
            to="/messages/$id"
            params={{ id: c.id }}
            className="app-section rounded-2xl p-3 flex items-center gap-3 animate-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <img src={c.vendors?.image_url} alt="" className="size-12 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm truncate">{c.vendors?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {c.last_message || "ابدئي المحادثة…"}
              </p>
            </div>
            <div className="text-left shrink-0">
              <p className="text-[10px] text-muted-foreground">{timeAgo(c.last_message_at)}</p>
              {c.unread_user > 0 && (
                <span className="mt-1 inline-grid place-items-center size-5 rounded-full gradient-pink text-white text-[10px] font-bold">
                  {c.unread_user}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="h-4" />
      <BottomNav />
    </Phone>
  );
}
