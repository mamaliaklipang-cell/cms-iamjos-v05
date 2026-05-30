import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, FileText, Newspaper, Menu as MenuIcon, Image, Users, Blocks, Settings, LogOut, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/pages", label: "Pages", icon: FileText },
      { to: "/admin/posts", label: "Blog / News", icon: Newspaper },
      { to: "/admin/media", label: "Media", icon: Image },
    ],
  },
  {
    label: "Structure",
    items: [
      { to: "/admin/menus", label: "Menus", icon: MenuIcon },
      { to: "/admin/home-builder", label: "Home Builder", icon: Blocks },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/users", label: "Users & Roles", icon: Users },
      { to: "/admin/appearance", label: "Appearance", icon: Settings },
    ],
  },
];

function AdminLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-subtle">
      <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="border-b border-sidebar-border px-5 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-elegant">L</span>
            <div>
              <div className="text-sm font-bold tracking-tight">Lumen CMS</div>
              <div className="text-[11px] text-muted-foreground">Admin Panel</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{group.label}</div>
              <div className="space-y-0.5">
                {group.items.map((n) => {
                  const Icon = n.icon;
                  const active = n.exact ? path === n.to : path.startsWith(n.to);
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                        active
                          ? "bg-gradient-primary text-primary-foreground shadow-soft font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "" : "text-muted-foreground group-hover:text-foreground"}`} />
                      {n.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link to="/" className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
            <ExternalLink className="h-3.5 w-3.5" /> View site
          </Link>
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
              {(user.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{user.email}</div>
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login" }); }}
              title="Sign out"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-8 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
