import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListMedia, adminInsertMedia, adminDeleteMedia } from "@/lib/cms/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Upload, Copy } from "lucide-react";

export const Route = createFileRoute("/admin/media")({ component: MediaPage });

function MediaPage() {
  const list = useServerFn(adminListMedia);
  const insert = useServerFn(adminInsertMedia);
  const del = useServerFn(adminDeleteMedia);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["media"], queryFn: () => list() });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      return await insert({ data: { path, url: pub.publicUrl, mime_type: file.type, size: file.size } });
    },
    onSuccess: () => { toast.success("Uploaded"); qc.invalidateQueries({ queryKey: ["media"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (m: any) => del({ data: { id: m.id, path: m.path } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["media"] }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Media</h1><p className="mt-1 text-muted-foreground">Upload and manage assets.</p></div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">
          <Upload className="h-4 w-4" /> Upload
          <input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); }} />
        </label>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {data?.map((m: any) => (
          <div key={m.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            {m.mime_type?.startsWith("image/") ? <img src={m.url} alt="" className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-muted" />}
            <div className="space-y-2 p-3">
              <div className="truncate text-xs text-muted-foreground">{m.path}</div>
              <div className="flex gap-1">
                <button onClick={() => { navigator.clipboard.writeText(m.url); toast.success("URL copied"); }} className="flex-1 rounded-lg border border-border p-1.5 text-xs hover:bg-accent inline-flex items-center justify-center gap-1"><Copy className="h-3 w-3" />Copy</button>
                <button onClick={() => confirm("Delete?") && remove.mutate(m)} className="rounded-lg border border-border p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        ))}
        {data?.length === 0 && <div className="text-muted-foreground md:col-span-4">No media yet.</div>}
      </div>
    </div>
  );
}
