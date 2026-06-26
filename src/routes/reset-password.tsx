import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark, Phone, PrimaryBtn, TopBar } from "@/components/app/Shell";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("كلمة المرور قصيرة");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("تم تحديث كلمة المرور");
    nav({ to: "/home" });
  }

  return (
    <Phone>
      <TopBar back="/" />
      <div className="px-6 text-center">
        <BrandMark size={48} />
        <h1 className="font-display font-bold text-2xl mt-4">إعادة تعيين كلمة المرور</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-5">أدخلي كلمة مرور جديدة لحسابكِ</p>
      </div>
      <form onSubmit={submit} className="px-6 space-y-3">
        <div className="app-pill rounded-2xl flex items-center gap-3 px-4 py-3">
          <Lock className="size-4 text-muted-foreground" />
          <input
            type="password"
            placeholder="كلمة المرور الجديدة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <PrimaryBtn type="submit" disabled={loading}>
          {loading ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
        </PrimaryBtn>
      </form>
    </Phone>
  );
}
