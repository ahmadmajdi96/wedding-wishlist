import { createFileRoute } from "@tanstack/react-router";
import { Heart, Bell, Search, Sparkles, Camera, Shirt, Gem, Calendar, Wallet, Check, ChevronLeft, Building2, Gift, MapPin, Star, ArrowLeft, LogIn } from "lucide-react";
import { useMemo, useState } from "react";

import bridePortrait from "@/assets/bride-portrait.jpg";
import weddingHallLuxury from "@/assets/wedding-hall-luxury.jpg";
import weddingHallFloral from "@/assets/wedding-hall-floral.jpg";
import giftPromo from "@/assets/gift-promo.jpg";
import logoAsset from "@/assets/yalla-nejhaz-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "يلا نجهّز | تطبيق العملاء" },
      {
        name: "description",
        content: "تطبيق عربي لإدارة تجهيزات الزفاف وحجز القاعات والخدمات والموردين من مكان واحد.",
      },
      { property: "og:title", content: "يلا نجهّز | تطبيق العملاء" },
      {
        property: "og:description",
        content: "منصة عربية تربط العملاء بمزودي خدمات الزفاف مع تجربة جوال مطابقة للهوية البصرية المرجعية.",
      },
    ],
  }),
  component: Index,
});

type TabKey = "home" | "categories" | "favorites" | "bookings" | "account";

type Venue = {
  id: number;
  name: string;
  city: string;
  image: string;
  rating: number;
  reviews: number;
  priceRange: string;
};

const categories = [
  { label: "القاعات", icon: Building2, count: "120 قاعة" },
  { label: "الفساتين", icon: Sparkles, count: "+250 فستان" },
  { label: "المصورون", icon: Camera, count: "+180 مصور" },
  { label: "البدلات", icon: Shirt, count: "+90 بدلة" },
  { label: "الضيافة", icon: Gift, count: "+65 خدمة" },
  { label: "المجوهرات", icon: Gem, count: "+75 محل" },
];

const venues: Venue[] = [
  {
    id: 1,
    name: "قصر المملكة",
    city: "عمّان",
    image: weddingHallLuxury,
    rating: 4.8,
    reviews: 256,
    priceRange: "5,000 - 2,500 دينار",
  },
  {
    id: 2,
    name: "قاعة ليالي الشرق",
    city: "إربد",
    image: weddingHallFloral,
    rating: 4.6,
    reviews: 189,
    priceRange: "4,000 - 2,000 دينار",
  },
  {
    id: 3,
    name: "أرياليدا للأفراح",
    city: "الزرقاء",
    image: weddingHallLuxury,
    rating: 4.5,
    reviews: 132,
    priceRange: "3,500 - 1,800 دينار",
  },
];

const checklist = [
  { label: "حجز القاعة", done: true },
  { label: "اختيار فستان الزفاف", done: true },
  { label: "حجز المصور", done: false },
  { label: "اختيار الديكور", done: false },
];

const notifications = [
  { title: "تم تأكيد الحجز", body: "تم تأكيد حجزك في قاعة ليان بنجاح.", time: "منذ 5 دقائق" },
  { title: "عرض جديد يناسب ذوقك", body: "تشكيلة فساتين رومانسية جديدة بانتظارك.", time: "منذ 30 دقيقة" },
  { title: "تذكير بموعد", body: "تبقى 20 يوماً على موعد زفافك.", time: "منذ ساعة" },
  { title: "خصم خاص لك", body: "20% خصم على باقة الديكور المختارة.", time: "منذ 3 ساعات" },
];

const tabs: { key: TabKey; label: string; icon: typeof Heart }[] = [
  { key: "home", label: "الرئيسية", icon: Heart },
  { key: "categories", label: "الفئات", icon: Building2 },
  { key: "favorites", label: "المفضلة", icon: Heart },
  { key: "bookings", label: "حجوزاتي", icon: Calendar },
  { key: "account", label: "حسابي", icon: Bell },
];

