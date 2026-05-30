import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetMenuWithItems, adminSaveMenuItems } from "@/lib/cms/admin.functions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/admin/menus")({ component: MenusPage });

function MenusPage() {
  const [loc, setLoc] = useState<"header" | "footer">("header");
  return (
    <div>
      <h1 className="text-3xl font-bold">Menus</h1>
      <p className="mt-1 text-muted-foreground">Manage header and footer navigation.</p>
      <div className="mt-6 flex gap-2">
        {(["header", "footer"] as const).map((l) => (
          <button key={l} onClick={() => setLoc(l)} className={`rounded-full px-4 py-1.5 text-sm ${loc === l ? "bg-primary text-primary-foreground" : "border border-border"}`}>
            {l[0].toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>
      <MenuEditor key={loc} location={loc} />
    </div>
  );
}

function MenuEditor({ location }: { location: "header" | "footer" }) {
  const get = useServerFn(adminGetMenuWithItems);
  const save = useServerFn(adminSaveMenuItems);
  const { data, refetch } = useQuery({ queryKey: ["menu", location], queryFn: () => get({ data: { location } }) });
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { if (data?.items) setItems(data.items.map((i: any) => ({ ...i }))); }, [data]);

  const move = (i: number, d: number) => {
    const next = [...items]; const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  async function onSave() {
    if (!data?.menu) return;
    try {
      await save({ data: { menu_id: data.menu.id, items: items.map((it, i) => ({ label: it.label, url: it.url ?? null, page_id: it.page_id ?? null, sort_order: i })) } });
      toast.success("Menu saved");
      refetch();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-6">
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={it.label} onChange={(e) => { const n = [...items]; n[i].label = e.target.value; setItems(n); }} placeholder="Label" className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input value={it.url ?? ""} onChange={(e) => { const n = [...items]; n[i].url = e.target.value; setItems(n); }} placeholder="URL (/about)" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono" />
            <button onClick={() => move(i, -1)} className="rounded-lg border border-border p-2 hover:bg-accent"><ArrowUp className="h-3.5 w-3.5" /></button>
            <button onClick={() => move(i, 1)} className="rounded-lg border border-border p-2 hover:bg-accent"><ArrowDown className="h-3.5 w-3.5" /></button>
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => setItems([...items, { label: "New item", url: "/" }])} className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
        <button onClick={onSave} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">Save menu</button>
      </div>
    </div>
  );
}
