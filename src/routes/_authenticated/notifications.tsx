import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Bell, Calendar, Check, Gift, MessageCircle, Sparkles } from "lucide-react";
import { listNotifications, markAllNotificationsRead } from "@/lib/user.functions";
import { Phone, TopBar } from "@/components/app/Shell";

const ICONS: Record<string, any> = {
  booking: Check,
  promo: Gift,
  message: MessageCircle,
  reminder: Calendar,
  welcome: Sparkles,
  info: Bell,
};

const opts = queryOptions({ queryKey: ["notifications"], queryFn: () => listNotifications() });

export const Route = createFileRoute("/_authenticated/notifications")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const markFn = useServerFn(markAllNotificationsRead);
  const mark = useMutation({
    mutationFn: () => markFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  useEffect(() => {
    if (data.some((n: any) => !n.read_at)) mark.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Phone>
      <TopBar title="الإشعارات" back="/home" />
      <div className="px-5 space-y-2.5 pb-6">
        {data.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">لا توجد إشعارات</p>}
        {data.map((n: any) => {
          const Icon = ICONS[n.kind] ?? Bell;
          return (
            <div key={n.id} className="app-section rounded-2xl p-3 flex items-start gap-3">
              <span className="size-10 rounded-xl app-icon-chip grid place-items-center shrink-0">
                <Icon className="size-4 text-[color:var(--color-primary)]" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-sm">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Phone>
  );
}
