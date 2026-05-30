import { createFileRoute, Link } from "@tanstack/react-router";
import { getSiteSettings, getMenu, listPublishedPosts } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const [settings, header, footer, posts] = await Promise.all([
      getSiteSettings(), getMenu({ data: { location: "header" } }),
      getMenu({ data: { location: "footer" } }), listPublishedPosts({ data: { limit: 50 } }),
    ]);
    return { settings, header, footer, posts };
  },
  component: BlogIndex,
  errorComponent: ({ error }) => <div className="p-12 text-center text-destructive">{error.message}</div>,
});

function BlogIndex() {
  const { settings, header, footer, posts } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader siteName={settings?.site_name ?? "CMS"} logoUrl={settings?.logo_url} items={header.items} />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-4xl font-bold md:text-5xl">Blog</h1>
        <p className="mt-2 text-muted-foreground">Latest articles & news.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.length === 0 && <p className="text-muted-foreground md:col-span-3">No posts yet.</p>}
          {posts.map((p: any) => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group rounded-2xl border border-border bg-card p-6 hover:bg-accent">
              {p.cover_image && <img src={p.cover_image} alt="" className="mb-4 aspect-video w-full rounded-lg object-cover" />}
              <h3 className="text-lg font-semibold group-hover:text-primary">{p.title}</h3>
              {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter items={footer.items} footerHtml={settings?.footer_html} />
    </div>
  );
}
