import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { Calendar as CalendarIcon, MapPin, Trash2, Image as ImageIcon } from "lucide-react";

export default function AdminEvents() {
  const { toast } = useToast();
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ title: '', description: '', event_date: '', location: '' });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const evts = await api.get("/api/events");
      setEvents(evts);
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
        image_url = await uploadToCloudinary(file, "events");
      }

      await api.post(`/api/events`, { ...form, image_url });
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
      await api.delete(`/api/events?id=${id}`);
      toast({ title: "Deleted successfully" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-1 space-y-6 bg-card border border-border p-6 rounded-xl h-fit">
          <h2 className="font-bold text-lg">Create Event</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" />
            </div>
            
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description..." className="resize-none" rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input required type="datetime-local" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
            </div>

            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Optional location" />
            </div>

            <div className="space-y-1.5">
              <Label>Image (Optional)</Label>
              <Input type="file" accept=".jpg,.jpeg,.png,.heic" onChange={e => setFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-muted-foreground mt-1">Leave empty to use a default placeholder.</p>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </Button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-lg">Active Events</h2>
          
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-xl">
              No events found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="h-32 w-full object-cover" />
                  ) : (
                    <div className="h-32 w-full bg-secondary/50 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg truncate">{item.title}</h3>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground flex-1">
                      <p className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" /> {new Date(item.event_date).toLocaleString()}</p>
                      {item.location && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {item.location}</p>}
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
