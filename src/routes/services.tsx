import { createFileRoute, Link } from "@tanstack/react-router";
import { getSiteSettings, getMenu } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import {
  GraduationCap,
  FileCheck2,
  Globe2,
  BookOpenCheck,
  Users2,
  Headphones,
} from "lucide-react";

const SERVICES = [
  {
    icon: GraduationCap,
    title: "Pendampingan Akreditasi SINTA",
    desc: "Konsultasi & pendampingan menuju SINTA 1–6: kelengkapan dokumen, evaluasi diri, hingga submission ARJUNA.",
    price: "Mulai Rp 5.000.000",
  },
  {
    icon: FileCheck2,
    title: "Setup DOI & Crossref",
    desc: "Registrasi prefix DOI, deposit metadata Crossref, plugin OJS, dan QA per artikel terbitan.",
    price: "Mulai Rp 2.500.000",
  },
  {
    icon: Globe2,
    title: "Indeksasi Scopus & Scholar",
    desc: "Audit kepatuhan, perbaikan metadata, sitasi, hingga pendampingan submission indeksasi global.",
    price: "Mulai Rp 7.500.000",
  },
  {
    icon: BookOpenCheck,
    title: "Migrasi OJS 2 ke OJS 3",
    desc: "Migrasi data jurnal lama ke OJS 3 terbaru tanpa kehilangan riwayat artikel, user, dan issue.",
    price: "Mulai Rp 3.000.000",
  },
  {
    icon: Users2,
    title: "Pelatihan Editor & Reviewer",
    desc: "Workshop online/onsite untuk tim editorial: workflow OJS, ethics, plagiarism, copyediting.",
    price: "Mulai Rp 4.000.000",
  },
  {
    icon: Headphones,
    title: "Support Tahunan",
    desc: "Maintenance, update OJS, backup terjadwal, monitoring uptime, dan technical support prioritas.",
    price: "Mulai Rp 6.000.000 / tahun",
  },
];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Layanan Pendampingan Jurnal — IAMJOS-CMS" },
      {
        name: "description",
        content:
          "Layanan pendampingan rumah jurnal: akreditasi SINTA, DOI Crossref, indeksasi Scopus & Scholar, migrasi OJS, pelatihan editor.",
      },
      { property: "og:title", content: "Layanan Pendampingan Jurnal — IAMJOS-CMS" },
      {
        property: "og:description",
        content: "Pendampingan end-to-end rumah jurnal compliant standar global.",
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
  component: ServicesPage,
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function ServicesPage() {
  const { settings, header, footer } = Route.useLoaderData();
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
              Layanan · Pendampingan
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              Pendampingan <span className="text-primary">Rumah Jurnal</span>{" "}
              End-to-End
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Tim IAMJOS-CMS mendampingi jurnal Anda dari setup teknis hingga
              akreditasi nasional dan indeksasi internasional.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <article
                key={s.title}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">{s.title}</h3>
                </div>
                <p className="mt-4 flex-1 text-sm text-muted-foreground">
                  {s.desc}
                </p>
                <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
                  <p className="text-base font-bold text-primary">{s.price}</p>
                  <Link
                    to="/admin"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Konsultasi
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-accent/30">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Tidak yakin paket mana yang cocok?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Diskusi gratis 30 menit dengan tim kami untuk asesmen kebutuhan jurnal Anda.
            </p>
            <Link
              to="/admin"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Jadwalkan Konsultasi
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter items={footer.items} footerHtml={settings?.footer_html} />
    </div>
  );
}
