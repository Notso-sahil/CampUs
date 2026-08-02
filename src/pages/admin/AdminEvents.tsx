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
  const [expeditions, setExpeditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'events' | 'expeditions'>('events');
  
  const [form, setForm] = useState({ title: '', description: '', event_date: '', location: '' });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evts, exps] = await Promise.all([
        api.get("/api/events"),
        api.get("/api/expeditions")
      ]);
      setEvents(evts);
      setExpeditions(exps);
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

      await api.post(`/api/admin/${activeTab}`, { ...form, image_url });
      toast({ title: "Created successfully!" });
      
      setForm({ title: '', description: '', event_date: '', location: '' });
      setFile(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to create", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, type: 'events' | 'expeditions') => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await api.delete(`/api/admin/${type}/${id}`);
      toast({ title: "Deleted successfully" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to delete", variant: "destructive" });
    }
  };

  const currentList = activeTab === 'events' ? events : expeditions;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Events & Expeditions</h1>

      <div className="flex gap-4 border-b border-border pb-2">
        <button 
          onClick={() => setActiveTab('events')} 
          className={`font-medium ${activeTab === 'events' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          Events
        </button>
        <button 
          onClick={() => setActiveTab('expeditions')} 
          className={`font-medium ${activeTab === 'expeditions' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          Expeditions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-1 space-y-6 bg-card border border-border p-6 rounded-xl h-fit">
          <h2 className="font-bold text-lg">Create {activeTab === 'events' ? 'Event' : 'Expedition'}</h2>
          
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
              <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-muted-foreground mt-1">Leave empty to use a default placeholder.</p>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </Button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-lg">Active {activeTab === 'events' ? 'Events' : 'Expeditions'}</h2>
          
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : currentList.length === 0 ? (
            <p className="text-muted-foreground">No {activeTab} found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentList.map(item => (
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
                      size="sm" 
                      className="w-full mt-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => handleDelete(item.id, activeTab)}
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" /> Delete
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
