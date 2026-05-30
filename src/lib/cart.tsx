import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string; // unique key (category + slug)
  category: "theme" | "service" | "infrastructure";
  name: string;
  description?: string;
  unitPrice: number; // IDR
  quantity: number;
  image?: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "iamjos_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add: CartCtx["add"] = (item) =>
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      const qty = item.quantity ?? 1;
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + qty } : p,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });

  const remove: CartCtx["remove"] = (id) =>
    setItems((p) => p.filter((x) => x.id !== id));

  const setQty: CartCtx["setQty"] = (id, qty) =>
    setItems((p) =>
      p.map((x) => (x.id === id ? { ...x, quantity: Math.max(1, qty) } : x)),
    );

  const clear = () => setItems([]);

  const count = items.reduce((s, x) => s + x.quantity, 0);
  const subtotal = items.reduce((s, x) => s + x.unitPrice * x.quantity, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, subtotal }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}

export const formatIDR = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");

export const BANK_INFO = {
  bankName: "Bank Mandiri",
  accountNumber: "1340099887766",
  accountHolder: "PT IAMJOS Digital Nusantara",
  alt: {
    bankName: "BCA",
    accountNumber: "5210456789",
    accountHolder: "PT IAMJOS Digital Nusantara",
  },
};