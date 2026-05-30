import { createFileRoute, Link } from "@tanstack/react-router";
import { getSiteSettings, getMenu } from "@/lib/cms/public.functions";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { formatIDR, BANK_INFO } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Copy, Upload, Clock } from "lucide-react";

export const Route = createFileRoute("/checkout/success/$orderNumber")({
  head: ({ params }) => ({
    meta: [{ title: `Pesanan ${params.orderNumber} — IAMJOS-CMS` }],
  }),
  loader: async ({ params }) => {
    const [settings, header, footer] = await Promise.all([
      getSiteSettings(),
      getMenu({ data: { location: "header" } }),
      getMenu({ data: { location: "footer" } }),
    ]);
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", params.orderNumber)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Pesanan tidak ditemukan");
    return { settings, header, footer, order };
  },
  component: SuccessPage,
  errorComponent: ({ error }) => <div className="p-12 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Pesanan tidak ditemukan</div>,
});

function SuccessPage() {
  const { settings, header, footer, order } = Route.useLoaderData();
  const [file, setFile] = useState<File | null>(null);
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(order.status !== "pending");

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Disalin");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Pilih file bukti transfer");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5 MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      toast.error("Format harus JPG, PNG, WEBP, atau PDF");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${order.order_number}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: true });
    if (upErr) {
      setUploading(false);
      toast.error("Upload gagal: " + upErr.message);
      return;
    }
    const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);
    const notes = `Pengirim: ${senderName}${senderBank ? ` (${senderBank})` : ""}\n---\n${order.customer_notes ?? ""}`;
    const { error: updErr } = await supabase
      .from("orders")
      .update({
        payment_proof_url: urlData.publicUrl,
        status: "awaiting_verification",
        customer_notes: notes,
      })
      .eq("order_number", order.order_number);
    setUploading(false);
    if (updErr) {
      toast.error("Konfirmasi gagal: " + updErr.message);
      return;
    }
    setSubmitted(true);
    toast.success("Bukti transfer terkirim. Tim kami akan memverifikasi.");
  };

  const items = (order.items as Array<{ name: string; quantity: number; unitPrice: number }>) ?? [];

  return (
    <div className="min-h-screen">
      <SiteHeader siteName={settings?.site_name ?? "IAMJOS-CMS"} logoUrl={settings?.logo_url} items={header.items} />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pesanan Berhasil Dibuat</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Nomor pesanan: <span className="font-mono font-semibold text-foreground">{order.order_number}</span>
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Bank info */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold">Instruksi Transfer</h2>
            <p className="mt-1 text-xs text-muted-foreground">Transfer total tagihan ke salah satu rekening berikut:</p>

            <BankCard {...BANK_INFO} onCopy={copy} />
            <BankCard
              bankName={BANK_INFO.alt.bankName}
              accountNumber={BANK_INFO.alt.accountNumber}
              accountHolder={BANK_INFO.alt.accountHolder}
              onCopy={copy}
            />

            <div className="mt-4 rounded-lg bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground">Total yang harus ditransfer</p>
              <p className="mt-1 text-2xl font-bold text-primary">{formatIDR(order.subtotal)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Mohon transfer dengan nominal persis untuk mempercepat verifikasi.</p>
            </div>
          </section>

          {/* Order summary */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold">Ringkasan Pesanan</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((it, idx) => (
                <li key={idx} className="flex justify-between gap-3">
                  <span>
                    <span className="font-medium">{it.name}</span>
                    <span className="block text-xs text-muted-foreground">{it.quantity} × {formatIDR(it.unitPrice)}</span>
                  </span>
                  <span className="font-semibold">{formatIDR(it.unitPrice * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">{formatIDR(order.subtotal)}</span>
            </div>
            <div className="mt-4 space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
              <p><strong className="text-foreground">{order.customer_name}</strong></p>
              <p>{order.customer_email} · {order.customer_phone}</p>
              {order.customer_institution && <p>{order.customer_institution}</p>}
            </div>
          </section>
        </div>

        {/* Upload proof */}
        <section className="mt-8 rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Konfirmasi & Upload Bukti Transfer</h2>
          </div>

          {submitted ? (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-primary/10 p-4">
              <Clock className="h-5 w-5 text-primary" />
              <div className="flex-1 text-sm">
                <p className="font-semibold">Bukti transfer telah dikirim</p>
                <p className="text-xs text-muted-foreground">Tim IAMJOS-CMS akan memverifikasi pembayaran dalam 1×24 jam dan menghubungi Anda via WhatsApp/email.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Pengirim *</span>
                  <input required value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank Pengirim</span>
                  <input value={senderBank} onChange={(e) => setSenderBank(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="contoh: BCA / Mandiri" />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">File Bukti (JPG/PNG/WEBP/PDF, maks 5 MB) *</span>
                <input
                  required
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                />
              </label>
              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {uploading ? "Mengunggah…" : "Kirim Bukti Transfer"}
              </button>
            </form>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Kembali ke beranda</Link>
        </div>
      </main>
      <SiteFooter items={footer.items} footerHtml={settings?.footer_html} />
    </div>
  );
}

function BankCard({
  bankName, accountNumber, accountHolder, onCopy,
}: { bankName: string; accountNumber: string; accountHolder: string; onCopy: (s: string) => void }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bankName}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="font-mono text-lg font-bold tracking-wider">{accountNumber}</p>
        <button type="button" onClick={() => onCopy(accountNumber)} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-accent">
          <Copy className="h-3 w-3" /> Salin
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">a.n. {accountHolder}</p>
    </div>
  );
}