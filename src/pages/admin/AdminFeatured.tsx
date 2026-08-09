import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/lib/uploadToStorage";
import { MapPin, Trash2, Image as ImageIcon, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function AdminFeatured() {
  const { toast } = useToast();
  
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ title: '', description: '', event_date: '', location: '' });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const items = await api.get("/api/featured");
      setFeatured(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let image_url = null;
      if (file) {
        image_url = await uploadToStorage(file, "featured");
      }

      await api.post(`/api/featured`, { ...form, image_url });
      toast({ title: "Created successfully!" });
      
      setForm({ title: '', description: '', event_date: '', location: '' });
      setFile(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to create", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await api.delete(`/api/featured?id=${id}`);
      toast({ title: "Deleted successfully" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Featured</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-1 space-y-6 bg-card border border-border p-6 rounded-xl h-fit">
          <h2 className="font-bold text-lg">Create Featured Entry</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Event Date (if applicable)</Label>
              <Input 
                type="date"
                value={form.event_date} 
                onChange={e => setForm({...form, event_date: e.target.value})} 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input 
                value={form.location} 
                onChange={e => setForm({...form, location: e.target.value})} 
              />
            </div>

            <div className="space-y-1.5">
              <Label>Image</Label>
              <Input 
                type="file" 
                accept=".jpg,.jpeg,.png,.heic"
                onChange={e => setFile(e.target.files?.[0] || null)} 
              />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </Button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-lg">Active Featured Entries</h2>
          
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading featured entries...</div>
          ) : featured.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-xl">
              No featured entries found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featured.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="h-32 w-full object-cover" />
                  ) : (
                    <div className="h-32 w-full bg-secondary flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 opacity-20" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                    
                    <div className="mt-auto space-y-1">
                      {item.event_date && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(item.event_date), "MMM d, yyyy")}
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="mt-4"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
