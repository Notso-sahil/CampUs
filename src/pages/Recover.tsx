import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Upload, MapPin, Phone, Search, Eye, HandHelping, X, CalendarDays } from "lucide-react";
import { format } from "date-fns";

type RecoverType = "lost" | "found";

interface RecoverItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  where_found: string | null;
  where_currently: string | null;
  contact_info: string;
  date_lost: string;
  college_name: string | null;
  created_by: string | null;
  created_at: string;
  type: RecoverType;
}

/* ─── Lost Item Form ─── */
function LostItemForm({ onSuccess, user, selectedCollege }: { onSuccess: () => void; user: any; selectedCollege: string }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [dateLost, setDateLost] = useState<Date>(new Date());
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        imageUrl = await uploadToCloudinary(image, "recover_items");
      }

      await api.post("/api/recover-items", {
        title,
        description,
        contact_info: contactInfo,
        date_lost: format(dateLost, "yyyy-MM-dd"),
        image_url: imageUrl,
        created_by: user?.id || null,
        college_name: selectedCollege,
        type: "lost" as const,
        where_found: "",
        where_currently: "",
      });
      toast({ title: "Report submitted!", description: "Your lost item has been broadcast." });
      setTitle(""); setDescription(""); setContactInfo("");
      setImage(null); setImagePreview(null); setDateLost(new Date());
      onSuccess();
    } catch {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Item Image (optional)</Label>
        {imagePreview ? (
          <div className="relative w-28 h-28">
            <img src={imagePreview} alt="" className="h-full w-full object-cover rounded-xl" />
            <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} className="absolute -top-2 -right-2 rounded-full bg-foreground p-1 text-background"><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <label className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors">
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
        <Textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your lost item in detail…" maxLength={2000} />
      </div>
      <div className="space-y-2">
        <Label>Report it to (Contact Number) *</Label>
        <Input required value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Your phone number or email" maxLength={200} />
      </div>
      <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
        {submitting ? "Submitting…" : "Broadcast Lost Item"}
      </Button>
    </form>
  );
}

