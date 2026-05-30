import { createFileRoute, notFound } from "@tanstack/react-router";
import { getSiteSettings, getMenu, getPublishedPost } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    const [settings, header, footer] = await Promise.all([
      getSiteSettings(), getMenu({ data: { location: "header" } }), getMenu({ data: { location: "footer" } }),
    ]);
    return { post, settings, header, footer };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.post.title }, { name: "description", content: loaderData.post.excerpt ?? "" }] : [],
  }),
  component: PostView,
  errorComponent: ({ error }) => <div className="p-12 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center text-muted-foreground">Post not found.</div>,
});

function PostView() {
  const { post, settings, header, footer } = Route.useLoaderData();
  const content = (post.content as any) ?? {};
  return (
    <div className="min-h-screen">
      <SiteHeader siteName={settings?.site_name ?? "CMS"} logoUrl={settings?.logo_url} items={header.items} />
      <article className="mx-auto max-w-3xl px-6 py-20">
        {post.cover_image && <img src={post.cover_image} alt="" className="mb-8 aspect-video w-full rounded-2xl object-cover" />}
        <h1 className="text-4xl font-bold md:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>}
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
