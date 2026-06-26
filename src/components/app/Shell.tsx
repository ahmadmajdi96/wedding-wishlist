import { type ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronRight, Home as HomeIcon, Grid3x3, Calendar, Heart, User } from "lucide-react";

export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[480px] min-h-screen flex flex-col bg-card ${className}`}>
      {children}
    </div>
  );
}

export function TopBar({
  title,
  back,
  action,
}: {
  title?: string;
  back?: boolean | string;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 py-4">
      {back ? (
        <button
          onClick={() => (typeof back === "string" ? router.navigate({ to: back as any }) : router.history.back())}
          className="size-9 rounded-full app-pill grid place-items-center"
          aria-label="رجوع"
        >
          <ChevronRight className="size-4" />
        </button>
      ) : (
        <span className="size-9" />
      )}
      <h1 className="font-display font-bold text-lg">{title}</h1>
      <div className="size-9 grid place-items-center">{action}</div>
    </div>
  );
}

const TABS = [
  { to: "/account", label: "حسابي", icon: User },
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/bookings", label: "حجوزاتي", icon: Calendar },
  { to: "/categories", label: "التصنيفات", icon: Grid3x3 },
  { to: "/home", label: "الرئيسية", icon: HomeIcon },
] as const;

export function BottomNav() {
  return (
    <div className="sticky bottom-0 mt-auto bg-card/95 backdrop-blur border-t border-[color:var(--color-border)]/60 z-40">
      <div className="grid grid-cols-5 px-2 pt-2 pb-3 max-w-[480px] mx-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.to === "/home" ? false : false }}
              className="flex flex-col items-center gap-1 py-1 text-muted-foreground data-[status=active]:text-[color:var(--color-primary)]"
            >
              {({ isActive }) => (
                <>
                  <Icon className={`size-5 ${isActive ? "text-[color:var(--color-primary)]" : ""}`} />
                  <span className={`text-[11px] ${isActive ? "font-bold text-[color:var(--color-primary)]" : ""}`}>
                    {t.label}
                  </span>
                  {isActive && <span className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]" />}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PrimaryBtn({
  children,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`app-primary-btn w-full rounded-full py-3.5 font-display font-bold text-base disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function OutlineBtn({
  children,
  onClick,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`app-outline-btn w-full rounded-full py-3.5 font-display font-semibold text-base ${className}`}
    >
      {children}
    </button>
  );
}

export function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
        <path
          d="M32 12c-2 0-4 1.4-5 3.2-1-1.8-3-3.2-5-3.2-3.6 0-6 2.7-6 6 0 5 5 9 16 16 11-7 16-11 16-16 0-3.3-2.4-6-6-6-2 0-4 1.4-5 3.2C36 13.4 34 12 32 12z"
          fill="var(--color-accent)"
        />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-[20px] text-[color:var(--color-primary)]">يلا نجهّز</span>
        <span className="text-[10px] text-muted-foreground">كل تجهيزات فرحتك بمكان واحد</span>
      </div>
    </div>
  );
}

export const fmt = (n: number | string) => Number(n).toLocaleString("ar-EG");
