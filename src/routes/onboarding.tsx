import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { updateMyProfile } from "@/lib/user.functions";
import { BrandMark, Phone, PrimaryBtn, TopBar } from "@/components/app/Shell";
import weddingHallLuxury from "@/assets/wedding-hall-luxury.jpg";
import weddingHallFloral from "@/assets/wedding-hall-floral.jpg";
import bridePortrait from "@/assets/bride-portrait.jpg";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Onboarding,
});

const STYLES = [
  { id: "classic", label: "كلاسيكي", img: weddingHallLuxury },
  { id: "romantic", label: "رومانسي", img: weddingHallFloral },
  { id: "modern", label: "مودرن", img: bridePortrait },
  { id: "luxe", label: "فخم", img: weddingHallLuxury },
  { id: "boho", label: "بوهيمي", img: weddingHallFloral },
  { id: "beach", label: "شاطئي", img: bridePortrait },
];

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [city, setCity] = useState("عمّان");
  const [weddingDate, setWeddingDate] = useState("");
  const [budget, setBudget] = useState(10000);
  const update = useServerFn(updateMyProfile);

  const save = useMutation({
    mutationFn: async () =>
      update({
        data: {
          city,
          wedding_date: weddingDate || null,
          budget_max: budget,
          style_preferences: picked,
          onboarding_completed: true,
        },
      }),
    onSuccess: () => {
      toast.success("تم حفظ تفضيلاتكِ");
      nav({ to: "/home" });
    },
    onError: () => toast.error("تعذر الحفظ"),
  });

  return (
    <Phone>
      <TopBar
        back={step > 0 ? true : "/"}
        action={
          <button
            onClick={() => save.mutate()}
            className="text-xs text-muted-foreground"
            disabled={save.isPending}
          >
            تخطي
          </button>
        }
      />
      <div className="px-6 text-center">
        <BrandMark size={44} />
        <div className="flex justify-center gap-1.5 mt-4 mb-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-[color:var(--color-primary)]" : "w-1.5 bg-muted"}`}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <>
          <div className="px-6 mb-4 text-center">
            <h2 className="font-display font-bold text-xl">ما هو أسلوب زفافكِ المفضل؟</h2>
            <p className="text-sm text-muted-foreground mt-1">اختاري واحد أو أكثر</p>
          </div>
          <div className="px-6 grid grid-cols-2 gap-3">
            {STYLES.map((s) => {
              const on = picked.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() =>
                    setPicked((p) => (p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id]))
                  }
                  className={`relative rounded-2xl overflow-hidden h-32 app-section ${on ? "ring-2 ring-[color:var(--color-primary)]" : ""}`}
                >
                  <img src={s.img} className="absolute inset-0 w-full h-full object-cover" alt={s.label} />
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
          <div className="p-6 mt-auto">
            <PrimaryBtn onClick={() => setStep(1)}>التالي</PrimaryBtn>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className="px-6 mb-4 text-center">
            <h2 className="font-display font-bold text-xl">معلومات أساسية</h2>
            <p className="text-sm text-muted-foreground mt-1">لنخصص لكِ التجربة</p>
          </div>
          <div className="px-6 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">المدينة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="app-pill mt-1 w-full rounded-2xl px-4 py-3 text-sm bg-transparent outline-none"
              >
                {["عمّان", "إربد", "الزرقاء", "العقبة", "السلط", "مادبا", "جرش", "الكرك"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">تاريخ الزفاف (اختياري)</label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="app-pill mt-1 w-full rounded-2xl px-4 py-3 text-sm bg-transparent outline-none"
              />
            </div>
          </div>
          <div className="p-6 mt-auto">
            <PrimaryBtn onClick={() => setStep(2)}>التالي</PrimaryBtn>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="px-6 mb-4 text-center">
            <h2 className="font-display font-bold text-xl">الميزانية المتوقعة</h2>
            <p className="text-sm text-muted-foreground mt-1">حركي المؤشر لتحديد ميزانيتكِ</p>
          </div>
          <div className="px-6 text-center">
            <p className="font-display font-bold text-4xl text-[color:var(--color-primary)] mt-6">
              {budget.toLocaleString("ar-EG")} <span className="text-base text-muted-foreground">د.أ</span>
            </p>
            <input
              type="range"
              min={2000}
              max={60000}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full mt-6 accent-[color:var(--color-primary)]"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>2,000</span>
              <span>300,000</span>
            </div>
          </div>
          <div className="p-6 mt-auto">
            <PrimaryBtn onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "جارٍ الحفظ..." : "إنهاء وبدء التطبيق"}
            </PrimaryBtn>
          </div>
        </>
      )}
    </Phone>
  );
}
