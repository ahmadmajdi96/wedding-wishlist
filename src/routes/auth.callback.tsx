import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Phone, BrandMark } from "@/components/app/Shell";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: Callback,
});

function Callback() {
  const nav = useNavigate();
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", data.user.id)
          .maybeSingle();
        nav({ to: profile?.onboarding_completed ? "/home" : "/onboarding", replace: true });
      } else {
        nav({ to: "/auth", replace: true });
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) check();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [nav]);

  return (
    <Phone>
      <div className="flex-1 grid place-items-center">
        <div className="text-center">
          <BrandMark size={56} />
          <p className="text-sm text-muted-foreground mt-4">جارٍ تسجيل الدخول...</p>
        </div>
      </div>
    </Phone>
  );
}
