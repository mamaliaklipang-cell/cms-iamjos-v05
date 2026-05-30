import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Fragment, useEffect, useState } from "react";
import { formatIDR } from "@/lib/cart";
import { toast } from "sonner";
import { ExternalLink, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_institution: string | null;
  customer_notes: string | null;
  items: Array<{ name: string; quantity: number; unitPrice: number; category: string }>;
  subtotal: number;
  status: string;
  payment_proof_url: string | null;
  paid_at: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Menunggu Transfer", color: "bg-muted text-muted-foreground" },
  { value: "awaiting_verification", label: "Menunggu Verifikasi", color: "bg-amber-100 text-amber-900" },
  { value: "paid", label: "Lunas", color: "bg-emerald-100 text-emerald-900" },
  { value: "cancelled", label: "Dibatalkan", color: "bg-red-100 text-red-900" },
];

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOrders((data ?? []) as any);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "paid") patch.paid_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status diperbarui");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pesanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Daftar pesanan masuk dari Themes, Layanan, dan Infrastruktur.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Memuat…</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Belum ada pesanan.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">No. Pesanan</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bukti</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const isOpen = open === o.id;
                const statusInfo = STATUS_OPTIONS.find((s) => s.value === o.status);
                return (
                  <Fragment key={o.id}>
                    <tr className="border-b border-border last:border-0 hover:bg-accent/30">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{o.order_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatIDR(o.subtotal)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusInfo?.color ?? "bg-muted"}`}>
                          {statusInfo?.label ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {o.payment_proof_url ? (
                          <a href={o.payment_proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            Lihat <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setOpen(isOpen ? null : o.id)} className="text-xs font-semibold text-primary hover:underline">
                          {isOpen ? "Tutup" : "Detail"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-muted/20">
                        <td colSpan={7} className="px-4 py-5">
                          <div className="grid gap-6 md:grid-cols-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item</p>
                              <ul className="mt-2 space-y-2 text-sm">
                                {o.items.map((it, i) => (
                                  <li key={i} className="flex justify-between gap-3">
                                    <span>
                                      <span className="font-medium">{it.name}</span>
                                      <span className="block text-xs text-muted-foreground">{it.category} · {it.quantity}×</span>
                                    </span>
                                    <span className="font-semibold">{formatIDR(it.unitPrice * it.quantity)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kontak</p>
                              <p className="mt-2 text-sm">{o.customer_phone}</p>
                              {o.customer_institution && <p className="text-xs text-muted-foreground">{o.customer_institution}</p>}
                              {o.customer_notes && (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catatan</p>
                                  <p className="mt-1 whitespace-pre-wrap text-xs">{o.customer_notes}</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ubah Status</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map((s) => (
                                  <button
                                    key={s.value}
                                    onClick={() => updateStatus(o.id, s.value)}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                      o.status === s.value ? "bg-primary text-primary-foreground" : "border border-border bg-background hover:bg-accent"
                                    }`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}