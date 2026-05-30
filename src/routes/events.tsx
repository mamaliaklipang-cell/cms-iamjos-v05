import { createFileRoute } from "@tanstack/react-router";
import { getSiteSettings, getMenu } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { CalendarDays, MapPin, Clock, Users, ArrowUpRight } from "lucide-react";

type EventItem = {
  title: string;
  date: string; // ISO
  time: string;
  location: string;
  mode: "Online" | "Onsite" | "Hybrid";
  category: string;
  speaker: string;
  seats: string;
  desc: string;
  featured?: boolean;
};

const EVENTS: EventItem[] = [
  {
    title: "Webinar Nasional: Strategi Akreditasi SINTA 2026",
    date: "2026-06-12",
    time: "09.00 – 12.00 WIB",
    location: "Zoom Meeting",
    mode: "Online",
    category: "Webinar",
    speaker: "Dr. Andi Pratama, M.Kom",
    seats: "Sisa 120 kursi",
    desc: "Pembahasan tuntas kelengkapan dokumen, evaluasi diri, dan submission ARJUNA menuju akreditasi SINTA peringkat atas.",
    featured: true,
  },
  {
    title: "Workshop OJS 3: Workflow Editorial & Reviewer",
    date: "2026-06-20",
    time: "13.00 – 16.30 WIB",
    location: "Universitas Gadjah Mada, Yogyakarta",
    mode: "Hybrid",
    category: "Workshop",
    speaker: "Tim IAMJOS-CMS",
    seats: "Sisa 45 kursi",
    desc: "Praktik langsung mengelola submission, copyediting, hingga publikasi issue di OJS 3 terbaru.",
  },
  {
    title: "Coaching Clinic: Setup DOI & Crossref",
    date: "2026-07-03",
    time: "10.00 – 12.00 WIB",
    location: "Google Meet",
    mode: "Online",
    category: "Coaching",
    speaker: "Rizki Hadiansyah, S.T",
    seats: "Sisa 60 kursi",
    desc: "Registrasi prefix DOI, deposit metadata Crossref, dan QA per artikel terbitan untuk jurnal Anda.",
  },
  {
    title: "Seminar Indeksasi Scopus & Google Scholar",
    date: "2026-07-18",
    time: "08.30 – 15.00 WIB",
    location: "Hotel Tentrem, Yogyakarta",
    mode: "Onsite",
    category: "Seminar",
    speaker: "Prof. Sri Wahyuni, Ph.D",
    seats: "Sisa 30 kursi",
    desc: "Audit kepatuhan, perbaikan metadata, dan strategi submission menuju indeksasi global bereputasi.",
  },
];

const AGENDA = [
  { date: "2026-06-12", label: "Webinar Akreditasi SINTA", tag: "Webinar" },
  { date: "2026-06-20", label: "Workshop OJS 3 Editorial", tag: "Workshop" },
  { date: "2026-07-03", label: "Coaching DOI & Crossref", tag: "Coaching" },
  { date: "2026-07-18", label: "Seminar Indeksasi Scopus", tag: "Seminar" },
  { date: "2026-08-05", label: "Pelatihan Plagiarism & Ethics", tag: "Pelatihan" },
  { date: "2026-08-22", label: "Forum Pengelola Jurnal Nasional", tag: "Forum" },
];

const MODE_COLOR: Record<string, string> = {
  Online: "bg-emerald-100 text-emerald-900",
  Onsite: "bg-amber-100 text-amber-900",
  Hybrid: "bg-violet-100 text-violet-900",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}
