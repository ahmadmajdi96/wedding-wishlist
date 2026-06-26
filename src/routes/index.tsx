import { createFileRoute } from "@tanstack/react-router";
import {
  Bell, Search, Sparkles, Camera, Shirt, Gem, Calendar, Check, ChevronRight, ChevronLeft,
  Building2, Gift, MapPin, Star, Heart, Home as HomeIcon, User, Grid3x3, Bookmark,
  Mail, Lock, Eye, EyeOff, ArrowRight, Filter, SlidersHorizontal, Phone, Wallet,
  Settings, LogOut, ChevronDown, Plus, ImageIcon, MessageCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import bridePortrait from "@/assets/bride-portrait.jpg";
import weddingHallLuxury from "@/assets/wedding-hall-luxury.jpg";
import weddingHallFloral from "@/assets/wedding-hall-floral.jpg";
import giftPromo from "@/assets/gift-promo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "يلا نجهّز | تطبيق العملاء" },
      { name: "description", content: "تطبيق عربي يربطك بأفضل مزودي خدمات الزفاف: قاعات، فساتين، مصورين، ضيافة وأكثر — في مكان واحد." },
      { property: "og:title", content: "يلا نجهّز" },
      { property: "og:description", content: "كل تجهيزات فرحتك في مكان واحد." },
    ],
  }),
  component: App,
});

// ---------- Types & constants ----------
type Screen =
  | "splash" | "onboarding" | "preferences" | "signup" | "login" | "otp"
  | "home" | "categories" | "vendors" | "vendor" | "plan" | "bookings"
  | "favorites" | "notifications" | "account";

type Vendor = {
  id: number; name: string; city: string; image: string;
  rating: number; reviews: number; price: number; category: string;
};

const STYLES = [
  { id: "classic", label: "كلاسيكي", img: weddingHallLuxury },
  { id: "romantic", label: "رومانسي", img: weddingHallFloral },
  { id: "modern", label: "مودرن", img: weddingHallLuxury },
  { id: "luxe", label: "فخم", img: weddingHallFloral },
  { id: "boho", label: "بوهيمي", img: weddingHallLuxury },
  { id: "beach", label: "شاطئي", img: weddingHallFloral },
];

const CATEGORIES = [
  { id: "halls", label: "القاعات", icon: Building2, count: "+120", tint: "var(--soft-rose)" },
  { id: "dresses", label: "الفساتين", icon: Sparkles, count: "+250", tint: "var(--soft-rose)" },
  { id: "photo", label: "المصورون", icon: Camera, count: "+180", tint: "var(--soft-blue)" },
  { id: "catering", label: "الضيافة", icon: Gift, count: "+90", tint: "var(--gold-soft)" },
  { id: "jewelry", label: "المجوهرات", icon: Gem, count: "+75", tint: "var(--gold-soft)" },
  { id: "beauty", label: "التجميل", icon: Heart, count: "+60", tint: "var(--soft-rose)" },
  { id: "cars", label: "السيارات", icon: Wallet, count: "+45", tint: "var(--soft-blue)" },
  { id: "invites", label: "الدعوات", icon: Mail, count: "+35", tint: "var(--success-soft)" },
];

const VENDORS: Vendor[] = [
  { id: 1, name: "قاعة ليان", city: "الرياض - العليا", image: weddingHallLuxury, rating: 4.8, reviews: 120, price: 25000, category: "halls" },
  { id: 2, name: "قاعة روز", city: "الرياض - السليمانية", image: weddingHallFloral, rating: 4.7, reviews: 98, price: 18500, category: "halls" },
  { id: 3, name: "قاعة بلوم", city: "الرياض - النخيل", image: weddingHallLuxury, rating: 4.6, reviews: 76, price: 22000, category: "halls" },
  { id: 4, name: "مصور نور", city: "الرياض", image: bridePortrait, rating: 4.9, reviews: 210, price: 6500, category: "photo" },
];

const TASKS = [
  { id: 1, label: "حجز القاعة", status: "done" },
  { id: 2, label: "حجز المصور", status: "done" },
  { id: 3, label: "اختيار الفستان", status: "pending" },
  { id: 4, label: "قيد التنفيذ — تجربة المكياج", status: "progress" },
  { id: 5, label: "إرسال الدعوات", status: "todo" },
  { id: 6, label: "تنسيق الزهور", status: "todo" },
];

