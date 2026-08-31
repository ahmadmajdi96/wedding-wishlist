import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getLegalPage } from "@/lib/saas.functions";
import { Phone, TopBar } from "@/components/app/Shell";

const opts = (slug: string) =>
  queryOptions({ queryKey: ["legal", slug], queryFn: () => getLegalPage({ data: { slug } }) });

export const Route = createFileRoute("/legal/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(opts(params.slug)),
  component: Page,
  head: () => ({
    meta: [
      { title: "الشروط والسياسات | يلا نجهّز" },
      { name: "description", content: "الشروط والأحكام وسياسة الخصوصية ومعلومات عن منصة يلا نجهّز." },
      { property: "og:title", content: "الشروط والسياسات | يلا نجهّز" },
      { property: "og:description", content: "اطّلعي على سياساتنا ومعلومات المنصة." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => (
    <Phone>
      <TopBar title="غير متاح" back="/support" />
      <p className="px-5 text-sm text-muted-foreground">تعذّر تحميل الصفحة، حاولي لاحقاً.</p>
    </Phone>
  ),
  notFoundComponent: () => (
    <Phone>
      <TopBar title="غير موجود" back="/support" />
      <p className="px-5 text-sm text-muted-foreground">الصفحة غير موجودة.</p>
    </Phone>
  ),
});

function Page() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(opts(slug));

  return (
    <Phone>
      <TopBar title={data?.title ?? "صفحة"} back="/support" />
      <div className="px-5">
        <article className="app-section rounded-2xl p-4">
          <h1 className="font-display font-bold text-lg">{data?.title}</h1>
          <p className="text-sm text-muted-foreground leading-loose whitespace-pre-line mt-2">
            {data?.body || "لا يوجد محتوى بعد."}
          </p>
          {data?.updated_at && (
            <p className="text-[10px] text-muted-foreground mt-4">
              آخر تحديث: {new Date(data.updated_at).toLocaleDateString("ar")}
            </p>
          )}
        </article>
      </div>
      <div className="h-6" />
    </Phone>
  );
}
