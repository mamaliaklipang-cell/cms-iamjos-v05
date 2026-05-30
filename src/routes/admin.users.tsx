import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListUsers, adminSetUserRole } from "@/lib/cms/admin.functions";
import { ROLES } from "@/lib/cms/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const list = useServerFn(adminListUsers);
  const setRole = useServerFn(adminSetUserRole);
  const qc = useQueryClient();
  const { data, error } = useQuery({ queryKey: ["users"], queryFn: () => list(), retry: false });
  const m = useMutation({
    mutationFn: (v: { user_id: string; role: any; enabled: boolean }) => setRole({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (error) return <div className="text-destructive">{(error as Error).message} — admin role required.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Users & Roles</h1>
      <p className="mt-1 text-muted-foreground">Assign roles to control access.</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">User</th>{ROLES.map((r) => <th key={r} className="px-4 py-3">{r}</th>)}</tr>
          </thead>
          <tbody>
            {data?.map((u: any) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.display_name ?? u.email}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                {ROLES.map((r) => (
                  <td key={r} className="px-4 py-3">
                    <input type="checkbox" checked={u.roles.includes(r)} onChange={(e) => m.mutate({ user_id: u.id, role: r, enabled: e.target.checked })} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
