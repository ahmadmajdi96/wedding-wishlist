import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { amIAdmin } from "@/lib/admin.functions";

const opts = queryOptions({ queryKey: ["am-i-admin"], queryFn: () => amIAdmin() });

export const Route = createFileRoute("/_authenticated/admin")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: AdminLayout,
});

function AdminLayout() {
  const { data } = useSuspenseQuery(opts);
  if (!data.isAdmin) {
    return (
      <div dir="rtl" className="min-h-screen grid place-items-center p-8 text-center">
        <div>
          <ShieldAlert className="mx-auto size-10 text-[color:var(--color-primary)] mb-3" />
          <h1 className="font-display font-bold text-xl">هذه الصفحة للمشرفين فقط</h1>
          <p className="text-sm text-muted-foreground mt-1">لا تملكين صلاحية الوصول إلى لوحة الإدارة.</p>
          <Link to="/home" className="inline-block mt-4 text-[color:var(--color-primary)] font-bold text-sm">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }
  return <Outlet />;
}
