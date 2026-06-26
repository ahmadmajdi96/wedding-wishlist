import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import bridePortrait from "@/assets/bride-portrait.jpg";
import { BrandMark, Phone, PrimaryBtn } from "@/components/app/Shell";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/home" });
  },
  head: () => ({
    meta: [
      { title: "يلا نجهّز | كل تجهيزات فرحتك بمكان واحد" },
      { name: "description", content: "تطبيق عربي يربطكِ بأفضل مزودي خدمات الزفاف — قاعات، فساتين، مصورين، ضيافة وأكثر." },
    ],
  }),
  component: Splash,
});

function Splash() {
  return (
    <Phone>
      <div
        className="flex-1 flex flex-col items-center justify-between p-8 text-center"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-soft-rose) 70%, white), white)",
        }}
      >
        <div className="pt-6">
          <BrandMark size={80} />
        </div>

        <div className="w-full max-w-xs">
          <div className="rounded-[2rem] overflow-hidden shadow-xl mb-8">
            <img src={bridePortrait} alt="عروس" className="w-full h-80 object-cover" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[color:var(--color-primary)]">
            خططي لفرحة أحلامك
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            من اختيار الفستان حتى تنظيم يوم الزفاف، نحن معكِ في كل خطوة.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <Link to="/auth" search={{ mode: "signup" }}>
            <PrimaryBtn>ابدئي الآن</PrimaryBtn>
          </Link>
          <Link
            to="/auth"
            search={{ mode: "login" }}
            className="block text-sm text-[color:var(--color-primary)] font-bold"
          >
            لديكِ حساب بالفعل؟ تسجيل الدخول
          </Link>
        </div>
      </div>
    </Phone>
  );
}
