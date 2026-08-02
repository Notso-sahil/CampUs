import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Ban, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminListings() {
  const { toast } = useToast();
  
  const [listings, setListings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/admin/listings?limit=${limit}&offset=${page * limit}`);
      setListings(data.listings);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch listings", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [page]);

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this listing? It will be hidden from the marketplace.")) return;
    
    try {
      await api.delete(`/api/admin/listings/${id}`);
      toast({ title: "Listing deactivated" });
      fetchListings();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to deactivate listing", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Listings Management</h1>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Seller</th>
                <th className="px-6 py-4 font-medium">College</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading listings...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No listings found.</td></tr>
              ) : (
                listings.map(l => (
                  <tr key={l.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{l.title}</div>
                      <div className="text-xs text-muted-foreground">{l.category}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{l.seller_name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{l.college_name}</td>
                    <td className="px-6 py-4 font-medium">₹{l.price}</td>
                    <td className="px-6 py-4">
                      {l.is_active ? (
                        <span className="text-green-500 font-medium">Active</span>
                      ) : (
                        <span className="text-red-500 font-medium">Deactivated</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="h-8">
                          <Link to={`/product/${l.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-1" /> View
                          </Link>
                        </Button>
                        
                        {l.is_active && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleDeactivate(l.id)}
                          >
                            <Ban className="h-4 w-4 mr-1" /> Deactivate
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
            Showing {Math.min(page * limit + 1, total)} to {Math.min((page + 1) * limit, total)} of {total} listings
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
