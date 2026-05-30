import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListHomeSections, adminSaveHomeSections } from "@/lib/cms/admin.functions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SECTION_TYPES } from "@/lib/cms/types";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/home-builder")({ component: HomeBuilder });

function HomeBuilder() {
  const get = useServerFn(adminListHomeSections);
  const save = useServerFn(adminSaveHomeSections);
  const { data, refetch } = useQuery({ queryKey: ["home-sections"], queryFn: () => get() });
  const [sections, setSections] = useState<any[]>([]);
  useEffect(() => { if (data) setSections(data.map((s: any) => ({ ...s }))); }, [data]);

  const move = (i: number, d: number) => {
    const next = [...sections]; const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]]; setSections(next);
  };

  async function onSave() {
    try {
      await save({ data: { sections: sections.map((s, i) => ({ type: s.type, props: s.props ?? {}, sort_order: i, is_visible: s.is_visible })) } });
      toast.success("Home page saved");
      refetch();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Home Builder</h1><p className="mt-1 text-muted-foreground">Drag-reorder sections of the homepage.</p></div>
        <button onClick={onSave} className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground hover:opacity-90">Save</button>
      </div>
      <div className="mt-6 space-y-3">
        {sections.map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{s.type}</span>
              <button onClick={() => { const n = [...sections]; n[i].is_visible = !n[i].is_visible; setSections(n); }} className="ml-auto rounded-lg border border-border p-2 hover:bg-accent" title="Toggle visibility">
                {s.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
              <button onClick={() => move(i, -1)} className="rounded-lg border border-border p-2 hover:bg-accent"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => move(i, 1)} className="rounded-lg border border-border p-2 hover:bg-accent"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button onClick={() => setSections(sections.filter((_, idx) => idx !== i))} className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <textarea value={JSON.stringify(s.props ?? {}, null, 2)} onChange={(e) => { try { const n = [...sections]; n[i].props = JSON.parse(e.target.value); setSections(n); } catch {} }} rows={6} className="mt-3 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {SECTION_TYPES.map((t) => (
          <button key={t} onClick={() => setSections([...sections, { type: t, props: {}, is_visible: true }])} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent">
            <Plus className="h-3 w-3" /> {t}
          </button>
        ))}
      </div>
    </div>
  );
}
