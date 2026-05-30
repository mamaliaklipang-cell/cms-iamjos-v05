import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getSiteSettings, getMenu } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { useCart, formatIDR } from "@/lib/cart";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Keranjang — IAMJOS-CMS" },
      { name: "description", content: "Keranjang belanja layanan dan theme IAMJOS-CMS." },
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
  component: CartPage,
  errorComponent: ({ error }) => <div className="p-12 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function CartPage() {
  const { settings, header, footer } = Route.useLoaderData();
  const { items, remove, setQty, subtotal, clear } = useCart();
  const nav = useNavigate();

  return (
    <div className="min-h-screen">
      <SiteHeader siteName={settings?.site_name ?? "IAMJOS-CMS"} logoUrl={settings?.logo_url} items={header.items} />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Keranjang Belanja</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pembayaran manual melalui transfer bank. Setelah checkout, Anda akan mendapat instruksi transfer & form upload bukti.
        </p>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Keranjang masih kosong</p>
            <p className="mt-1 text-sm text-muted-foreground">Pilih theme, layanan, atau paket VPS untuk mulai.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/themes" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Lihat Themes</Link>
              <Link to="/services" className="rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold hover:bg-accent">Lihat Layanan</Link>
              <Link to="/infrastructure" className="rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold hover:bg-accent">Lihat Infrastruktur</Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((it) => (
                <article key={it.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="h-24 w-32 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="grid h-24 w-32 shrink-0 place-items-center rounded-lg bg-accent text-xs uppercase tracking-wider text-muted-foreground">
                      {it.category}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{it.category}</p>
                        <h3 className="text-base font-bold">{it.name}</h3>
                        {it.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{it.description}</p>}
                      </div>
                      <button onClick={() => remove(it.id)} aria-label="Hapus" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <div className="inline-flex items-center rounded-lg border border-border">
                        <button onClick={() => setQty(it.id, it.quantity - 1)} className="p-2 hover:bg-accent" aria-label="Kurangi"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-10 text-center text-sm font-semibold">{it.quantity}</span>
                        <button onClick={() => setQty(it.id, it.quantity + 1)} className="p-2 hover:bg-accent" aria-label="Tambah"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="text-base font-bold text-primary">{formatIDR(it.unitPrice * it.quantity)}</p>
                    </div>
                  </div>
                </article>
              ))}
              <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">Kosongkan keranjang</button>
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold">Ringkasan</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal ({items.length} item)</dt>
                  <dd className="font-semibold">{formatIDR(subtotal)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-lg font-bold text-primary">{formatIDR(subtotal)}</dd>
                </div>
              </dl>
              <button
                onClick={() => nav({ to: "/checkout" })}
                className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Lanjut ke Checkout
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">Pembayaran manual via transfer bank</p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter items={footer.items} footerHtml={settings?.footer_html} />
    </div>
  );
}