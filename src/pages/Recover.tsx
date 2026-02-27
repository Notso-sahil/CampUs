import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Upload, MapPin, Phone, CalendarDays, X } from "lucide-react";
import { format } from "date-fns";

interface RecoverItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  where_found: string;
  where_currently: string;
  contact_info: string;
  date_lost: string;
  college_name: string | null;
  created_by: string | null;
  created_at: string;
}

export default function Recover() {
  const { user } = useAuthContext();
  const { selectedCollege } = useCollege();
  const { toast } = useToast();
  const [items, setItems] = useState<RecoverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whereFound, setWhereFound] = useState("");
  const [whereCurrently, setWhereCurrently] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [dateLost, setDateLost] = useState<Date>(new Date());
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [selectedCollege, filterDate]);

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase
      .from("recover_items")
      .select("*")
      .order("date_lost", { ascending: false });

    if (filterDate) {
      query = query.eq("date_lost", format(filterDate, "yyyy-MM-dd"));
    }

    const { data, error } = await query;
    if (error) console.error("Recover fetch error:", error);
    let result = (data as RecoverItem[]) || [];
    const college = result.filter((r) => r.college_name === selectedCollege);
    const other = result.filter((r) => r.college_name !== selectedCollege);
    setItems([...college, ...other]);
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({ title: "Only JPEG, PNG, and WebP allowed", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5 MB", variant: "destructive" });
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl: string | null = null;
      if (image) {
        const ext = image.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("recover-images").upload(path, image);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("recover-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("recover_items").insert({
        title,
        description,
        where_found: whereFound,
        where_currently: whereCurrently,
        contact_info: contactInfo,
        date_lost: format(dateLost, "yyyy-MM-dd"),
        image_url: imageUrl,
        created_by: user?.id || null,
        college_name: selectedCollege,
      });

      if (error) throw error;
      toast({ title: "Item posted!", description: "Your lost & found item has been listed." });
      setShowForm(false);
      setTitle(""); setDescription(""); setWhereFound(""); setWhereCurrently(""); setContactInfo("");
      setImage(null); setImagePreview(null); setDateLost(new Date());
      fetchItems();
    } catch {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">Recover</h1>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} size="sm">
            {showForm ? "Cancel" : "Report Item"}
          </Button>
        </div>

        {/* Upload Form - Public access */}
        {showForm && (
          <div className="mb-10 rounded-lg border border-border bg-card p-6 animate-fade-in">
            <h2 className="font-display text-xl font-semibold mb-4">Report Lost / Found Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Item Image</Label>
                {imagePreview ? (
                  <div className="relative w-32 h-32">
                    <img src={imagePreview} alt="" className="h-full w-full object-cover rounded-lg" />
                    <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} className="absolute -top-2 -right-2 rounded-full bg-foreground p-1 text-background">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-foreground transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Name *</Label>
                  <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Blue Water Bottle" maxLength={150} />
                </div>
                <div className="space-y-2">
                  <Label>Date Lost *</Label>
                  <Input type="date" required value={format(dateLost, "yyyy-MM-dd")} onChange={(e) => setDateLost(new Date(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the item in detail" maxLength={2000} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Where was it found? *</Label>
                  <Input required value={whereFound} onChange={(e) => setWhereFound(e.target.value)} placeholder="e.g., Library 2nd Floor" maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>Where is it currently? *</Label>
                  <Input required value={whereCurrently} onChange={(e) => setWhereCurrently(e.target.value)} placeholder="e.g., Security Office" maxLength={200} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Info *</Label>
                <Input required value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Phone number or email" maxLength={200} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </div>
        )}

        {/* Calendar Filter */}
        <div className="mb-8">
          <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <CalendarDays className="h-5 w-5" /> The day your item was lost
          </h3>
          <div className="flex flex-wrap items-start gap-4">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={setFilterDate}
              className="rounded-lg border border-border bg-card"
            />
            {filterDate && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Showing items lost on <span className="text-foreground font-medium">{format(filterDate, "PPP")}</span>
                </p>
                <Button variant="ghost" size="sm" onClick={() => setFilterDate(undefined)}>
                  Clear filter
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        {!user && !showForm && (
          <div className="mb-6 rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary underline underline-offset-4 hover:text-primary/80">Sign in</Link> to view lost & found items and contact details.
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">{user ? "No items found" : "Sign in to browse items"}</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                {item.image_url && (
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                    <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.where_found}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Now: {item.where_currently}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {item.contact_info}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lost: {format(new Date(item.date_lost), "PPP")}
                    {item.college_name && ` · ${item.college_name}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
