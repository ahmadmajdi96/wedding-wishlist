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

      <circle cx="50" cy="52" r="34" fill="url(#ynGlow)" />

      {/* halo arch — open crown over the mark */}
      <path
        d="M18 46 A32 32 0 0 1 82 46"
        stroke="url(#ynGold)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path d="M50 6 L54.4 13 L50 20 L45.6 13 Z" fill="url(#ynPink)" />
      <circle cx="18" cy="46" r="2.6" fill="url(#ynGold)" />
      <circle cx="82" cy="46" r="2.6" fill="url(#ynGold)" />

      {/* interlocking bands */}
      <circle cx="39" cy="60" r="19" stroke="url(#ynGold)" strokeWidth="4.2" fill="none" />
      <circle cx="61" cy="60" r="19" stroke="url(#ynPink)" strokeWidth="4.2" fill="none" />

      {/* heart cradled at the intersection */}
      <path
        d="M50 76 C42.5 69.5 38 65.4 38 60.4 C38 56.6 40.9 53.8 44.6 53.8 C46.9 53.8 48.9 54.9 50 56.6 C51.1 54.9 53.1 53.8 55.4 53.8 C59.1 53.8 62 56.6 62 60.4 C62 65.4 57.5 69.5 50 76 Z"
        fill="url(#ynPink)"
      />
      <path
        d="M45.4 57.6 C43.6 58.2 42.6 59.4 42.5 61.2"
        stroke="#FFFFFF"
        strokeOpacity="0.75"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* sparks */}
      <path d="M24 74 L25.4 77.4 L28.8 78.8 L25.4 80.2 L24 83.6 L22.6 80.2 L19.2 78.8 L22.6 77.4 Z" fill="url(#ynGold)" opacity="0.85" />
      <path d="M77 70 L78 72.5 L80.5 73.5 L78 74.5 L77 77 L76 74.5 L73.5 73.5 L76 72.5 Z" fill="url(#ynGold)" opacity="0.7" />
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
