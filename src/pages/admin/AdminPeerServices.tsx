import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function AdminPeerServices() {
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/peer-services");
      setProfiles(data.profiles);
      setServices(data.services);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch peer services data", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, type: 'profile' | 'service', status: string) => {
    try {
      await api.put(`/api/admin/peer-services/${id}/status`, { type, status });
      toast({ title: "Status updated" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to update status", variant: "destructive" });
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'approved': return <span className="flex items-center text-green-500 font-medium text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</span>;
      case 'rejected': return <span className="flex items-center text-red-500 font-medium text-xs"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      default: return <span className="flex items-center text-yellow-500 font-medium text-xs"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Peer Services (Trust Protocol)</h1>

      {/* Expert Profiles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Expert Profiles</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">College</th>
                <th className="px-6 py-4 font-medium">Skills</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No profiles found.</td></tr>
              ) : (
                profiles.map(p => (
                  <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.display_name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.college_name}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {p.skills?.join(', ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4">{renderStatus(p.verification_status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {p.verification_status !== 'approved' && (
                          <Button size="sm" variant="outline" className="h-8 text-green-500 border-green-500/30 hover:bg-green-500/10" onClick={() => handleUpdateStatus(p.id, 'profile', 'approved')}>Approve</Button>
                        )}
                        {p.verification_status !== 'rejected' && (
                          <Button size="sm" variant="outline" className="h-8 text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => handleUpdateStatus(p.id, 'profile', 'rejected')}>Reject</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Services */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Services</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Expert</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Pricing</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No services found.</td></tr>
              ) : (
                services.map(s => (
                  <tr key={s.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{s.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.display_name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.category}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      Base: ₹{s.price_basic}
                    </td>
                    <td className="px-6 py-4">{renderStatus(s.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {s.status !== 'approved' && (
                          <Button size="sm" variant="outline" className="h-8 text-green-500 border-green-500/30 hover:bg-green-500/10" onClick={() => handleUpdateStatus(s.id, 'service', 'approved')}>Approve</Button>
                        )}
                        {s.status !== 'rejected' && (
                          <Button size="sm" variant="outline" className="h-8 text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => handleUpdateStatus(s.id, 'service', 'rejected')}>Reject</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
