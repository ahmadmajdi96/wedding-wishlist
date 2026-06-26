import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getMyProfile, updateMyProfile } from "@/lib/user.functions";
import { Phone, PrimaryBtn, TopBar } from "@/components/app/Shell";

const opts = queryOptions({ queryKey: ["me"], queryFn: () => getMyProfile() });

export const Route = createFileRoute("/_authenticated/account/profile")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data: me } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const nav = useNavigate();
  const updateFn = useServerFn(updateMyProfile);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    if (me) {
      setFullName(me.full_name ?? "");
      setPhone(me.phone ?? "");
      setCity(me.city ?? "");
      setWeddingDate(me.wedding_date ?? "");
      setBudget(me.budget_max ? String(me.budget_max) : "");
    }
  }, [me]);

  const save = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          full_name: fullName,
          phone: phone || null,
          city: city || null,
          wedding_date: weddingDate || null,
          budget_max: budget ? Number(budget) : null,
        },
      }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      qc.invalidateQueries({ queryKey: ["me"] });
      nav({ to: "/account" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Phone>
      <TopBar title="الملف الشخصي" back="/account" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="px-5 space-y-3 pb-6"
      >
        <Input label="الاسم الكامل" value={fullName} onChange={setFullName} />
        <Input label="رقم الجوال" value={phone} onChange={setPhone} />
        <div>
          <label className="text-xs text-muted-foreground">المدينة</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="app-pill mt-1 w-full rounded-2xl px-4 py-3 text-sm bg-transparent outline-none"
          >
            <option value="">اختاري المدينة</option>
            {["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">تاريخ الزفاف</label>
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="app-pill mt-1 w-full rounded-2xl px-4 py-3 text-sm bg-transparent outline-none"
          />
        </div>
        <Input label="الميزانية (ر.س)" value={budget} onChange={setBudget} type="number" />
        <PrimaryBtn type="submit" disabled={save.isPending}>
          {save.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </PrimaryBtn>
      </form>
    </Phone>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="app-pill mt-1 w-full rounded-2xl px-4 py-3 text-sm bg-transparent outline-none"
      />
    </div>
  );
}
