import { type ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronRight, Home as HomeIcon, Grid3x3, Calendar, Heart, User } from "lucide-react";

export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[480px] min-h-screen flex flex-col bg-card relative ${className}`}>
      {children}
    </div>
  );
}

export function TopBar({
  title,
  back,
  action,
  variant = "default",
}: {
  title?: string;
  back?: boolean | string;
  action?: ReactNode;
  variant?: "default" | "transparent";
}) {
  const router = useRouter();
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${variant === "transparent" ? "" : ""}`}>
      {back ? (
        <button
          onClick={() => (typeof back === "string" ? router.navigate({ to: back as any }) : router.history.back())}
          className="size-10 rounded-full app-pill grid place-items-center hover:scale-105 transition"
          aria-label="رجوع"
        >
          <ChevronRight className="size-4" />
        </button>
      ) : (
        <span className="size-10" />
      )}
      <h1 className="font-display font-bold text-lg">{title}</h1>
      <div className="size-10 grid place-items-center">{action}</div>
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
    <div className="sticky bottom-0 mt-auto z-40">
      <div className="mx-3 mb-3 rounded-[2rem] backdrop-blur-xl bg-card/85 border border-[color:var(--color-border)]/70 shadow-[0_22px_50px_-22px_rgb(35_54_96/0.25)]">
        <div className="grid grid-cols-5 px-2 pt-2 pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="flex flex-col items-center gap-1 py-2 text-muted-foreground"
              >
                {({ isActive }) => (
                  <>
                    <span className={`grid place-items-center size-9 rounded-2xl transition-all ${isActive ? "gradient-pink shadow-[0_10px_20px_-10px_rgb(244_123_165/0.7)]" : ""}`}>
                      <Icon className={`size-[18px] ${isActive ? "text-white" : "text-muted-foreground"}`} />
                    </span>
                    <span className={`text-[10px] ${isActive ? "font-bold text-[color:var(--color-primary)]" : ""}`}>
                      {t.label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PrimaryBtn({ children, onClick, type = "button", disabled, className = "" }: {
  children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; className?: string;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`app-primary-btn w-full rounded-full py-3.5 font-display font-bold text-base disabled:opacity-60 ${className}`}>
      {children}
    </button>
  );
}

export function OutlineBtn({ children, onClick, type = "button", className = "" }: {
  children: ReactNode; onClick?: () => void; type?: "button" | "submit"; className?: string;
}) {
  return (
    <button type={type} onClick={onClick}
      className={`app-outline-btn w-full rounded-full py-3.5 font-display font-semibold text-base ${className}`}>
      {children}
    </button>
  );
}

export function BrandLogo({ size = 48 }: { size?: number }) {
  // Recreate the kit's gold heart + pink diamond mark
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <defs>
        <linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C170" />
          <stop offset="50%" stopColor="#C99A45" />
          <stop offset="100%" stopColor="#E8C170" />
        </linearGradient>
        <linearGradient id="diaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F47BA5" />
          <stop offset="100%" stopColor="#E0507F" />
        </linearGradient>
      </defs>
      {/* halo ring */}
      <ellipse cx="50" cy="22" rx="18" ry="5" stroke="url(#goldG)" strokeWidth="2.4" fill="none" />
      {/* diamond */}
      <path d="M50 12 L56 19 L50 26 L44 19 Z" fill="url(#diaG)" />
      {/* heart curl */}
      <path d="M28 78 C20 62 32 44 50 56 C68 44 80 60 72 76 C66 86 52 92 50 82 C48 90 40 90 32 84" stroke="url(#goldG)" strokeWidth="5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <BrandLogo size={size} />
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-[18px] text-[color:var(--color-primary)]">يلا نجهّز</span>
        <span className="text-[9px] text-muted-foreground">كل تجهيزات فرحتك بمكان واحد</span>
      </div>
    </div>
  );
}

export const fmt = (n: number | string) => Number(n).toLocaleString("ar-EG");
