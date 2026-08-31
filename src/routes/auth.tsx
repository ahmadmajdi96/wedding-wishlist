import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { BrandMark, Phone, PrimaryBtn, TopBar } from "@/components/app/Shell";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: { mode?: "login" | "signup" }) => ({
    mode: s.mode === "signup" ? ("signup" as const) : ("login" as const),
  }),

  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/home" });
  },
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const nav = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">(mode);
  const [loading, setLoading] = useState(false);

  return (
    <Phone>
      <TopBar back="/" />
      <div className="px-6 text-center">
        <BrandMark size={56} />
        <h1 className="font-display font-bold text-2xl mt-4">
          {tab === "login" ? "مرحباً بعودتكِ" : "إنشاء حساب جديد"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          {tab === "login"
            ? "سجّلي الدخول لمتابعة تخطيط زفافكِ"
            : "ابدئي رحلتكِ معنا لتنظيم زفافكِ المثالي"}
        </p>
      </div>

      <div className="px-6 mb-4">
        <div className="app-pill rounded-full p-1 grid grid-cols-2 text-sm font-bold">
          <button
            onClick={() => setTab("login")}
            className={`rounded-full py-2 ${tab === "login" ? "app-primary-btn text-white" : "text-muted-foreground"}`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`rounded-full py-2 ${tab === "signup" ? "app-primary-btn text-white" : "text-muted-foreground"}`}
          >
            حساب جديد
          </button>
        </div>
      </div>

      {tab === "login" ? (
        <LoginForm loading={loading} setLoading={setLoading} onDone={() => nav({ to: "/home" })} />
      ) : (
        <SignupForm loading={loading} setLoading={setLoading} onDone={() => nav({ to: "/onboarding" })} />
      )}

      <div className="px-6">
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">أو</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <button
          onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", {
              redirect_uri: window.location.origin + "/auth/callback",
            });
            if (r.error) toast.error("تعذر تسجيل الدخول عبر Google");
          }}
          className="app-pill w-full rounded-full py-3 flex items-center justify-center gap-3 font-semibold text-sm"
        >
          <svg viewBox="0 0 24 24" className="size-5">
            <path
              fill="#4285F4"
              d="M23 12.3c0-.9-.1-1.5-.2-2.2H12v4h6.3c-.1 1-.8 2.6-2.4 3.6l3.5 2.7C21.7 18.7 23 15.8 23 12.3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 5.9-1.05 7.8-2.85l-3.7-2.9c-1 .7-2.3 1.2-4.1 1.2-3.1 0-5.8-2.05-6.7-4.9L1.5 15.4C3.3 19.7 7.3 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 13.55c-.2-.65-.35-1.35-.35-2.05s.13-1.4.34-2.05L1.55 6.43A11.05 11.05 0 0 0 .25 11.5c0 1.75.4 3.4 1.2 4.85l3.85-2.8z"
            />
            <path
              fill="#EA4335"
              d="M12 4.55c2.2 0 3.7.95 4.55 1.75l3.3-3.2C17.85 1.25 15.2.25 12 .25 7.3.25 3.3 2.75 1.45 6.5l3.85 2.95C6.2 6.6 8.9 4.55 12 4.55z"
            />
          </svg>
          متابعة عبر Google
        </button>
      </div>

      <div className="p-6 text-center text-xs text-muted-foreground">
        بمتابعتكِ، فإنكِ توافقين على الشروط وسياسة الخصوصية
      </div>
    </Phone>
  );
}

function Field({
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
  trailing,
}: {
  icon: any;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="app-pill rounded-2xl flex items-center gap-3 px-4 py-3">
      <Icon className="size-4 text-muted-foreground" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
      {trailing}
    </div>
  );
}

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور قصيرة"),
});

function LoginForm({
  loading,
  setLoading,
  onDone,
}: {
  loading: boolean;
  setLoading: (b: boolean) => void;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("بيانات الدخول غير صحيحة");
      return;
    }
    onDone();
  }

  async function forgot() {
    if (!email) {
      toast.error("أدخلي البريد أولاً");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) toast.error("تعذر إرسال رابط إعادة التعيين");
    else toast.success("أرسلنا لكِ رابط إعادة التعيين");
  }

  return (
    <form onSubmit={submit} className="px-6 space-y-3">
      <Field icon={Mail} placeholder="البريد الإلكتروني" type="email" value={email} onChange={setEmail} />
      <Field
        icon={Lock}
        placeholder="كلمة المرور"
        type={show ? "text" : "password"}
        value={password}
        onChange={setPassword}
        trailing={
          <button type="button" onClick={() => setShow((s) => !s)}>
            {show ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
          </button>
        }
      />
      <div className="text-left">
        <button type="button" onClick={forgot} className="text-xs text-[color:var(--color-primary)] font-bold">
          نسيتِ كلمة المرور؟
        </button>
      </div>
      <PrimaryBtn type="submit" disabled={loading}>
        {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </PrimaryBtn>
    </form>
  );
}

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "الاسم قصير").max(100),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});

function SignupForm({
  loading,
  setLoading,
  onDone,
}: {
  loading: boolean;
  setLoading: (b: boolean) => void;
  onDone: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [accept, setAccept] = useState(true);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ full_name: fullName, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (!accept) {
      toast.error("يجب الموافقة على الشروط");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback",
        data: { full_name: parsed.data.full_name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم إنشاء الحساب");
    onDone();
  }

  return (
    <form onSubmit={submit} className="px-6 space-y-3">
      <Field icon={UserIcon} placeholder="الاسم الكامل" value={fullName} onChange={setFullName} />
      <Field icon={Mail} placeholder="البريد الإلكتروني" type="email" value={email} onChange={setEmail} />
      <Field
        icon={Lock}
        placeholder="كلمة المرور"
        type={show ? "text" : "password"}
        value={password}
        onChange={setPassword}
        trailing={
          <button type="button" onClick={() => setShow((s) => !s)}>
            {show ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
          </button>
        }
      />
      <label className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
        <input
          type="checkbox"
          checked={accept}
          onChange={(e) => setAccept(e.target.checked)}
          className="mt-0.5 accent-[color:var(--color-primary)]"
        />
        <span>أوافق على الشروط والأحكام وسياسة الخصوصية</span>
      </label>
      <PrimaryBtn type="submit" disabled={loading}>
        {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
      </PrimaryBtn>
    </form>
  );
}
