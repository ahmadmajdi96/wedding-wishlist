import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import { getBooking, cancelBooking } from "@/lib/user.functions";
import { Phone, PrimaryBtn, OutlineBtn, TopBar, fmt } from "@/components/app/Shell";

export const Route = createFileRoute("/_authenticated/bookings/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      queryOptions({ queryKey: ["booking", params.id], queryFn: () => getBooking({ data: { id: params.id } }) }),
    ),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: b } = useSuspenseQuery(
    queryOptions({ queryKey: ["booking", id], queryFn: () => getBooking({ data: { id } }) }),
  );
  const cancelFn = useServerFn(cancelBooking);
  const cancel = useMutation({
    mutationFn: () => cancelFn({ data: { id } }),
    onSuccess: () => {
      toast.success("تم إلغاء الحجز");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["booking", id] });
      nav({ to: "/bookings" });
    },
  });

  const vendor = (b as any).vendors;
  const pkg = (b as any).vendor_packages;

  return (
    <Phone>
      <TopBar title="تأكيد الحجز" back="/bookings" />
      <div className="px-5">
        <div className="app-section rounded-2xl p-3 flex gap-3 items-center">
          <img src={vendor.image_url} className="size-16 rounded-xl object-cover" alt="" />
          <div className="flex-1">
            <p className="font-display font-bold">{vendor.name}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3" />
              {vendor.city}
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="size-3" />
              {b.event_date}
            </p>
          </div>
        </div>

        <div className="app-section rounded-2xl p-4 mt-3 space-y-2 text-sm">
          <Row k="رقم الحجز" v={b.id.slice(0, 8).toUpperCase()} />
          <Row k="الباقة" v={pkg?.name ?? "الأساسية"} />
          <Row k="السعر" v={`${fmt(b.total)} د.أ`} />
          <Row k="الحالة" v={STATUS_AR[b.status] ?? b.status} />
          <Row k="الدفع" v={b.payment_status === "paid" ? "مدفوع" : "غير مدفوع"} />
        </div>

        <div className="app-section rounded-2xl p-4 mt-3">
          <p className="font-display font-bold text-sm mb-2">سيتم التواصل معكِ</p>
          <p className="text-xs text-muted-foreground">
            سيتم التواصل معكِ خلال 24 ساعة لتأكيد التفاصيل النهائية ووسيلة الدفع.
          </p>
        </div>

        <div className="mt-4 space-y-2 pb-6">
          {b.status !== "cancelled" && (
            <OutlineBtn onClick={() => cancel.mutate()}>
              {cancel.isPending ? "جارٍ الإلغاء..." : "إلغاء الحجز"}
            </OutlineBtn>
          )}
          <PrimaryBtn onClick={() => nav({ to: "/bookings" })}>
            <Check className="inline size-4 ml-1" /> تم
          </PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

const STATUS_AR: Record<string, string> = { pending: "قيد التأكيد", confirmed: "مؤكد", cancelled: "ملغي" };

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-bold">{v}</span>
    </div>
  );
}
