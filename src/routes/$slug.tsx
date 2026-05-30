import { createFileRoute, notFound } from "@tanstack/react-router";
import { getSiteSettings, getMenu, getPublishedPage } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const page = await getPublishedPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    const [settings, header, footer] = await Promise.all([
      getSiteSettings(),
      getMenu({ data: { location: "header" } }),
      getMenu({ data: { location: "footer" } }),
    ]);
    return { page, settings, header, footer };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: loaderData.page.seo_title || loaderData.page.title },
      { name: "description", content: loaderData.page.seo_description || "" },
    ] : [],
  }),
  component: PageView,
  errorComponent: ({ error }) => <div className="p-12 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center text-muted-foreground">Page not found.</div>,
});

function PageView() {
  const { page, settings, header, footer } = Route.useLoaderData();
  const content = (page.content as any) ?? {};
  return (
    <div className="min-h-screen">
      <SiteHeader siteName={settings?.site_name ?? "CMS"} logoUrl={settings?.logo_url} items={header.items} />
      <article className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{page.title}</h1>
        <div className="prose prose-neutral mt-8 max-w-none">
          {(content.blocks ?? []).map((b: any, i: number) =>
            b.type === "paragraph" ? <p key={i}>{b.text}</p> : <div key={i} dangerouslySetInnerHTML={{ __html: b.html ?? "" }} />
          )}
        </div>
      </article>
      <SiteFooter items={footer.items} footerHtml={settings?.footer_html} />
    </div>
  );
}
