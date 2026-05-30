import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

type Item = { id: string; label: string; url: string | null };

export function SiteHeader({ siteName, logoUrl, items }: { siteName: string; logoUrl?: string | null; items: Item[] }) {
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

export function SiteFooter({ items, footerHtml }: { items: Item[]; footerHtml?: string | null }) {
  return (
    <footer className="mt-24 border-t border-border bg-gradient-subtle">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <nav className="mb-8 flex flex-wrap gap-x-7 gap-y-3 text-sm">
          {items.map((it) => (
            <a key={it.id} href={it.url ?? "#"} className="font-medium text-muted-foreground transition-colors hover:text-foreground">
              {it.label}
            </a>
          ))}
        </nav>
        {footerHtml ? (
          <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: footerHtml }} />
        ) : null}
      </div>
    </footer>
  );
}