function Index() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ar", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result?.redirected) return;
      if (result?.error) {
        console.error(result.error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithEmail = async () => {
    setIsSigningIn(true);
    try {
      await supabase.auth.signInWithOtp({
        email: "demo@yallanejhaz.app",
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin,
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-8 md:px-6">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-center">
        <aside className="hidden min-w-0 flex-1 lg:block lg:max-w-[360px] xl:max-w-[420px]">
          <div className="sticky top-8 space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-[var(--shadow-float)] backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,123,165,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.12),transparent_24%)]" />
              <div className="relative space-y-6">
                <img src={logoAsset.url} alt="يلا نجهّز" className="h-28 w-auto" />
                <p className="max-w-xs text-lg font-medium text-foreground/90">
                  كل تجهيزات فرحتك بمكان واحد
                </p>
                <div className="space-y-4 pt-2">
                  {[
                    ["أفضل الموردين", "مختارين بعناية", Gem],
                    ["موثوق وآمن", "تقييمات حقيقية", Check],
                    ["دعم متخصص", "نحن معك دائماً", Bell],
                    ["تنظيم سهل", "خطط، تابع، وارتاح", Calendar],
                  ].map(([title, subtitle, Icon]) => (
                    <div key={title} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                      <div className="grid h-13 w-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-lg font-bold text-foreground">{title}</h2>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex w-full justify-center gap-6 overflow-x-auto pb-6 lg:justify-start">
          <PhoneFrame>
            <OnboardingScreen brideImage={bridePortrait} onGoogle={signInWithGoogle} onEmail={signInWithEmail} loading={isSigningIn} />
          </PhoneFrame>
          <PhoneFrame>
            <HomeScreen todayLabel={todayLabel} />
          </PhoneFrame>
          <PhoneFrame>
            <CategoriesScreen />
          </PhoneFrame>
          <PhoneFrame>
            <VenueListScreen venues={venues} />
          </PhoneFrame>
          <PhoneFrame>
            <VenueDetailsScreen venue={venues[0]} />
          </PhoneFrame>
          <PhoneFrame>
            <PlannerScreen />
          </PhoneFrame>
          <PhoneFrame>
            <BookingScreen venue={venues[0]} />
          </PhoneFrame>
          <PhoneFrame>
            <NotificationsScreen notifications={notifications} activeTab={activeTab} onTabChange={setActiveTab} />
          </PhoneFrame>
        </div>
      </section>
    </main>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[330px] shrink-0 rounded-[2.5rem] border border-white/70 bg-shell p-3 shadow-[var(--shadow-phone)]">
      <div className="pointer-events-none absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-full bg-foreground/7" />
      <div className="app-screen relative min-h-[700px] overflow-hidden rounded-[2rem] bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(247,123,165,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.1),transparent_24%)]" />
        <div className="relative min-h-[700px]">{children}</div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-4 text-[11px] font-semibold text-foreground/70">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-foreground/60" />
        <span className="h-2 w-2 rounded-full bg-foreground/40" />
        <span className="h-2 w-2 rounded-full bg-foreground/20" />
      </div>
    </div>
  );
}

function BrandBadge() {
  return <img src={logoAsset.url} alt="يلا نجهّز" className="h-10 w-auto" />;
}

function OnboardingScreen({
  brideImage,
  onGoogle,
  onEmail,
  loading,
}: {
  brideImage: string;
  onGoogle: () => Promise<void>;
  onEmail: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div className="flex min-h-[700px] flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.95)),radial-gradient(circle_at_top_right,rgba(247,123,165,0.18),transparent_28%)] px-5 pb-6">
      <StatusBar />
      <div className="flex flex-1 flex-col justify-between gap-6 pb-2 pt-4">
        <div className="rounded-[2rem] border border-border/60 bg-card/80 px-6 py-7 shadow-[var(--shadow-soft)] backdrop-blur-sm">
          <div className="mb-6 flex justify-center">
            <BrandBadge />
          </div>
          <div className="overflow-hidden rounded-[1.6rem] bg-soft-rose/60 p-3">
            <img
              src={brideImage}
              alt="عروس أنيقة"
              width={768}
              height={1024}
              className="h-[260px] w-full rounded-[1.35rem] object-cover"
            />
          </div>
          <Card className="mt-[-1.5rem] rounded-[1.5rem] border-border/70 bg-card/95 p-5 shadow-[var(--shadow-float)]">
            <h1 className="text-balance text-center font-display text-[1.75rem] font-bold leading-tight text-foreground">
              خططي لفرحة أحلامك
            </h1>
            <p className="mt-3 text-center text-sm leading-6 text-muted-foreground">
              من اختيار الفستان حتى تنظيم يوم الزفاف، نحن هنا معك في كل خطوة.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/35" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onGoogle}
            disabled={loading}
            className="app-primary-btn h-13 w-full rounded-full text-base font-bold"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "جاري تسجيل الدخول..." : "الدخول عبر Google"}
          </Button>
          <Button
            onClick={onEmail}
            disabled={loading}
            variant="outline"
            className="app-outline-btn h-13 w-full rounded-full text-base font-medium"
          >
            تسجيل الدخول بالبريد الإلكتروني
          </Button>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ todayLabel }: { todayLabel: string }) {
  return (
    <div className="flex min-h-[700px] flex-col px-5 pb-5">
      <StatusBar />
      <div className="flex items-center justify-between pt-4">
        <div className="space-y-1 text-right">
          <p className="text-sm text-muted-foreground">{todayLabel}</p>
          <h2 className="font-display text-2xl font-bold text-foreground">👋🏻 مرحباً سارة</h2>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-[var(--shadow-soft)]">
          <Bell className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="mt-4 app-pill rounded-full px-4 py-3">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحثي عن قاعة، مصور، خدمة أو مورد..."
            className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(247,123,165,0.88),rgba(249,175,194,0.72))] p-4 text-primary-foreground shadow-[var(--shadow-float)]">
        <div className="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-xl font-display font-bold leading-8">عروض مميزة للعروس</p>
            <p className="text-sm text-primary-foreground/85">خصومات مختارة على القاعات والخدمات لهذا الشهر</p>
            <Button className="h-10 rounded-full bg-white/90 px-4 text-sm font-bold text-primary hover:bg-white">
              اكتشفي الآن
            </Button>
          </div>
          <img src={bridePortrait} alt="عروس" width={768} height={1024} className="h-28 w-28 rounded-[1.4rem] object-cover" />
        </div>
      </div>

      <SectionHeader title="الخدمات الأكثر طلباً" />
      <div className="grid grid-cols-4 gap-3">
        {[
          ["قاعات", Building2],
          ["فساتين", Sparkles],
          ["بدلات", Shirt],
          ["تصوير", Camera],
          ["ديكور", Gift],
          ["ذهب", Gem],
          ["ضيافة", Bell],
          ["تجهيز البيت", Heart],
        ].map(([label, Icon]) => (
          <div key={label} className="app-icon-chip flex flex-col items-center gap-2 rounded-[1.2rem] px-2 py-3 text-center">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{label}</span>
          </div>
        ))}
      </div>

      <SectionHeader title="الأكثر طلباً" action="عرض الكل" />
      <div className="grid grid-cols-2 gap-3">
        {[
          [weddingHallLuxury, "قاعة ليان", "الرياض", "4.8"],
          [weddingHallFloral, "مصور نور", "عمّان", "4.9"],
        ].map(([image, title, city, rate]) => (
          <div key={title} className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-card shadow-[var(--shadow-soft)]">
            <img src={String(image)} alt={String(title)} loading="lazy" width={1024} height={768} className="h-28 w-full object-cover" />
            <div className="space-y-1 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{city}</span>
                <span className="flex items-center gap-1 text-accent-foreground"><Star className="h-3.5 w-3.5 fill-current text-accent" />{rate}</span>
              </div>
              <h3 className="truncate font-display text-sm font-bold text-foreground">{title}</h3>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="home" />
    </div>
  );
}

function CategoriesScreen() {
  return (
    <div className="flex min-h-[700px] flex-col px-5 pb-5">
      <StatusBar />
      <div className="flex items-center justify-between pt-4">
        <ArrowLeft className="h-5 w-5 text-foreground" />
        <h2 className="font-display text-2xl font-bold text-foreground">التصنيفات</h2>
        <div className="w-5" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {categories.map(({ label, icon: Icon, count }) => (
          <Card key={label} className="rounded-[1.5rem] border-border/70 bg-card/95 p-4 shadow-[var(--shadow-soft)]">
            <div className="grid h-13 w-13 place-items-center rounded-[1.1rem] bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">{label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{count}</p>
          </Card>
        ))}
      </div>
      <div className="mt-auto overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(13,35,64,0.98),rgba(44,73,116,0.95))] shadow-[var(--shadow-phone)]">
        <img src={giftPromo} alt="عرض حصري" loading="lazy" width={1024} height={768} className="h-32 w-full object-cover opacity-80" />
        <div className="mt-[-4.2rem] space-y-2 p-4 text-white">
          <p className="font-display text-xl font-bold">عروض حصرية</p>
          <p className="text-sm text-white/80">خصومات على باقات تجهيز متكاملة محدودة</p>
          <Button className="h-10 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            تسوقي الآن
          </Button>
        </div>
      </div>
      <BottomNav active="categories" />
    </div>
  );
}

function VenueListScreen({ venues }: { venues: Venue[] }) {
  return (
    <div className="flex min-h-[700px] flex-col px-5 pb-5">
      <StatusBar />
      <div className="flex items-center justify-between pt-4">
        <ArrowLeft className="h-5 w-5 text-foreground" />
        <h2 className="font-display text-2xl font-bold text-foreground">قاعات</h2>
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
        <div className="app-pill rounded-full px-4 py-3 text-sm text-foreground">الأكثر تقييماً</div>
        <div className="app-pill rounded-full px-4 py-3 text-sm text-foreground">فلترة</div>
      </div>
      <div className="mt-4 space-y-3">
        {venues.map((venue) => (
          <Card key={venue.id} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 rounded-[1.5rem] border-border/70 bg-card/95 p-3 shadow-[var(--shadow-soft)]">
            <img src={venue.image} alt={venue.name} loading="lazy" width={1024} height={768} className="h-[102px] w-full rounded-[1.1rem] object-cover" />
            <div className="min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-bold text-foreground">{venue.name}</h3>
                  <p className="text-sm text-muted-foreground">{venue.city}</p>
                </div>
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="h-3.5 w-3.5 fill-current text-accent" /> {venue.rating} <span>({venue.reviews})</span></p>
              <p className="text-sm font-medium text-foreground">{venue.priceRange}</p>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active="categories" />
    </div>
  );
}

function VenueDetailsScreen({ venue }: { venue: Venue }) {
  return (
    <div className="flex min-h-[700px] flex-col pb-5">
      <StatusBar />
      <div className="relative mt-4 px-4">
        <div className="overflow-hidden rounded-[1.75rem]">
          <img src={venue.image} alt={venue.name} loading="lazy" width={1024} height={768} className="h-[220px] w-full object-cover" />
        </div>
        <div className="absolute left-8 right-8 top-4 flex items-center justify-between text-white">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-black/20 backdrop-blur-sm"><Heart className="h-4 w-4" /></div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-black/20 backdrop-blur-sm"><ArrowLeft className="h-4 w-4" /></div>
        </div>
      </div>
      <div className="mt-4 flex-1 rounded-t-[2rem] bg-card px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-bold text-foreground">{venue.name}</h2>
            <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {venue.city}</p>
          </div>
          <p className="text-lg font-bold text-foreground">{venue.priceRange.split(" - ")[1]}</p>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
          {[
            ["خدمة راقية", Bell],
            ["سعة 800 شخص", Building2],
            ["مواقف سيارات", Calendar],
            ["قاعة نسائية", Sparkles],
          ].map(([label, Icon]) => (
            <div key={label} className="app-icon-chip rounded-[1rem] px-2 py-3">
              <Icon className="mx-auto h-4 w-4 text-accent" />
              <p className="mt-2 leading-5 text-foreground">{label}</p>
            </div>
          ))}
        </div>
        <SectionHeader title="معرض الصور" />
        <div className="grid grid-cols-3 gap-2">
          {[weddingHallLuxury, weddingHallFloral, weddingHallLuxury].map((image, index) => (
            <img key={index} src={image} alt={`صورة ${index + 1}`} loading="lazy" width={1024} height={768} className="h-20 w-full rounded-[1rem] object-cover" />
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          قاعة فاخرة بتصميم ملكي وخدمات متكاملة تجعل يوم زفافك مثالياً بكل التفاصيل.
        </p>
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <Button className="app-primary-btn h-12 rounded-full text-base font-bold">احجز الآن</Button>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">السعر للباقة الأساسية</p>
            <p className="text-xl font-bold text-foreground">2,500 دينار</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlannerScreen() {
  return (
    <div className="flex min-h-[700px] flex-col px-5 pb-5">
      <StatusBar />
      <div className="flex items-center justify-between pt-4">
        <ArrowLeft className="h-5 w-5 text-foreground" />
        <h2 className="font-display text-2xl font-bold text-foreground">خطة زفافي</h2>
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </div>
      <Card className="mt-4 rounded-[1.6rem] border-border/70 bg-card/95 p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">يوم زفافي</p>
            <h3 className="mt-2 font-display text-[2.6rem] font-bold leading-none text-foreground">120</h3>
            <p className="mt-2 text-sm text-muted-foreground">يوم متبقي</p>
          </div>
          <div className="rounded-[1rem] bg-soft-rose px-3 py-2 text-right text-sm text-foreground">
            <p>20 أكتوبر 2025</p>
            <Calendar className="mt-2 h-4 w-4 text-primary" />
          </div>
        </div>
      </Card>

      <SectionHeader title="الميزانية" />
      <Card className="rounded-[1.6rem] border-border/70 bg-card/95 p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>إجمالي الميزانية</span>
          <span>30,000 ر.س</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-soft-rose">
          <div className="h-full w-[60%] rounded-full bg-primary" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[1rem] bg-soft-rose/60 px-3 py-3">
            <p className="text-muted-foreground">المصروف</p>
            <p className="mt-1 font-bold text-foreground">18,000 ر.س</p>
          </div>
          <div className="rounded-[1rem] bg-success-soft/60 px-3 py-3">
            <p className="text-muted-foreground">المتبقي</p>
            <p className="mt-1 font-bold text-foreground">12,000 ر.س</p>
          </div>
        </div>
      </Card>

      <SectionHeader title="المهام" action="عرض الكل" />
      <div className="space-y-2">
        {checklist.map((item) => (
          <div key={item.label} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[1.15rem] border border-border/70 bg-card/90 px-4 py-3 shadow-[var(--shadow-soft)]">
            <div className={`grid h-6 w-6 place-items-center rounded-full ${item.done ? "bg-success-soft text-foreground" : "bg-soft-rose text-muted-foreground"}`}>
              {item.done ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
            </div>
            <p className={`text-sm ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</p>
          </div>
        ))}
      </div>
      <BottomNav active="bookings" />
    </div>
  );
}

function BookingScreen({ venue }: { venue: Venue }) {
  return (
    <div className="flex min-h-[700px] flex-col px-5 pb-5">
      <StatusBar />
      <div className="flex items-center justify-between pt-4">
        <ArrowLeft className="h-5 w-5 text-foreground" />
        <h2 className="font-display text-2xl font-bold text-foreground">تأكيد الحجز</h2>
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </div>
      <Card className="mt-4 rounded-[1.6rem] border-border/70 bg-card/95 p-4 shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
          <img src={venue.image} alt={venue.name} loading="lazy" width={1024} height={768} className="h-22 w-full rounded-[1rem] object-cover" />
          <div className="min-w-0 space-y-1">
            <h3 className="truncate font-display text-lg font-bold text-foreground">{venue.name}</h3>
            <p className="text-sm text-muted-foreground">{venue.city}</p>
            <p className="text-sm text-foreground">الباقة الذهبية · 3,500 دينار</p>
          </div>
        </div>
      </Card>
      <SectionHeader title="اختر التاريخ" />
      <Card className="rounded-[1.6rem] border-border/70 bg-card/95 p-4 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between text-sm font-medium text-foreground">
          <ArrowLeft className="h-4 w-4" />
          يونيو 2025
          <ChevronLeft className="h-4 w-4" />
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
          {["س", "أ", "ث", "أر", "خ", "ج", "س"].map((day) => (
            <span key={day}>{day}</span>
          ))}
          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
            <span
              key={day}
              className={`grid h-8 place-items-center rounded-full ${day === 21 ? "bg-primary text-primary-foreground" : "text-foreground"}`}
            >
              {day}
            </span>
          ))}
        </div>
      </Card>
      <SectionHeader title="ملخص الحجز" />
      <Card className="rounded-[1.6rem] border-border/70 bg-card/95 p-4 shadow-[var(--shadow-soft)]">
        {[
          ["السعر", "3,500 دينار"],
          ["الخدمات الإضافية", "560 دينار"],
          ["الضريبة المضافة (16%)", "560 دينار"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-border/70 pt-3 text-lg font-bold">
          <span className="text-foreground">الإجمالي</span>
          <span className="text-primary">4,060 دينار</span>
        </div>
      </Card>
      <div className="mt-auto space-y-3 pt-4">
        <div className="rounded-[1rem] bg-success-soft/70 px-4 py-3 text-sm text-foreground">
          تم تأكيد الحجز بنجاح! سيتم إرسال التفاصيل إلى بريدك الإلكتروني.
        </div>
        <Button className="app-primary-btn h-12 rounded-full text-base font-bold">تأكيد الحجز والدفع</Button>
      </div>
    </div>
  );
}

function NotificationsScreen({
  notifications,
  activeTab,
  onTabChange,
}: {
  notifications: { title: string; body: string; time: string }[];
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}) {
  return (
    <div className="flex min-h-[700px] flex-col px-5 pb-5">
      <StatusBar />
      <div className="flex items-center justify-between pt-4">
        <ArrowLeft className="h-5 w-5 text-foreground" />
        <h2 className="font-display text-2xl font-bold text-foreground">الإشعارات / الرسائل</h2>
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-full bg-soft-rose/70 p-1">
        {[
          ["الكل", "account"],
          ["إشعارات", "favorites"],
          ["رسائل", "bookings"],
        ].map(([label, key]) => (
          <button
            key={label}
            onClick={() => onTabChange(key as TabKey)}
            className={`rounded-full px-3 py-2 text-sm font-medium ${activeTab === key ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {notifications.map((item) => (
          <Card key={item.title} className="rounded-[1.4rem] border-border/70 bg-card/95 p-4 shadow-[var(--shadow-soft)]">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-soft-rose text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate font-display text-lg font-bold text-foreground">{item.title}</h3>
                  <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active="account" />
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 mt-5 flex items-center justify-between">
      {action ? <button className="text-sm font-medium text-muted-foreground">{action}</button> : <span />}
      <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
    </div>
  );
}

function BottomNav({ active }: { active: TabKey }) {
  return (
    <div className="mt-auto pt-4">
      <div className="rounded-full border border-border/70 bg-card/95 px-3 py-2 shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-5 gap-1 text-center">
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <div key={key} className={`rounded-full px-2 py-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className={`mx-auto h-4 w-4 ${isActive ? "fill-primary/20" : ""}`} />
                <p className="mt-1 text-[11px] font-medium">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