const NOTIFICATIONS = [
  { id: 1, title: "تم تأكيد الحجز", desc: "تم تأكيد حجزك في قاعة ليان", time: "منذ 5 دقائق", icon: Check },
  { id: 2, title: "عرض جديد يناسب ذوقك", desc: "تشكيلة فساتين جديدة بانتظارك", time: "منذ 30 دقيقة", icon: Sparkles },
  { id: 3, title: "تذكير بموعد", desc: "تبقى 30 يوم على موعد زفافك", time: "منذ ساعة", icon: Calendar },
  { id: 4, title: "رسالة جديدة", desc: "لديك رسالة جديدة من مصور نور", time: "منذ ساعتين", icon: MessageCircle },
  { id: 5, title: "خصم خاص لك", desc: "20% خصم على باقات الديكور", time: "منذ 3 ساعات", icon: Gift },
];

// ---------- Helpers ----------
const fmt = (n: number) => n.toLocaleString("ar-EG");

// ---------- Brand mark ----------
function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M32 12c-2 0-4 1.4-5 3.2-1-1.8-3-3.2-5-3.2-3.6 0-6 2.7-6 6 0 5 5 9 16 16 11-7 16-11 16-16 0-3.3-2.4-6-6-6-2 0-4 1.4-5 3.2C36 13.4 34 12 32 12z"
          fill="var(--color-accent)" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-[20px] text-[color:var(--color-primary)]">يلا نجهّز</span>
        <span className="text-[10px] text-muted-foreground">كل تجهيزات فرحتك بمكان واحد</span>
      </div>
    </div>
  );
}

