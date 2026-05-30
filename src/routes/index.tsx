import { createFileRoute } from "@tanstack/react-router";
import { getSiteSettings, getMenu, getHomeSections, listPublishedPosts } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { SectionRenderer } from "@/components/site/sections";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [settings, header, footer, sections, posts] = await Promise.all([
      getSiteSettings(),
      getMenu({ data: { location: "header" } }),
      getMenu({ data: { location: "footer" } }),
      getHomeSections(),
      listPublishedPosts({ data: { limit: 6 } }),
    ]);
    return { settings, header, footer, sections, posts };
  },
  component: Home,
  errorComponent: ({ error }) => <div className="p-12 text-center text-destructive">{error.message}</div>,
});

function Home() {
  const { settings, header, footer, sections, posts } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader siteName={settings?.site_name ?? "CMS"} logoUrl={settings?.logo_url} items={header.items} />
      <main>
        <SectionRenderer sections={sections} heroDefault={settings?.hero_default ?? {}} posts={posts} />
      </main>
      <SiteFooter items={footer.items} footerHtml={settings?.footer_html} siteName={settings?.site_name ?? "IAMJOS-CMS"} tagline={settings?.tagline ?? undefined} socialLinks={settings?.social_links as Record<string, string> | null} />
    </div>
  );
}
