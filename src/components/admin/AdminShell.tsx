import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Store,
  Grid3x3,
  CalendarCheck,
  CalendarDays,
  LayoutTemplate,
  Users,
  ArrowLeftRight,
} from "lucide-react";
import { BrandLogo } from "@/components/app/Shell";

const NAV = [
  { to: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { to: "/admin/home", label: "محتوى الرئيسية", icon: LayoutTemplate },
  { to: "/admin/vendors", label: "مقدّمو الخدمات", icon: Store },
  { to: "/admin/categories", label: "التصنيفات", icon: Grid3x3 },
  { to: "/admin/bookings", label: "الحجوزات", icon: CalendarCheck },
  { to: "/admin/schedule", label: "جدول الحجوزات", icon: CalendarDays },
  { to: "/admin/users", label: "المستخدمون", icon: Users },
] as const;


export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-[color:var(--color-muted)]/40 flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2 border-l border-[color:var(--color-border)] bg-card p-4">
        <div className="flex items-center gap-2 px-2 pb-4">
          <BrandLogo size={34} />
          <div>
            <p className="font-display font-bold text-[color:var(--color-primary)]">يلا نجهّز</p>
            <p className="text-[10px] text-muted-foreground">لوحة الإدارة</p>
          </div>
        </div>
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: "exact" in n ? n.exact : false }}
              className="rounded-2xl px-3 py-2.5 flex items-center gap-2.5 text-sm text-muted-foreground hover:bg-[color:var(--color-muted)] transition"
              activeProps={{
                className:
                  "rounded-2xl px-3 py-2.5 flex items-center gap-2.5 text-sm gradient-pink text-white font-bold shadow-[0_10px_24px_-14px_rgb(244_123_165/0.9)]",
              }}
            >
              <Icon className="size-4" />
              {n.label}
            </Link>
          );
        })}
        <Link
          to="/home"
          className="mt-auto rounded-2xl px-3 py-2.5 flex items-center gap-2.5 text-sm text-muted-foreground hover:bg-[color:var(--color-muted)]"
        >
          <ArrowLeftRight className="size-4" /> العودة للتطبيق
        </Link>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-card/85 backdrop-blur-xl border-b border-[color:var(--color-border)] px-5 py-4">
          <h1 className="font-display font-bold text-xl">{title}</h1>
        </header>
        <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 bg-card border-b border-[color:var(--color-border)]">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: "exact" in n ? n.exact : false }}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs app-pill"
              activeProps={{ className: "shrink-0 rounded-full px-3 py-1.5 text-xs gradient-pink text-white font-bold" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-2xl border border-[color:var(--color-border)] p-4 ${className}`}>
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-[color:var(--color-border)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--color-primary)]";