// ---------- Phone shell ----------
function Phone({ children, hideStatus = false }: { children: React.ReactNode; hideStatus?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[420px] min-h-screen flex flex-col bg-card">
      {!hideStatus && (
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-foreground/70">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span>●●●●</span><span>📶</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function TopBar({ title, onBack, action }: { title: string; onBack?: () => void; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <button onClick={onBack} className="size-9 rounded-full app-pill grid place-items-center" aria-label="رجوع">
        <ChevronRight className="size-4" />
      </button>
      <h1 className="font-display font-bold text-lg">{title}</h1>
      <div className="size-9 grid place-items-center">{action}</div>
    </div>
  );
}

function BottomNav({ active, onChange }: { active: Screen; onChange: (s: Screen) => void }) {
  const items: { id: Screen; label: string; icon: any }[] = [
    { id: "account", label: "حسابي", icon: User },
    { id: "favorites", label: "المفضلة", icon: Heart },
    { id: "plan", label: "حجوزاتي", icon: Calendar },
    { id: "categories", label: "التصنيفات", icon: Grid3x3 },
    { id: "home", label: "الرئيسية", icon: HomeIcon },
  ];
  return (
    <div className="sticky bottom-0 mt-auto bg-card/95 backdrop-blur border-t border-[color:var(--color-border)]/60">
      <div className="grid grid-cols-5 px-2 pt-2 pb-3">
        {items.map((it) => {
          const Icon = it.icon;
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onChange(it.id)}
              className="flex flex-col items-center gap-1 py-1">
              <Icon className={`size-5 ${on ? "text-[color:var(--color-primary)]" : "text-muted-foreground"}`} />
              <span className={`text-[11px] ${on ? "text-[color:var(--color-primary)] font-bold" : "text-muted-foreground"}`}>
                {it.label}
              </span>
              {on && <span className="h-1 w-1 rounded-full bg-[color:var(--color-primary)]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PrimaryBtn({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick}
      className={`app-primary-btn w-full rounded-full py-3.5 font-display font-bold text-base ${className}`}>
      {children}
    </button>
  );
}
function OutlineBtn({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick}
      className={`app-outline-btn w-full rounded-full py-3.5 font-display font-semibold text-base ${className}`}>
      {children}
    </button>
  );
}

// ---------- SCREENS ----------

function Splash({ go }: { go: (s: Screen) => void }) {
  return (
    <Phone hideStatus>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center"
        style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--color-soft-rose) 60%, white), white)" }}>
        <div className="mb-8"><BrandMark size={80} /></div>
        <p className="text-muted-foreground text-sm max-w-xs mb-12">
          من اختيار الفستان حتى تنظيم يوم الزفاف، نحن معكِ في كل خطوة
        </p>
        <div className="w-full space-y-3 max-w-xs">
          <PrimaryBtn onClick={() => go("onboarding")}>ابدئي الآن</PrimaryBtn>
          <button onClick={() => go("login")} className="text-sm text-[color:var(--color-primary)] font-bold">
            تسجيل الدخول
          </button>
        </div>
      </div>
    </Phone>
  );
}

function Onboarding({ go }: { go: (s: Screen) => void }) {
  return (
    <Phone>
      <div className="flex items-center justify-between px-5 py-2">
        <button onClick={() => go("signup")} className="text-sm text-muted-foreground">تخطي</button>
        <BrandMark size={36} />
      </div>
      <div className="px-6 pt-2 text-center">
        <h2 className="font-display font-bold text-3xl text-[color:var(--color-primary)]">فرحتكِ</h2>
        <h2 className="font-display font-bold text-3xl text-[color:var(--color-primary)] mb-3">من هنا</h2>
        <p className="text-sm text-muted-foreground px-6 mb-6">
          اكتشفي أفضل القاعات والمصورين ومصممي الفساتين وكل ما تحتاجينه لأجمل يوم في حياتكِ
        </p>
      </div>
      <div className="px-6 flex-1">
        <div className="relative rounded-[2rem] overflow-hidden app-section">
          <img src={bridePortrait} alt="عروس" className="w-full h-[340px] object-cover" />
          <button className="absolute bottom-4 left-4 size-10 rounded-full bg-white/90 grid place-items-center">
            <Heart className="size-5 text-[color:var(--color-primary)]" />
          </button>
        </div>
        <div className="flex justify-center gap-1.5 mt-5">
          <span className="h-1.5 w-6 rounded-full bg-[color:var(--color-primary)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        </div>
      </div>
      <div className="p-6 space-y-3">
        <PrimaryBtn onClick={() => go("preferences")}>لنبدأ رحلتنا</PrimaryBtn>
        <OutlineBtn onClick={() => go("login")}>تسجيل الدخول</OutlineBtn>
      </div>
    </Phone>
  );
}

function Preferences({ go }: { go: (s: Screen) => void }) {
  const [picked, setPicked] = useState<string[]>(["romantic"]);
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <Phone>
      <TopBar title="اختاري الأسلوب" onBack={() => go("onboarding")} />
      <div className="px-6 pb-4">
        <h2 className="font-display font-bold text-xl text-center">ما هو أسلوب زفافكِ المفضل؟</h2>
        <p className="text-sm text-muted-foreground text-center mt-1 mb-5">
          اختاري ما يعكس ذوقكِ لنقدم لكِ أفضل الاقتراحات
        </p>
        <div className="grid grid-cols-2 gap-3">
          {STYLES.map((s) => {
            const on = picked.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggle(s.id)}
                className={`relative rounded-2xl overflow-hidden h-32 app-section ${on ? "ring-2 ring-[color:var(--color-primary)]" : ""}`}>
                <img src={s.img} className="absolute inset-0 w-full h-full object-cover opacity-90" alt={s.label} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 right-3 text-white font-display font-bold">{s.label}</span>
                {on && (
                  <span className="absolute top-2 left-2 size-6 rounded-full bg-[color:var(--color-primary)] grid place-items-center">
                    <Check className="size-3.5 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-6 mt-auto">
        <PrimaryBtn onClick={() => go("signup")}>التالي</PrimaryBtn>
      </div>
    </Phone>
  );
}

function Signup({ go }: { go: (s: Screen) => void }) {
  const [show, setShow] = useState(false);
  return (
    <Phone>
      <TopBar title="إنشاء حساب" onBack={() => go("preferences")} />
      <div className="px-6 text-center">
        <BrandMark size={48} />
        <h2 className="font-display font-bold text-2xl mt-4">إنشاء حساب جديد</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-5">ابدئي رحلتكِ معنا لتنظيم زفافكِ المثالي</p>
      </div>
      <div className="px-6 space-y-3">
        <Field icon={User} placeholder="الاسم الكامل" />
        <Field icon={Mail} placeholder="البريد الإلكتروني" />
        <div className="flex gap-2">
          <button className="app-pill rounded-2xl px-3 flex items-center gap-1 text-sm shrink-0">🇸🇦 +966 <ChevronDown className="size-3" /></button>
          <Field icon={Phone} placeholder="رقم الجوال" />
        </div>
        <Field icon={Lock} placeholder="كلمة المرور" type={show ? "text" : "password"}
          trailing={
            <button onClick={() => setShow((s) => !s)}>
              {show ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
            </button>
          } />
        <label className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
          <input type="checkbox" className="mt-0.5 accent-[color:var(--color-primary)]" defaultChecked />
          <span>أوافق على الشروط والأحكام وسياسة الخصوصية</span>
        </label>
      </div>
      <div className="p-6 space-y-3">
        <PrimaryBtn onClick={() => go("otp")}>إنشاء حساب</PrimaryBtn>
        <p className="text-center text-sm text-muted-foreground">
          لديكِ حساب بالفعل؟{" "}
          <button onClick={() => go("login")} className="text-[color:var(--color-primary)] font-bold">تسجيل الدخول</button>
        </p>
      </div>
    </Phone>
  );
}

function Login({ go }: { go: (s: Screen) => void }) {
  return (
    <Phone>
      <TopBar title="تسجيل الدخول" onBack={() => go("splash")} />
      <div className="px-6 text-center">
        <BrandMark size={48} />
        <h2 className="font-display font-bold text-2xl mt-4">مرحباً بعودتكِ</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-5">سجّلي الدخول لمتابعة تخطيط زفافكِ</p>
      </div>
      <div className="px-6 space-y-3">
        <Field icon={Mail} placeholder="البريد الإلكتروني أو رقم الجوال" />
        <Field icon={Lock} placeholder="كلمة المرور" type="password" trailing={<Eye className="size-4 text-muted-foreground" />} />
        <div className="text-left">
          <button className="text-xs text-[color:var(--color-primary)] font-bold">نسيتِ كلمة المرور؟</button>
        </div>
      </div>
      <div className="px-6 mt-4">
        <PrimaryBtn onClick={() => go("home")}>تسجيل الدخول</PrimaryBtn>
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">أو سجّلي الدخول باستخدام</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => go("home")} className="app-pill rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-sm">
            <svg viewBox="0 0 24 24" className="size-4"><path fill="#4285F4" d="M23 12.3c0-.9-.1-1.5-.2-2.2H12v4h6.3c-.1 1-.8 2.6-2.4 3.6l-.02.15 3.5 2.7.24.02C21.7 18.7 23 15.8 23 12.3z"/><path fill="#34A853" d="M12 23c3.2 0 5.9-1.05 7.8-2.85l-3.7-2.9c-1 .7-2.3 1.2-4.1 1.2-3.1 0-5.8-2.05-6.7-4.9l-.14.01-3.65 2.83-.05.13C3.3 20.5 7.3 23 12 23z"/><path fill="#FBBC05" d="M5.3 13.55c-.2-.65-.35-1.35-.35-2.05s.13-1.4.34-2.05l-.01-.14L1.58 6.43l-.13.06A11.05 11.05 0 0 0 .25 11.5c0 1.75.4 3.4 1.2 4.85l3.85-2.8z"/><path fill="#EA4335" d="M12 4.55c2.2 0 3.7.95 4.55 1.75l3.3-3.2C17.85 1.25 15.2.25 12 .25 7.3.25 3.3 2.75 1.45 6.5l3.85 2.95C6.2 6.6 8.9 4.55 12 4.55z"/></svg>
            Google
          </button>
          <button onClick={() => go("home")} className="app-pill rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-sm">
            <Mail className="size-4" /> البريد
          </button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-5">
          ليس لديكِ حساب؟{" "}
          <button onClick={() => go("signup")} className="text-[color:var(--color-primary)] font-bold">إنشاء حساب جديد</button>
        </p>
      </div>
    </Phone>
  );
}

function Field({ icon: Icon, placeholder, type = "text", trailing }: { icon: any; placeholder: string; type?: string; trailing?: React.ReactNode }) {
  return (
    <div className="app-pill rounded-2xl flex items-center gap-3 px-4 py-3">
      <Icon className="size-4 text-muted-foreground" />
      <input type={type} placeholder={placeholder} className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
      {trailing}
    </div>
  );
}

function Otp({ go }: { go: (s: Screen) => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  return (
    <Phone>
      <TopBar title="تأكيد رقم الجوال" onBack={() => go("signup")} />
      <div className="px-6 text-center flex-1 flex flex-col">
        <div className="my-8 grid place-items-center">
          <div className="size-32 rounded-full grid place-items-center" style={{ background: "var(--soft-rose)" }}>
            <Phone className="size-12 text-[color:var(--color-primary)]" />
          </div>
        </div>
        <h2 className="font-display font-bold text-xl">أدخلي رمز التحقق</h2>
        <p className="text-sm text-muted-foreground mt-1">
          تم إرسال رمز التحقق إلى<br /><span className="font-bold text-foreground">+966 50 123 4567</span>
        </p>
        <button className="text-xs text-[color:var(--color-primary)] font-bold mt-1">تعديل</button>
        <div dir="ltr" className="flex justify-center gap-2 mt-6">
          {digits.map((d, i) => (
            <input key={i} value={d} maxLength={1}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setDigits((arr) => arr.map((x, j) => (i === j ? v : x)));
              }}
              className="size-12 rounded-2xl app-pill text-center font-bold text-lg outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]" />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          لم يصلكِ الرمز؟ <span className="text-[color:var(--color-primary)] font-bold">إعادة إرسال (00:45)</span>
        </p>
      </div>
      <div className="p-6">
        <PrimaryBtn onClick={() => go("home")}>تأكيد</PrimaryBtn>
      </div>
    </Phone>
  );
}

function Home({ go, tab, setTab }: { go: (s: Screen) => void; tab: Screen; setTab: (s: Screen) => void }) {
  return (
    <Phone>
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <button onClick={() => go("notifications")} className="relative size-10 rounded-full app-pill grid place-items-center">
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-2 rounded-full bg-[color:var(--color-primary)]" />
        </button>
        <BrandMark size={40} />
        <button className="app-pill rounded-full px-3 py-1.5 flex items-center gap-1 text-xs">
          <MapPin className="size-3 text-[color:var(--color-primary)]" /> الرياض
        </button>
      </div>

      <div className="px-5 mb-3">
        <div className="app-pill rounded-2xl flex items-center gap-3 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="ابحثي عن قاعة، مصور، خدمة..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
      </div>

      <div className="px-5">
        <div className="relative rounded-3xl overflow-hidden h-44 app-section">
          <img src={weddingHallLuxury} className="absolute inset-0 w-full h-full object-cover" alt="عرض" />
          <div className="absolute inset-0 bg-gradient-to-tl from-black/55 via-black/10 to-transparent" />
          <div className="absolute top-4 right-4 text-white max-w-[60%]">
            <p className="text-[11px] opacity-90">عرض حصري</p>
            <h3 className="font-display font-bold text-lg leading-tight">احجزي قاعتكِ المثالية ليوم لا يُنسى</h3>
            <button onClick={() => go("vendors")} className="mt-2 bg-white text-[color:var(--color-primary)] text-xs font-bold rounded-full px-4 py-1.5">
              اكتشفي الآن
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.slice(0, 4).map((c) => {
            const Icon = c.icon;
            return (
              <button key={c.id} onClick={() => go("categories")} className="flex flex-col items-center gap-1.5">
                <span className="size-14 rounded-2xl grid place-items-center app-icon-chip">
                  <Icon className="size-6 text-[color:var(--color-primary)]" />
                </span>
                <span className="text-[11px] font-semibold">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-6 flex items-center justify-between">
        <h3 className="font-display font-bold">الأكثر طلباً</h3>
        <button onClick={() => go("vendors")} className="text-xs text-[color:var(--color-primary)] font-bold">عرض الكل</button>
      </div>

      <div className="px-5 mt-3 grid grid-cols-2 gap-3 pb-4">
        {VENDORS.slice(0, 2).map((v) => (
          <button key={v.id} onClick={() => go("vendor")} className="app-section rounded-2xl overflow-hidden text-right">
            <div className="relative h-24">
              <img src={v.image} className="w-full h-full object-cover" alt={v.name} />
              <span className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                <Star className="size-3 text-[color:var(--color-accent)] fill-current" /> {v.rating}
              </span>
            </div>
            <div className="p-2.5">
              <p className="font-display font-bold text-sm">{v.name}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="size-3" />{v.city}
              </p>
            </div>
          </button>
        ))}
      </div>

      <BottomNav active={tab} onChange={(s) => { setTab(s); go(s); }} />
    </Phone>
  );
}

function Categories({ go, tab, setTab }: { go: (s: Screen) => void; tab: Screen; setTab: (s: Screen) => void }) {
  return (
    <Phone>
      <div className="flex items-center justify-between px-5 py-4">
        <button className="size-9 rounded-full app-pill grid place-items-center"><ArrowRight className="size-4" /></button>
        <h1 className="font-display font-bold text-lg">التصنيفات</h1>
        <div className="size-9" />
      </div>
      <div className="px-5 grid grid-cols-3 gap-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => go("vendors")} className="app-section rounded-2xl p-3 flex flex-col items-center gap-2">
              <span className="size-12 rounded-xl grid place-items-center" style={{ background: c.tint }}>
                <Icon className="size-5 text-[color:var(--color-primary)]" />
              </span>
              <span className="font-display font-bold text-sm">{c.label}</span>
              <span className="text-[10px] text-muted-foreground">{c.count} مزود</span>
            </button>
          );
        })}
      </div>
      <div className="px-5 mt-5 pb-4">
        <div className="relative rounded-2xl overflow-hidden h-28 app-section">
          <img src={giftPromo} className="absolute inset-0 w-full h-full object-cover" alt="عرض" />
          <div className="absolute inset-0 bg-gradient-to-l from-[color:var(--color-primary)]/85 to-transparent" />
          <div className="absolute top-4 right-4 text-white">
            <p className="font-display font-bold">عروض حصرية</p>
            <p className="text-[11px] opacity-90">خصومات خاصة لفترة محدودة</p>
            <button className="mt-2 bg-white text-[color:var(--color-primary)] text-[11px] font-bold rounded-full px-3 py-1">تسوّقي الآن</button>
          </div>
        </div>
      </div>
      <BottomNav active={tab} onChange={(s) => { setTab(s); go(s); }} />
    </Phone>
  );
}

function Vendors({ go, tab, setTab }: { go: (s: Screen) => void; tab: Screen; setTab: (s: Screen) => void }) {
  return (
    <Phone>
      <TopBar title="القاعات" onBack={() => go("categories")} />
      <div className="px-5 flex gap-2 mb-3">
        <button className="app-pill rounded-full px-3 py-2 flex items-center gap-1.5 text-xs font-semibold">
          <SlidersHorizontal className="size-3.5" /> تصفية
        </button>
        <button className="app-pill rounded-full px-3 py-2 flex items-center gap-1.5 text-xs font-semibold">
          <Filter className="size-3.5" /> الأقرب لي
        </button>
        <button className="app-pill rounded-full px-3 py-2 flex items-center gap-1.5 text-xs font-semibold">
          الأعلى تقييماً
        </button>
      </div>
      <div className="px-5 space-y-3 pb-4">
        {VENDORS.map((v) => (
          <button key={v.id} onClick={() => go("vendor")} className="app-section w-full rounded-2xl p-2.5 flex gap-3 items-center text-right">
            <img src={v.image} alt={v.name} className="size-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold">{v.name}</p>
                <Heart className="size-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="size-3" />{v.city}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs flex items-center gap-1">
                  <Star className="size-3 text-[color:var(--color-accent)] fill-current" />
                  <b>{v.rating}</b> <span className="text-muted-foreground">({v.reviews})</span>
                </span>
                <span className="text-sm font-display font-bold text-[color:var(--color-primary)]">{fmt(v.price)} ر.س</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <BottomNav active={tab} onChange={(s) => { setTab(s); go(s); }} />
    </Phone>
  );
}

function VendorDetails({ go }: { go: (s: Screen) => void }) {
  const [tab, setTab] = useState<"about" | "packages" | "gallery" | "reviews">("about");
  return (
    <Phone>
      <div className="relative h-72">
        <img src={weddingHallLuxury} className="absolute inset-0 w-full h-full object-cover" alt="قاعة" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
        <button onClick={() => go("vendors")} className="absolute top-4 right-4 size-9 rounded-full bg-white/90 grid place-items-center">
          <ChevronRight className="size-4" />
        </button>
        <button className="absolute top-4 left-4 size-9 rounded-full bg-white/90 grid place-items-center">
          <Heart className="size-4 text-[color:var(--color-primary)]" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] rounded-full px-2.5 py-1">1/24</div>
      </div>

      <div className="-mt-6 relative bg-card rounded-t-[2rem] flex-1 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-xl">قاعة ليان</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="size-3" /> الرياض - العليا
            </p>
          </div>
          <span className="text-xs flex items-center gap-1 bg-[color:var(--gold-soft)] rounded-full px-2 py-1">
            <Star className="size-3 fill-current text-[color:var(--color-accent)]" /> <b>4.8</b> (120)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "المساحة", value: "800 م²" },
            { label: "الضيوف", value: "حتى 600" },
            { label: "مواقف", value: "120 موقف" },
          ].map((s) => (
            <div key={s.label} className="app-pill rounded-2xl py-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="font-display font-bold text-sm mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-5 border-b border-border">
          {[
            { id: "about", l: "نبذة" },
            { id: "packages", l: "الباقات" },
            { id: "gallery", l: "المعرض" },
            { id: "reviews", l: "التقييمات" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`pb-2 px-1 text-sm font-semibold ${tab === t.id ? "text-[color:var(--color-primary)] border-b-2 border-[color:var(--color-primary)]" : "text-muted-foreground"}`}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
          قاعة فاخرة بتصميم عصري وموقع مميز في قلب الرياض، مثالية لحفلات الزفاف والمناسبات الكبرى.
          إضاءة كريستالية، مسرح للعروسين، وخدمة ضيافة راقية.
        </div>

        <div className="mt-5 app-section rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">السعر يبدأ من</p>
            <p className="font-display font-bold text-xl text-[color:var(--color-primary)]">25,000 ر.س</p>
            <p className="text-[10px] text-muted-foreground">شامل الضريبة</p>
          </div>
          <button onClick={() => go("plan")} className="app-primary-btn rounded-full px-6 py-3 font-display font-bold">
            احجزي الآن
          </button>
        </div>
      </div>
    </Phone>
  );
}

function Plan({ go, tab, setTab }: { go: (s: Screen) => void; tab: Screen; setTab: (s: Screen) => void }) {
  const done = TASKS.filter(t => t.status === "done").length;
  return (
    <Phone>
      <TopBar title="خطة زفافي" onBack={() => go("home")} action={<Bell className="size-4" />} />
      <div className="px-5">
        <div className="app-section rounded-2xl p-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, var(--soft-rose), white)" }}>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">يوم زفافي</p>
            <p className="font-display font-bold text-sm flex items-center gap-1 mt-1">
              <Calendar className="size-3.5 text-[color:var(--color-primary)]" /> 20 أكتوبر 2025
            </p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-4xl text-[color:var(--color-primary)] leading-none">120</p>
            <p className="text-[10px] text-muted-foreground mt-1">يوم متبقي</p>
          </div>
        </div>

        <div className="app-section rounded-2xl p-4 mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-bold text-sm">الميزانية</p>
            <span className="text-xs font-bold text-[color:var(--color-primary)]">60%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[60%] rounded-full bg-[color:var(--color-primary)]" />
          </div>
          <div className="flex justify-between text-[11px] mt-2">
            <div><p className="text-muted-foreground">إجمالي الميزانية</p><p className="font-bold">50,000 ر.س</p></div>
            <div className="text-left"><p className="text-muted-foreground">المصروف</p><p className="font-bold">30,000 ر.س</p></div>
          </div>
        </div>

        <div className="app-section rounded-2xl p-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-sm">المهام ({done} من {TASKS.length} مكتملة)</p>
            <button className="text-[11px] text-[color:var(--color-primary)] font-bold">عرض الكل</button>
          </div>
          <ul className="space-y-2.5">
            {TASKS.slice(0, 5).map((t) => {
              const tone =
                t.status === "done" ? "bg-[color:var(--success-soft)] text-green-700" :
                t.status === "progress" ? "bg-[color:var(--gold-soft)] text-yellow-800" :
                t.status === "pending" ? "bg-[color:var(--soft-rose)] text-[color:var(--color-primary)]" :
                "bg-muted text-muted-foreground";
              return (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`size-5 rounded-full grid place-items-center ${t.status === "done" ? "bg-[color:var(--color-primary)] text-white" : "border border-border"}`}>
                      {t.status === "done" && <Check className="size-3" />}
                    </span>
                    {t.label}
                  </span>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 ${tone}`}>
                    {t.status === "done" ? "مكتملة" : t.status === "progress" ? "قيد التنفيذ" : t.status === "pending" ? "قريباً" : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="h-4" />
      <BottomNav active={tab} onChange={(s) => { setTab(s); go(s); }} />
    </Phone>
  );
}

function Favorites({ go, tab, setTab }: { go: (s: Screen) => void; tab: Screen; setTab: (s: Screen) => void }) {
  return (
    <Phone>
      <TopBar title="المفضلة" onBack={() => go("home")} />
      <div className="px-5 space-y-3 pb-4">
        {VENDORS.map((v) => (
          <button key={v.id} onClick={() => go("vendor")} className="app-section w-full rounded-2xl p-2.5 flex gap-3 items-center text-right">
            <img src={v.image} className="size-16 rounded-xl object-cover" alt={v.name} />
            <div className="flex-1">
              <p className="font-display font-bold text-sm">{v.name}</p>
              <p className="text-[11px] text-muted-foreground">{v.city}</p>
              <p className="text-xs font-bold text-[color:var(--color-primary)] mt-1">{fmt(v.price)} ر.س</p>
            </div>
            <Heart className="size-5 fill-current text-[color:var(--color-primary)]" />
          </button>
        ))}
      </div>
      <BottomNav active={tab} onChange={(s) => { setTab(s); go(s); }} />
    </Phone>
  );
}

function Notifications({ go }: { go: (s: Screen) => void }) {
  const [tab, setTab] = useState<"all" | "alerts" | "messages">("all");
  return (
    <Phone>
      <TopBar title="الإشعارات / الرسائل" onBack={() => go("home")} />
      <div className="px-5 flex gap-2 mb-3">
        {[{id:"all",l:"الكل"},{id:"alerts",l:"إشعارات"},{id:"messages",l:"رسائل"}].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === t.id ? "app-primary-btn text-white" : "app-pill"}`}>
            {t.l}
          </button>
        ))}
      </div>
      <div className="px-5 space-y-2.5 pb-6">
        {NOTIFICATIONS.map((n) => {
          const Icon = n.icon;
          return (
            <div key={n.id} className="app-section rounded-2xl p-3 flex items-start gap-3">
              <span className="size-10 rounded-xl app-icon-chip grid place-items-center shrink-0">
                <Icon className="size-4 text-[color:var(--color-primary)]" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-sm">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Phone>
  );
}

function Account({ go, tab, setTab }: { go: (s: Screen) => void; tab: Screen; setTab: (s: Screen) => void }) {
  const items = [
    { icon: User, label: "الملف الشخصي" },
    { icon: Calendar, label: "بيانات الحجز والمدفوعات" },
    { icon: Bookmark, label: "العناوين المحفوظة" },
    { icon: Settings, label: "إعدادات التطبيق" },
    { icon: Lock, label: "الخصوصية والأمان" },
    { icon: MessageCircle, label: "مركز المساعدة" },
  ];
  return (
    <Phone>
      <TopBar title="الحساب / الإعدادات" onBack={() => go("home")} action={<Bell className="size-4" />} />
      <div className="px-5">
        <div className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D2340, #1d3a6b)" }}>
          <button className="absolute top-3 right-3 size-8 rounded-full bg-white/15 grid place-items-center">
            <Settings className="size-4" />
          </button>
          <div className="flex flex-col items-center text-center">
            <img src={bridePortrait} alt="profile" className="size-20 rounded-full object-cover border-2 border-white/30" />
            <p className="font-display font-bold text-lg mt-2">أمل محمد</p>
            <p className="text-xs opacity-80">+966 50 123 4567</p>
            <span className="text-[10px] rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-foreground)] px-2 py-0.5 mt-2 flex items-center gap-1">
              <Sparkles className="size-3" /> عضوة مميزة
            </span>
          </div>
        </div>

        <div className="app-section rounded-2xl mt-4 divide-y divide-border">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button key={it.label} className="w-full flex items-center justify-between px-4 py-3.5 text-right">
                <span className="flex items-center gap-3">
                  <Icon className="size-4 text-[color:var(--color-primary)]" />
                  <span className="text-sm font-semibold">{it.label}</span>
                </span>
                <ChevronLeft className="size-4 text-muted-foreground" />
              </button>
            );
          })}
          <button className="w-full flex items-center justify-between px-4 py-3.5 text-right text-[color:var(--color-primary)]">
            <span className="flex items-center gap-3">
              <LogOut className="size-4" />
              <span className="text-sm font-bold">تسجيل الخروج</span>
            </span>
          </button>
        </div>
      </div>
      <div className="h-4" />
      <BottomNav active={tab} onChange={(s) => { setTab(s); go(s); }} />
    </Phone>
  );
}

// ---------- Router ----------
function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [tab, setTab] = useState<Screen>("home");

  const view = useMemo(() => {
    switch (screen) {
      case "splash": return <Splash go={setScreen} />;
      case "onboarding": return <Onboarding go={setScreen} />;
      case "preferences": return <Preferences go={setScreen} />;
      case "signup": return <Signup go={setScreen} />;
      case "login": return <Login go={setScreen} />;
      case "otp": return <Otp go={setScreen} />;
      case "home": return <Home go={setScreen} tab={tab} setTab={setTab} />;
      case "categories": return <Categories go={setScreen} tab={tab} setTab={setTab} />;
      case "vendors": return <Vendors go={setScreen} tab={tab} setTab={setTab} />;
      case "vendor": return <VendorDetails go={setScreen} />;
      case "plan":
      case "bookings": return <Plan go={setScreen} tab={tab} setTab={setTab} />;
      case "favorites": return <Favorites go={setScreen} tab={tab} setTab={setTab} />;
      case "notifications": return <Notifications go={setScreen} />;
      case "account": return <Account go={setScreen} tab={tab} setTab={setTab} />;
      default: return <Splash go={setScreen} />;
    }
  }, [screen, tab]);

  return <main className="min-h-screen">{view}</main>;
}
