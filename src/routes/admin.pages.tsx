import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListPages, adminDeletePage } from "@/lib/cms/admin.functions";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";

export const Route = createFileRoute("/admin/pages")({ component: PagesList });

function PagesList() {
  const list = useServerFn(adminListPages);
  const del = useServerFn(adminDeletePage);
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["admin-pages"], queryFn: () => list() });
  const m = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-pages"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="mt-1 text-muted-foreground">Manage static pages.</p>
        </div>
        <button onClick={() => nav({ to: "/admin/pages/$id", params: { id: "new" } })}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New page
        </button>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {data?.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">/{p.slug}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to="/admin/pages/$id" params={{ id: p.id }} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mr-3"><Edit className="h-3.5 w-3.5" /> Edit</Link>
                  <button onClick={() => confirm("Delete this page?") && m.mutate(p.id)} className="inline-flex items-center gap-1 text-sm text-destructive hover:underline">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No pages yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
