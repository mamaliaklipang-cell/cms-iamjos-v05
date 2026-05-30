import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Newspaper, Image, Users, ArrowUpRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

const CARDS = [
  { to: "/admin/pages", label: "Pages", icon: FileText, desc: "Create and edit website pages" },
  { to: "/admin/posts", label: "Blog / News", icon: Newspaper, desc: "Publish articles and stories" },
  { to: "/admin/media", label: "Media", icon: Image, desc: "Upload and organize assets" },
  { to: "/admin/users", label: "Users", icon: Users, desc: "Manage members and roles" },
];

function Dashboard() {
  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" aria-hidden />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" /> Welcome back
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">Manage content, structure, and design of your site — all from one premium control center.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to}
              to={c.to}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity group-hover:opacity-25" aria-hidden />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <div className="mt-4 font-semibold">{c.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:col-span-2">
          <h2 className="font-semibold">Quick tips</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary">→</span> First user to sign up is automatically promoted to admin.</li>
            <li className="flex gap-2"><span className="text-primary">→</span> Use <strong className="text-foreground">Home Builder</strong> to reorder homepage sections.</li>
            <li className="flex gap-2"><span className="text-primary">→</span> Upload images in <strong className="text-foreground">Media</strong> and reuse URLs anywhere.</li>
            <li className="flex gap-2"><span className="text-primary">→</span> Change typography in <strong className="text-foreground">Appearance</strong> (Plus Jakarta Sans default).</li>
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-elegant">
          <Sparkles className="h-6 w-6" />
          <h3 className="mt-4 text-lg font-bold">Section-based</h3>
          <p className="mt-1 text-sm opacity-90">Drag-reorder hero, features, CTAs, and blog blocks to design your homepage visually.</p>
          <Link to="/admin/home-builder" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-background/25">
            Open builder <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
