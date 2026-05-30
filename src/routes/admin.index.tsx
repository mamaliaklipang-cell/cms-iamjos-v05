import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Newspaper, Image, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Welcome to your admin panel.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/admin/pages", label: "Pages", icon: FileText },
          { to: "/admin/posts", label: "Blog / News", icon: Newspaper },
          { to: "/admin/media", label: "Media", icon: Image },
          { to: "/admin/users", label: "Users", icon: Users },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.to} to={c.to} className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-accent">
              <Icon className="h-6 w-6 text-primary" />
              <div className="mt-3 font-semibold group-hover:text-primary">{c.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">Manage {c.label.toLowerCase()}</div>
            </Link>
          );
        })}
      </div>
      <div className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Tips</h2>
        <ul className="mt-3 list-inside list-disc text-sm text-muted-foreground space-y-1">
          <li>The first user that signs up is automatically promoted to admin.</li>
          <li>Use <strong>Home Builder</strong> to drag-reorder sections on the homepage.</li>
          <li>Upload images via <strong>Media</strong> and reuse their URLs in pages, posts, and hero.</li>
        </ul>
      </div>
    </div>
  );
}
