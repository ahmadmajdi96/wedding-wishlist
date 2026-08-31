import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { User, Calendar, Settings, Lock, MessageCircle, LogOut, ChevronLeft, Sparkles, Bookmark, Bell, ShieldCheck, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile } from "@/lib/user.functions";
import { amIAdmin } from "@/lib/admin.functions";
import { BottomNav, Phone, TopBar } from "@/components/app/Shell";

import bridePortrait from "@/assets/bride-portrait.jpg";

const opts = queryOptions({ queryKey: ["me"], queryFn: () => getMyProfile() });

export const Route = createFileRoute("/_authenticated/account/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data: me } = useSuspenseQuery(opts);
  const nav = useNavigate();
  const qc = useQueryClient();
  const admin = useQuery({ queryKey: ["am-i-admin"], queryFn: () => amIAdmin() });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  const items = [
    { to: "/account/profile", icon: User, label: "الملف الشخصي" },
    { to: "/bookings", icon: Calendar, label: "بيانات الحجز" },
    { to: "/favorites", icon: Bookmark, label: "المفضلة" },
    { to: "/notifications", icon: Bell, label: "الإشعارات" },
    { to: "/search", icon: Search, label: "البحث المتقدم" },
  ] as const;


  return (
    <Phone>
      <TopBar title="الحساب" back="/home" />
      <div className="px-5">
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0D2340, #1d3a6b)" }}>
          <button className="absolute top-3 right-3 size-8 rounded-full bg-white/15 grid place-items-center">
            <Settings className="size-4" />
          </button>
          <div className="flex flex-col items-center text-center">
            <img src={me?.avatar_url || bridePortrait} alt="" className="size-20 rounded-full object-cover border-2 border-white/30" />
            <p className="font-display font-bold text-lg mt-2">{me?.full_name || "ضيفة"}</p>
            <p className="text-xs opacity-80">{me?.phone || "—"}</p>
            <span className="text-[10px] rounded-full bg-[color:var(--color-accent)] text-foreground px-2 py-0.5 mt-2 flex items-center gap-1">
              <Sparkles className="size-3" /> عضوة مميزة
            </span>
          </div>
        </div>

        <div className="app-section rounded-2xl mt-4 divide-y divide-border">
          {items.map((it) => (
            <Link key={it.to} to={it.to} className="w-full flex items-center justify-between px-4 py-3.5 text-right">
              <span className="flex items-center gap-3">
                <it.icon className="size-4 text-[color:var(--color-primary)]" />
                <span className="text-sm font-semibold">{it.label}</span>
              </span>
              <ChevronLeft className="size-4 text-muted-foreground" />
            </Link>
          ))}
          {admin.data?.isAdmin && (
            <Link to="/admin" className="w-full flex items-center justify-between px-4 py-3.5 text-right">
              <span className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-[color:var(--color-primary)]" />
                <span className="text-sm font-semibold">لوحة الإدارة</span>
              </span>
              <ChevronLeft className="size-4 text-muted-foreground" />
            </Link>
          )}

          <Link to="/reset-password" className="w-full flex items-center justify-between px-4 py-3.5 text-right">
            <span className="flex items-center gap-3">
              <Lock className="size-4 text-[color:var(--color-primary)]" />
              <span className="text-sm font-semibold">الخصوصية والأمان</span>
            </span>
            <ChevronLeft className="size-4 text-muted-foreground" />
          </Link>
          <div className="w-full flex items-center justify-between px-4 py-3.5 text-right">
            <span className="flex items-center gap-3">
              <MessageCircle className="size-4 text-[color:var(--color-primary)]" />
              <span className="text-sm font-semibold">مركز المساعدة</span>
            </span>
            <ChevronLeft className="size-4 text-muted-foreground" />
          </div>
          <button onClick={signOut} className="w-full flex items-center justify-between px-4 py-3.5 text-right text-[color:var(--color-primary)]">
            <span className="flex items-center gap-3">
              <LogOut className="size-4" />
              <span className="text-sm font-bold">تسجيل الخروج</span>
            </span>
          </button>
        </div>
      </div>
      <div className="h-4" />
      <BottomNav />
    </Phone>
  );
}
