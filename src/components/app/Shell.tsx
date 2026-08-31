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
  // Monogram mark: an arch of two interlocking wedding bands cradling a heart,
  // crowned by a gold halo and a single diamond spark.
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <defs>
        <linearGradient id="ynGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0D69A" />
          <stop offset="45%" stopColor="#C99A45" />
          <stop offset="100%" stopColor="#EFCE86" />
        </linearGradient>
        <linearGradient id="ynPink" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FBA8C3" />
          <stop offset="55%" stopColor="#F47BA5" />
          <stop offset="100%" stopColor="#DB4A79" />
        </linearGradient>
        <radialGradient id="ynGlow" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0%" stopColor="#FFF6F9" />
          <stop offset="100%" stopColor="#FFF6F9" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="54" r="34" fill="url(#ynGlow)" />

      {/* halo arch — open crown over the mark */}
      <path
        d="M20 52 A31 31 0 0 1 80 52"
        stroke="url(#ynGold)"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path d="M50 13.5 L54 20.5 L50 27.5 L46 20.5 Z" fill="url(#ynPink)" />
      <circle cx="20" cy="52" r="2.4" fill="url(#ynGold)" />
      <circle cx="80" cy="52" r="2.4" fill="url(#ynGold)" />

      {/* interlocking bands */}
      <circle cx="40" cy="62" r="16" stroke="url(#ynGold)" strokeWidth="3.6" fill="none" />
      <circle cx="60" cy="62" r="16" stroke="url(#ynPink)" strokeWidth="3.6" fill="none" />

      {/* heart cradled at the intersection */}
      <circle cx="50" cy="63" r="11" fill="#FFFFFF" opacity="0.92" />
      <path
        d="M50 71.5 C44.6 66.8 41.4 63.8 41.4 60.2 C41.4 57.4 43.5 55.4 46.2 55.4 C47.8 55.4 49.2 56.2 50 57.4 C50.8 56.2 52.2 55.4 53.8 55.4 C56.5 55.4 58.6 57.4 58.6 60.2 C58.6 63.8 55.4 66.8 50 71.5 Z"
        fill="url(#ynPink)"
      />

      <path
        d="M46.6 58.4 C45.3 58.9 44.6 59.8 44.6 61"
        stroke="#FFFFFF"
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* sparks */}
      <path d="M17 78 L18.2 81 L21.2 82.2 L18.2 83.4 L17 86.4 L15.8 83.4 L12.8 82.2 L15.8 81 Z" fill="url(#ynGold)" opacity="0.85" />
      <path d="M84 76 L84.9 78.2 L87.1 79.1 L84.9 80 L84 82.2 L83.1 80 L80.9 79.1 L83.1 78.2 Z" fill="url(#ynGold)" opacity="0.65" />

    </svg>
  );
}

export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <BrandLogo size={size} />
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-[18px] text-[color:var(--color-primary)]">
          يلا نجهّز
        </span>
        <span className="text-[9px] tracking-[0.06em] text-muted-foreground">
          كل تجهيزات فرحتك بمكان واحد
        </span>
      </div>
    </div>
  );
}


export const fmt = (n: number | string) => Number(n).toLocaleString("ar-EG");
