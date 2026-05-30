import { Link } from "@tanstack/react-router";

type Item = { id: string; label: string; url: string | null };

export function SiteHeader({ siteName, logoUrl, items }: { siteName: string; logoUrl?: string | null; items: Item[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          {logoUrl ? <img src={logoUrl} alt={siteName} className="h-7" /> : null}
          <span className="text-base font-bold tracking-tight">{siteName}</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {items.map((it) => (
            <a key={it.id} href={it.url ?? "#"} className="text-muted-foreground transition-colors hover:text-foreground">
              {it.label}
            </a>
          ))}
          <Link to="/login" className="rounded-full bg-primary px-4 py-1.5 text-primary-foreground hover:opacity-90">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ items, footerHtml }: { items: Item[]; footerHtml?: string | null }) {
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <nav className="mb-6 flex flex-wrap gap-6 text-sm">
          {items.map((it) => (
            <a key={it.id} href={it.url ?? "#"} className="text-muted-foreground hover:text-foreground">
              {it.label}
            </a>
          ))}
        </nav>
        {footerHtml ? <div dangerouslySetInnerHTML={{ __html: footerHtml }} /> : null}
      </div>
    </footer>
  );
}
