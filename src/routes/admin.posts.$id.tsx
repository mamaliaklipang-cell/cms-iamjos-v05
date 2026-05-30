import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetPost, adminUpsertPost, adminListCategories } from "@/lib/cms/admin.functions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { slugify } from "@/lib/cms/types";

export const Route = createFileRoute("/admin/posts/$id")({ component: PostEditor });

function PostEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const get = useServerFn(adminGetPost);
  const save = useServerFn(adminUpsertPost);
  const listCats = useServerFn(adminListCategories);
  const nav = useNavigate();

  const { data: post } = useQuery({ queryKey: ["admin-post", id], queryFn: () => get({ data: { id } }), enabled: !isNew });
  const { data: cats } = useQuery({ queryKey: ["admin-cats"], queryFn: () => listCats() });

  const [form, setForm] = useState<any>({ title: "", slug: "", status: "draft", excerpt: "", cover_image: "", category_id: null, content: { blocks: [{ type: "paragraph", text: "" }] } });

  useEffect(() => { if (post) setForm({ ...post, content: post.content ?? { blocks: [] } }); }, [post]);

  const updateBlock = (i: number, text: string) => {
    const blocks = [...(form.content.blocks ?? [])]; blocks[i] = { ...blocks[i], text };
    setForm({ ...form, content: { blocks } });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = { ...form };
      if (isNew) delete payload.id;
      const res = await save({ data: payload });
      toast.success("Saved");
      if (isNew) nav({ to: "/admin/posts/$id", params: { id: res.id } });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h1 className="text-3xl font-bold">{isNew ? "New post" : "Edit post"}</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
          <Field label="Slug"><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono" /></Field>
          <Field label="Excerpt"><textarea value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full rounded-lg border border-border bg-background p-3 text-sm" /></Field>
          <Field label="Content">
            <div className="space-y-2">
              {(form.content.blocks ?? []).map((b: any, i: number) => (
                <textarea key={i} value={b.text ?? ""} onChange={(e) => updateBlock(i, e.target.value)} rows={4} className="w-full rounded-lg border border-border bg-background p-3 text-sm" />
              ))}
              <button type="button" onClick={() => setForm({ ...form, content: { blocks: [...(form.content.blocks ?? []), { type: "paragraph", text: "" }] } })} className="text-sm text-primary hover:underline">+ Add paragraph</button>
            </div>
          </Field>
        </div>
        <div className="space-y-4">
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </Field>
          <Field label="Category">
            <select value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">None</option>
              {(cats ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Cover image URL"><input value={form.cover_image ?? ""} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
          <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">Save</button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium uppercase text-muted-foreground">{label}</span>{children}</label>;
}