/* ─── Found Item Form ─── */
function FoundItemForm({ onSuccess, user, selectedCollege }: { onSuccess: () => void; user: any; selectedCollege: string }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whereFound, setWhereFound] = useState("");
  const [whereCurrently, setWhereCurrently] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [dateLost, setDateLost] = useState<Date>(new Date());
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    if (!image) {
      toast({ title: "Image required", description: "Please upload a photo of the found item.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (image) {
        imageUrl = await uploadToCloudinary(image, "recover_items");
      }

      await api.post("/api/recover-items", {
        title,
        description,
        where_found: whereFound,
        where_currently: whereCurrently,
        contact_info: contactInfo,
        date_lost: format(dateLost, "yyyy-MM-dd"),
        image_url: imageUrl,
        created_by: user?.id || null,
        college_name: selectedCollege,
        type: "found" as const,
      });
      toast({ title: "Item posted!", description: "Your found item report has been listed." });
      setTitle(""); setDescription(""); setWhereFound(""); setWhereCurrently(""); setContactInfo("");
      setImage(null); setImagePreview(null); setDateLost(new Date());
      onSuccess();
    } catch {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Item Photo (required) *</Label>
        {imagePreview ? (
          <div className="relative w-28 h-28">
            <img src={imagePreview} alt="" className="h-full w-full object-cover rounded-xl" />
            <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} className="absolute -top-2 -right-2 rounded-full bg-foreground p-1 text-background"><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <label className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-primary/40 hover:border-primary transition-colors bg-accent/30">
            <Upload className="h-5 w-5 text-primary" />
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Item Name *</Label>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Black Wallet" maxLength={150} />
        </div>
        <div className="space-y-2">
          <Label>Date Found *</Label>
          <Input type="date" required value={format(dateLost, "yyyy-MM-dd")} onChange={(e) => setDateLost(new Date(e.target.value))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the found item…" maxLength={2000} />
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
        <Label>Your Contact Info *</Label>
        <Input required value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Phone number or email" maxLength={200} />
      </div>
      <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
        {submitting ? "Submitting…" : "Report Found Item"}
      </Button>
    </form>
  );
}

/* ─── Main Page ─── */
export default function Recover() {
  const { user } = useAuthContext();
  const { browseCollege, userCollege } = useCollege();
  const [items, setItems] = useState<RecoverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RecoverType | "all">("all");
  const [formMode, setFormMode] = useState<RecoverType | null>(null);

  useEffect(() => {
    fetchItems();
  }, [browseCollege]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/recover-items');
      let result = (data as RecoverItem[]) || [];
      // Assuming backend already sorts or we shouldn't strictly enforce sorting on frontend unless missing.
      // Easiest is to sort on frontend just in case:
      result.sort((a, b) => new Date(b.date_lost).getTime() - new Date(a.date_lost).getTime());
      const college = result.filter((r) => r.college_name === browseCollege);
      const other = result.filter((r) => r.college_name !== browseCollege);
      setItems([...college, ...other]);
    } catch (err) {
      console.error("Recover fetch error:", err);
    }
    setLoading(false);
  };

  const filtered = activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Recover</h1>
          <p className="text-muted-foreground text-sm">Lost something? Or found someone else's belongings? Choose an option below.</p>
        </div>

        {/* Dual Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Lost Card */}
          {userCollege === browseCollege ? (
            <button
              onClick={() => setFormMode(formMode === "lost" ? null : "lost")}
              className={`group relative rounded-2xl border p-6 text-left transition-all duration-300 ${
                formMode === "lost"
                  ? "border-primary bg-accent/40 shadow-glow"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-soft"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl bg-destructive/10 p-3">
                  <Search className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="font-display text-xl font-semibold">My Item is Lost</h2>
              </div>
              <p className="text-sm text-muted-foreground">Broadcast what you're missing so others can help you find it.</p>
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group relative rounded-2xl border p-6 text-left transition-all duration-300 border-border bg-card opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-xl bg-destructive/10 p-3">
                      <Search className="h-6 w-6 text-destructive" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">My Item is Lost</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">Broadcast what you're missing so others can help you find it.</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch back to {userCollege} to report lost items</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Found Card */}
          {userCollege === browseCollege ? (
            <button
              onClick={() => setFormMode(formMode === "found" ? null : "found")}
              className={`group relative rounded-2xl border p-6 text-left transition-all duration-300 ${
                formMode === "found"
                  ? "border-primary bg-accent/40 shadow-glow"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-soft"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <HandHelping className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold">Report a Found Item</h2>
              </div>
              <p className="text-sm text-muted-foreground">Found someone's property? Report it with a photo so they can claim it.</p>
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group relative rounded-2xl border p-6 text-left transition-all duration-300 border-border bg-card opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <HandHelping className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">Report a Found Item</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">Found someone's property? Report it with a photo so they can claim it.</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch back to {userCollege} to report found items</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Form */}
        {formMode && (
          <div className="mb-10 rounded-2xl border border-border bg-card p-6 animate-fade-in shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">
                {formMode === "lost" ? "Report a Lost Item" : "Report a Found Item"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setFormMode(null)} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {formMode === "lost" ? (
              <LostItemForm onSuccess={() => { setFormMode(null); fetchItems(); }} user={user} selectedCollege={browseCollege} />
            ) : (
              <FoundItemForm onSuccess={() => { setFormMode(null); fetchItems(); }} user={user} selectedCollege={browseCollege} />
            )}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {(["all", "lost", "found"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All Items" : tab === "lost" ? "Looking For" : "Found"}
            </button>
          ))}
        </div>

        {/* Sign-in prompt */}
        {!user && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary underline underline-offset-4 hover:text-primary/80">Sign in</Link> to view contact details and claim items.
            </p>
          </div>
        )}

        {/* Items List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No items to show.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
                {item.image_url && (
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.type === "lost"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {item.type === "lost" ? <Eye className="h-3 w-3" /> : <HandHelping className="h-3 w-3" />}
                      {item.type === "lost" ? "Looking For" : "Found"}
                    </span>
                    <h3 className="font-medium text-sm">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {item.where_found && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.where_found}</span>
                    )}
                    {item.where_currently && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Now: {item.where_currently}</span>
                    )}
                    {user && (
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {item.contact_info}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <CalendarDays className="inline h-3 w-3 mr-1" />
                    {item.type === "lost" ? "Lost" : "Found"}: {format(new Date(item.date_lost), "PPP")}
                    {item.college_name && ` · ${item.college_name}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
