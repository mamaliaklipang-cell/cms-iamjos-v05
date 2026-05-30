import { createFileRoute, Link } from "@tanstack/react-router";
import { getSiteSettings, getMenu } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { Server, Globe, ShieldCheck, Cpu, HardDrive, Mail, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

const PLANS = [
  {
    icon: Server,
    name: "VPS Starter",
    spec: "2 vCPU · 4 GB RAM · 80 GB SSD",
    desc: "Cocok untuk 1–2 rumah jurnal aktif dengan traffic moderat.",
    price: 350_000,
    priceLabel: "Rp 350.000",
    period: "/ bulan",
    highlight: false,
  },
  {
    icon: Cpu,
    name: "VPS Professional",
    spec: "4 vCPU · 8 GB RAM · 160 GB SSD",
    desc: "Direkomendasikan untuk 3–6 rumah jurnal dengan trafik tinggi.",
    price: 750_000,
    priceLabel: "Rp 750.000",
    period: "/ bulan",
    highlight: true,
  },
  {
    icon: HardDrive,
    name: "VPS Enterprise",
    spec: "8 vCPU · 16 GB RAM · 320 GB SSD",
    desc: "Untuk konsorsium jurnal universitas dengan banyak instance OJS.",
    price: 1_500_000,
    priceLabel: "Rp 1.500.000",
    period: "/ bulan",
    highlight: false,
  },
];

const ADDONS = [
  {
    icon: Globe,
    title: "Domain .com / .id / .ac.id",
    desc: "Registrasi & perpanjangan domain dengan DNS terkelola.",
    price: "Mulai Rp 150.000 / tahun",
  },
  {
    icon: ShieldCheck,
    title: "SSL & Backup Harian",
    desc: "SSL otomatis Let's Encrypt + snapshot backup harian tersimpan 30 hari.",
    price: "Termasuk semua paket",
  },
  {
    icon: Mail,
    title: "Email Jurnal",
    desc: "Mailbox profesional untuk editor & manajemen jurnal (5–20 akun).",
    price: "Mulai Rp 50.000 / akun / bulan",
  },
];

export const Route = createFileRoute("/infrastructure")({
  head: () => ({
    meta: [
      { title: "VPS, Domain & Infrastruktur — IAMJOS-CMS" },
      {
        name: "description",
        content:
          "Paket VPS, domain, SSL, backup, dan email untuk rumah jurnal. Infrastruktur terkelola IAMJOS-CMS.",
      },
      { property: "og:title", content: "VPS, Domain & Infrastruktur — IAMJOS-CMS" },
      {
        property: "og:description",
        content: "Infrastruktur terkelola untuk rumah jurnal OJS.",
      },
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
  component: InfraPage,
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function InfraPage() {
  const { settings, header, footer } = Route.useLoaderData();
  const { add } = useCart();
  return (
    <div className="min-h-screen">
      <SiteHeader
        siteName={settings?.site_name ?? "IAMJOS-CMS"}
        logoUrl={settings?.logo_url}
        items={header.items}
      />
      <main>
        <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Infrastruktur · VPS & Domain
            </p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-4xl">
              Infrastruktur <span className="text-primary">Terkelola</span> untuk
              Rumah Jurnal
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              VPS performa tinggi, domain, SSL, backup harian, dan email jurnal
              dalam satu langganan. Tim kami yang urus, Anda tinggal fokus
              publikasi.
            </p>
          </div>
        </section>

        {/* VPS plans */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Paket VPS
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <article
                key={p.name}
                className={`group flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
                  p.highlight ? "border-primary ring-2 ring-primary/30" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">{p.name}</h3>
                  {p.highlight && (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                      Populer
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">{p.spec}</p>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{p.priceLabel}</p>
                    <p className="text-xs text-muted-foreground">{p.period}</p>
                  </div>
                  <Link
                    to="/cart"
                    onClick={() => {
                      add({
                        id: `infra:${p.name}`,
                        category: "infrastructure",
                        name: p.name,
                        description: `${p.spec} · ${p.period}`,
                        unitPrice: p.price,
                      });
                      toast.success(`${p.name} ditambahkan ke keranjang`);
                    }}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <span className="inline-flex items-center gap-1.5"><ShoppingCart className="h-3.5 w-3.5" /> Pesan</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Add-ons */}
        <section className="border-t border-border bg-accent/20">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Domain & Layanan Tambahan
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {ADDONS.map((a) => (
                <article
                  key={a.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <a.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">{a.title}</h3>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{a.desc}</p>
                  <p className="mt-4 text-sm font-semibold text-primary">{a.price}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Bundling dengan Theme & Pendampingan
            </h2>
            <p className="mt-3 text-muted-foreground">
              Hemat hingga 25% dengan bundling VPS, theme premium IamJOS, dan paket pendampingan.
            </p>
            <Link
              to="/admin"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Minta Penawaran
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter items={footer.items} footerHtml={settings?.footer_html} />
    </div>
  );
}
