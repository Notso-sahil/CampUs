import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, MapPin, Plus } from "lucide-react";

export default function AdminCollegesPanel() {
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/colleges");
      setColleges(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch colleges", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setCreating(true);
    try {
      await api.post("/api/admin/colleges", {
        name: name.trim(),
        description: description.trim() || null,
        location: location.trim() || null
      });
      
      toast({ title: "College created successfully!" });
      setName("");
      setDescription("");
      setLocation("");
      fetchColleges();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to create college", variant: "destructive" });
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this college? This will break references for users in this college!")) return;
    try {
      await api.delete(`/api/admin/colleges/${id}`);
      toast({ title: "Deleted successfully" });
      fetchColleges();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Colleges</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-1 space-y-6 bg-card border border-border p-6 rounded-xl h-fit">
          <h2 className="font-bold text-lg">Create College Space</h2>
          
          <form onSubmit={handleCreateCollege} className="space-y-4">
            <div className="space-y-1.5">
              <Label>College Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. VIPS" />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Vivekananda Institute..." />
            </div>

            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Delhi" />
            </div>

            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? "Creating..." : <><Plus className="h-4 w-4 mr-2" /> Create College</>}
            </Button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-lg">Existing College Spaces</h2>
          
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : colleges.length === 0 ? (
            <p className="text-muted-foreground">No colleges found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {colleges.map(c => (
                <div key={c.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">{c.name}</div>
                    {c.description && <div className="text-sm text-muted-foreground">{c.description}</div>}
                    {c.location && (
                      <div className="text-xs font-medium text-primary flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {c.location}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
