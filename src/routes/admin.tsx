import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, FileText, Newspaper, Menu as MenuIcon, Image, Users, Blocks, Settings, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/posts", label: "Blog / News", icon: Newspaper },
  { to: "/admin/menus", label: "Menus", icon: MenuIcon },
  { to: "/admin/home-builder", label: "Home Builder", icon: Blocks },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/appearance", label: "Appearance", icon: Settings },
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
    <div className="flex min-h-screen bg-muted/30">
      <aside className="flex w-64 flex-col border-r border-border bg-sidebar">
        <div className="border-b border-sidebar-border px-6 py-5">
          <Link to="/" className="text-base font-bold tracking-tight">Lumen CMS</Link>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
                <Icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="px-3 pb-2 text-xs text-muted-foreground truncate">{user.email}</div>
          <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login" }); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/50">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
