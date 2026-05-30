import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShoppingCart, Mail, MapPin, Phone, Twitter, Linkedin, Github, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart";

type Item = { id: string; label: string; url: string | null };

export function SiteHeader({ siteName, logoUrl, items }: { siteName: string; logoUrl?: string | null; items: Item[] }) {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-7" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-sm font-bold text-primary-foreground shadow-soft">
              {siteName.charAt(0)}
            </span>
          )}
          <span className="text-base font-bold tracking-tight">{siteName}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {items.map((it) => (
            <a key={it.id} href={it.url ?? "#"} className="font-medium text-muted-foreground transition-colors hover:text-foreground">
              {it.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            aria-label="Keranjang"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link to="/login" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:inline-block">
            Sign in
          </Link>
          <Link to="/login" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-elegant hover:-translate-y-0.5">
            Get started <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({
  items,
  footerHtml,
  siteName = "IAMJOS-CMS",
  tagline = "Rumah Jurnal Premium & Pendampingan Indeksasi",
  socialLinks,
}: {
  items: Item[];
  footerHtml?: string | null;
  siteName?: string;
  tagline?: string;
  socialLinks?: Record<string, string> | null;
}) {
  const social = socialLinks ?? {};
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[oklch(0.18_0.03_265)] text-white/80">
      {/* glow accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gradient-primary opacity-20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-12 h-80 w-80 rounded-full bg-primary-glow/20 blur-3xl" aria-hidden style={{ background: "var(--gradient-primary)", opacity: 0.12 }} />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + newsletter */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                {siteName.charAt(0)}
              </span>
              <span className="text-lg font-bold tracking-tight text-white">{siteName}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{tagline}</p>

            <div className="mt-6">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Newsletter Jurnal
              </p>
              <form className="mt-3 flex max-w-sm overflow-hidden rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/40 outline-none"
                />
                <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5">
                  Langganan <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Navigasi</h4>
            <nav className="mt-5 flex flex-col gap-3 text-sm">
              {items.map((it) => (
                <a key={it.id} href={it.url ?? "#"} className="w-fit text-white/70 transition-colors hover:text-white">
                  {it.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Kontak</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-primary-glow" /> halo@iamjos-cms.id</li>
              <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-primary-glow" /> +62 812-0000-1234</li>
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-primary-glow" /> Yogyakarta, Indonesia</li>
            </ul>
            <div className="mt-6 flex gap-2.5">
              {[
                { href: social.twitter ?? "#", Icon: Twitter },
                { href: social.linkedin ?? "#", Icon: Linkedin },
                { href: social.github ?? "#", Icon: Github },
              ].map(({ href, Icon }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all hover:-translate-y-0.5 hover:border-primary-glow/50 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row">
          {footerHtml ? (
            <div className="[&_p]:m-0" dangerouslySetInnerHTML={{ __html: footerHtml }} />
          ) : (
            <p>© 2026 {siteName}. All rights reserved.</p>
          )}
          <p className="text-white/40">Dibuat dengan ❤️ untuk komunitas jurnal Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