function dayMonth(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("id-ID", { day: "2-digit" }),
    month: d.toLocaleDateString("id-ID", { month: "short" }),
  };
}

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Event & Agenda — IAMJOS-CMS" },
      { name: "description", content: "Jadwal webinar, workshop, seminar, dan coaching clinic seputar pengelolaan dan indeksasi jurnal ilmiah bersama IAMJOS-CMS." },
      { property: "og:title", content: "Event & Agenda — IAMJOS-CMS" },
      { property: "og:description", content: "Ikuti webinar, workshop, dan seminar jurnal ilmiah bersama IAMJOS-CMS." },
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
  component: EventsPage,
  errorComponent: ({ error }) => <div className="p-12 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function EventsPage() {
  const { settings, header, footer } = Route.useLoaderData();
  const [featured, ...rest] = EVENTS;
  return (
    <div className="min-h-screen">
      <SiteHeader siteName={settings?.site_name ?? "IAMJOS-CMS"} logoUrl={settings?.logo_url} items={header.items} />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Event & Agenda</p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-4xl">
              Acara & <span className="text-primary">Agenda</span> Komunitas Jurnal
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Webinar, workshop, seminar, dan coaching clinic untuk meningkatkan kualitas dan reputasi rumah jurnal Anda.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            {/* Events list */}
            <div>
              {/* Featured */}
              <article className="group overflow-hidden rounded-3xl border border-primary/30 bg-card shadow-elegant ring-1 ring-primary/10">
                <div className="bg-gradient-primary px-7 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  ⭐ Event Unggulan
                </div>
                <div className="p-7">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">{featured.category}</span>
                    <span className={`rounded-full px-3 py-1 ${MODE_COLOR[featured.mode]}`}>{featured.mode}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight">{featured.title}</h2>
                  <p className="mt-3 text-muted-foreground">{featured.desc}</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Detail icon={CalendarDays} label={fmtDate(featured.date)} />
                    <Detail icon={Clock} label={featured.time} />
                    <Detail icon={MapPin} label={featured.location} />
                    <Detail icon={Users} label={`${featured.speaker} · ${featured.seats}`} />
                  </div>
                  <button className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                    Daftar Sekarang <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </article>

              {/* Other events */}
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {rest.map((e) => {
                  const dm = dayMonth(e.date);
                  return (
                    <article key={e.title} className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex items-start gap-4">
                        <div className="grid shrink-0 place-items-center rounded-xl bg-primary/10 px-3 py-2 text-center text-primary">
                          <span className="text-xl font-extrabold leading-none">{dm.day}</span>
                          <span className="text-[11px] font-semibold uppercase">{dm.month}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                            <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{e.category}</span>
                            <span className={`rounded-full px-2 py-0.5 ${MODE_COLOR[e.mode]}`}>{e.mode}</span>
                          </div>
                          <h3 className="mt-2 font-bold leading-snug tracking-tight">{e.title}</h3>
                        </div>
                      </div>
                      <p className="mt-4 flex-1 text-sm text-muted-foreground">{e.desc}</p>
                      <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> {e.time}</li>
                        <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" /> {e.location}</li>
                        <li className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> {e.seats}</li>
                      </ul>
                      <button className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                        Daftar <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Agenda sidebar */}
            <aside className="h-fit lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold tracking-tight">Agenda Mendatang</h2>
                </div>
                <ol className="mt-5 space-y-4">
                  {AGENDA.map((a, i) => {
                    const dm = dayMonth(a.date);
                    return (
                      <li key={i} className="relative flex gap-4 pl-1">
                        <div className="flex flex-col items-center">
                          <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-center text-primary">
                            <span className="text-sm font-extrabold leading-none">{dm.day}</span>
                            <span className="text-[9px] font-semibold uppercase">{dm.month}</span>
                          </span>
                          {i < AGENDA.length - 1 && <span className="mt-1 w-px flex-1 bg-border" aria-hidden />}
                        </div>
                        <div className="pb-1">
                          <p className="text-sm font-semibold leading-snug">{a.label}</p>
                          <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">{a.tag}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="mt-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-accent/50 to-card p-6 text-center shadow-sm">
                <h3 className="font-bold tracking-tight">Punya acara jurnal?</h3>
                <p className="mt-2 text-sm text-muted-foreground">Kami siap menjadi mitra penyelenggara webinar & workshop Anda.</p>
                <a href="/services" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Ajukan Kerja Sama
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter
        items={footer.items}
        footerHtml={settings?.footer_html}
        siteName={settings?.site_name ?? "IAMJOS-CMS"}
        tagline={settings?.tagline ?? undefined}
        socialLinks={settings?.social_links as Record<string, string> | null}
      />
    </div>
  );
}

function Detail({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-foreground">{label}</span>
    </div>
  );
}
