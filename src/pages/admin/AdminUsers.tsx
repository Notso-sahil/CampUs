import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldAlert, UserX } from "lucide-react";

export default function AdminUsers() {
  const { user, profile } = useAuthContext();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/admin/users?limit=${limit}&offset=${page * limit}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      toast({ title: "Role updated successfully" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to update role", variant: "destructive" });
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this user? Their profile and listings will be hidden.")) return;
    
    try {
      await api.delete(`/api/admin/users/${userId}`);
      toast({ title: "User deactivated" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to deactivate user", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">College</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.display_name || 'Unnamed User'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.college_name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {u.user_role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          <ShieldAlert className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                          {u.user_role || 'user'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="text-green-500 font-medium">Active</span>
                      ) : (
                        <span className="text-red-500 font-medium">Deactivated</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.user_role !== 'admin' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleRoleChange(u.user_id, 'admin')}
                          >
                            <Shield className="h-4 w-4 mr-1" /> Make Admin
                          </Button>
                        )}
                        {u.user_role === 'admin' && u.user_id !== user?.id && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleRoleChange(u.user_id, 'buyer')}
                          >
                            Remove Admin
                          </Button>
                        )}
                        
                        {u.user_id !== user?.id && u.is_active && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleDeactivate(u.user_id)}
                          >
                            <UserX className="h-4 w-4 mr-1" /> Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(page * limit + 1, total)} to {Math.min((page + 1) * limit, total)} of {total} users
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
