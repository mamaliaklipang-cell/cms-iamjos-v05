import { createFileRoute, Link } from "@tanstack/react-router";
import { getSiteSettings, getMenu } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { useCart, formatIDR } from "@/lib/cart";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import v01 from "@/assets/themes/iamjos-v01.jpg";
import v02 from "@/assets/themes/iamjos-v02.jpg";
import v03 from "@/assets/themes/iamjos-v03.jpg";
import v04 from "@/assets/themes/iamjos-v04.jpg";
import v05 from "@/assets/themes/iamjos-v05.jpg";
import v06 from "@/assets/themes/iamjos-v06.jpg";
import v07 from "@/assets/themes/iamjos-v07.jpg";
import v08 from "@/assets/themes/iamjos-v08.jpg";
import v09 from "@/assets/themes/iamjos-v09.jpg";

const THEMES = [
  { name: "IamJOS-v01", tagline: "Classic Editorial", style: "Navy & Serif", image: v01 },
  { name: "IamJOS-v02", tagline: "Modern Minimal", style: "Emerald Clean", image: v02 },
  { name: "IamJOS-v03", tagline: "University Press", style: "Burgundy & Cream", image: v03 },
  { name: "IamJOS-v04", tagline: "Scientific Dark", style: "Navy & Cyan", image: v04 },
  { name: "IamJOS-v05", tagline: "Magazine Style", style: "Amber Editorial", image: v05 },
  { name: "IamJOS-v06", tagline: "OJS Classic", style: "Teal Standard", image: v06 },
  { name: "IamJOS-v07", tagline: "Bold Contemporary", style: "Black & Gold", image: v07 },
  { name: "IamJOS-v08", tagline: "Medical Clinical", style: "Soft Blue", image: v08 },
  { name: "IamJOS-v09", tagline: "Humanities", style: "Purple Literary", image: v09 },
];

const PRICE_VALUE = 1_000_000;
const PRICE_LABEL = formatIDR(PRICE_VALUE);

export const Route = createFileRoute("/themes")({
  head: () => ({
    meta: [
      { title: "Premium Themes Rumah Jurnal — IAMJOS-CMS" },
      { name: "description", content: "Pilihan premium theme rumah jurnal IAMJOS-CMS, sesuai standar Scholar, DOI, Scopus, Crossref & OJS. Rp 1.000.000 per rumah jurnal." },
      { property: "og:title", content: "Premium Themes Rumah Jurnal — IAMJOS-CMS" },
      { property: "og:description", content: "9 premium theme rumah jurnal, compliant indeksasi global." },
    ],
  }),
  loader: async () => {
    const [settings, header, footer] = await Promise.all([
      getSiteSettings(),
      getMenu({ data: { location: "header" } }),
      getMenu({ data: { location: "footer" } }),
    ]);
    return { settings, header, footer };
  },
  component: ThemesPage,
  errorComponent: ({ error }) => <div className="p-12 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function ThemesPage() {
  const { settings, header, footer } = Route.useLoaderData();
  const { add } = useCart();
  return (
    <div className="min-h-screen">
      <SiteHeader siteName={settings?.site_name ?? "IAMJOS-CMS"} logoUrl={settings?.logo_url} items={header.items} />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Premium Themes · Rumah Jurnal
            </p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-4xl">
              Pilihan Theme Premium <span className="text-primary">IamJOS</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              9 desain rumah jurnal siap pakai, sudah disesuaikan dengan standar
              Google Scholar, DOI, Scopus, Crossref dan OJS Compliance. Satu
              harga untuk satu rumah jurnal.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 shadow-sm">
              <span className="text-sm text-muted-foreground">Harga per rumah jurnal</span>
              <span className="text-lg font-bold text-primary">{PRICE_LABEL}</span>
            </div>
          </div>
        </section>

        {/* Grid 3x3 */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((t) => (
              <article
                key={t.name}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={t.image}
                    alt={`${t.name} — ${t.tagline}`}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">
                    Premium
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">{t.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                      {t.style}
                    </span>
                  </div>
                  <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">/ rumah jurnal</p>
                      <p className="text-xl font-bold text-primary">{PRICE_LABEL}</p>
                    </div>
                    <Link
                      to="/cart"
                      onClick={() => {
                        add({
                          id: `theme:${t.name}`,
                          category: "theme",
                          name: t.name,
                          description: `${t.tagline} · ${t.style}`,
                          unitPrice: PRICE_VALUE,
                          image: t.image,
                        });
                        toast.success(`${t.name} ditambahkan ke keranjang`);
                      }}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <span className="inline-flex items-center gap-1.5"><ShoppingCart className="h-3.5 w-3.5" /> Pesan</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-accent/30">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Butuh kustomisasi?</h2>
            <p className="mt-3 text-muted-foreground">
              Tim IAMJOS-CMS siap mendampingi instalasi, indeksasi, hingga VPS & domain.
            </p>
            <Link
              to="/admin"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Hubungi Tim
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter items={footer.items} footerHtml={settings?.footer_html} />
    </div>
  );
}
