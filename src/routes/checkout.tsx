import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getSiteSettings, getMenu } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { useCart, formatIDR } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — IAMJOS-CMS" },
      { name: "description", content: "Checkout pesanan IAMJOS-CMS via transfer bank manual." },
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
  component: CheckoutPage,
  errorComponent: ({ error }) => <div className="p-12 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  customer_email: z.string().trim().email("Email tidak valid").max(255),
  customer_phone: z.string().trim().min(8, "Nomor tidak valid").max(20),
  customer_institution: z.string().trim().max(200).optional().or(z.literal("")),
  customer_notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

function genOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `JOS-${ymd}-${rand}`;
}

function CheckoutPage() {
  const { settings, header, footer } = Route.useLoaderData();
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_institution: "",
    customer_notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Form belum lengkap");
      return;
    }
    setSubmitting(true);
    const order_number = genOrderNumber();
    const { error } = await supabase.from("orders").insert({
      order_number,
      customer_name: parsed.data.customer_name,
      customer_email: parsed.data.customer_email,
      customer_phone: parsed.data.customer_phone,
      customer_institution: parsed.data.customer_institution || null,
      customer_notes: parsed.data.customer_notes || null,
      items: items as any,
      subtotal,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Gagal membuat pesanan: " + error.message);
      return;
    }
    clear();
    toast.success("Pesanan dibuat. Silakan lakukan transfer.");
    nav({ to: "/checkout/success/$orderNumber", params: { orderNumber: order_number } });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader siteName={settings?.site_name ?? "IAMJOS-CMS"} logoUrl={settings?.logo_url} items={header.items} />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">Isi data pemesan. Pembayaran via transfer bank manual.</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Keranjang kosong.</p>
            <Link to="/cart" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Kembali ke Keranjang</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold">Data Pemesan</h2>
              <Field label="Nama Lengkap *">
                <input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={INPUT} />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Email *">
                  <input required type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className={INPUT} />
                </Field>
                <Field label="No. WhatsApp *">
                  <input required value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={INPUT} placeholder="08xxxxxxxxxx" />
                </Field>
              </div>
              <Field label="Institusi / Universitas">
                <input value={form.customer_institution} onChange={(e) => setForm({ ...form, customer_institution: e.target.value })} className={INPUT} />
              </Field>
              <Field label="Catatan Pesanan">
                <textarea rows={4} value={form.customer_notes} onChange={(e) => setForm({ ...form, customer_notes: e.target.value })} className={INPUT} placeholder="Nama jurnal, kebutuhan khusus, dst." />
              </Field>
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold">Ringkasan Pesanan</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3">
                    <span className="flex-1">
                      <span className="font-medium">{it.name}</span>
                      <span className="block text-xs text-muted-foreground">{it.quantity} × {formatIDR(it.unitPrice)}</span>
                    </span>
                    <span className="font-semibold">{formatIDR(it.unitPrice * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">{formatIDR(subtotal)}</span>
              </div>
              <button disabled={submitting} type="submit" className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {submitting ? "Memproses…" : "Buat Pesanan"}
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">Instruksi transfer & form bukti akan muncul setelah ini.</p>
            </aside>

          </form>
        )}
      </main>
      <SiteFooter items={footer.items} footerHtml={settings?.footer_html} />
    </div>
  );
}

const INPUT = "block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}