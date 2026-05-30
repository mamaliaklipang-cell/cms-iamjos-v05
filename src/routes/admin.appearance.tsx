import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetSettings, adminSaveSettings } from "@/lib/cms/admin.functions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FONT_OPTIONS } from "@/lib/cms/types";

export const Route = createFileRoute("/admin/appearance")({ component: AppearancePage });

function AppearancePage() {
  const get = useServerFn(adminGetSettings);
  const save = useServerFn(adminSaveSettings);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => get() });
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data) setForm({ ...data, social_links: data.social_links ?? {}, hero_default: data.hero_default ?? {} }); }, [data]);
  if (!form) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { id: _id, updated_at: _u, ...payload } = form;
      await save({ data: payload });
      toast.success("Saved. Reload to see font change.");
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h1 className="text-3xl font-bold">Appearance</h1>
      <p className="text-muted-foreground">Logo, font, footer, hero defaults.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Site name"><input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
        <Field label="Tagline"><input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
        <Field label="Logo URL"><input value={form.logo_url ?? ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
        <Field label="Favicon URL"><input value={form.favicon_url ?? ""} onChange={(e) => setForm({ ...form, favicon_url: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
        <Field label="Font family">
          <select value={form.font_family} onChange={(e) => setForm({ ...form, font_family: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Footer HTML">
        <textarea value={form.footer_html ?? ""} onChange={(e) => setForm({ ...form, footer_html: e.target.value })} rows={4} className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs" />
      </Field>

      <Field label="Hero defaults (JSON)">
        <textarea value={JSON.stringify(form.hero_default ?? {}, null, 2)} onChange={(e) => { try { setForm({ ...form, hero_default: JSON.parse(e.target.value) }); } catch {} }} rows={10} className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs" />
      </Field>

      <Field label="Social links (JSON)">
        <textarea value={JSON.stringify(form.social_links ?? {}, null, 2)} onChange={(e) => { try { setForm({ ...form, social_links: JSON.parse(e.target.value) }); } catch {} }} rows={5} className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs" />
      </Field>

      <button type="submit" className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">Save settings</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium uppercase text-muted-foreground">{label}</span>{children}</label>;
}
