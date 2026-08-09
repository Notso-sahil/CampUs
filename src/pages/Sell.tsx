import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, MapPin, Tag, ShieldCheck } from "lucide-react";

import { CATEGORY_VALUES } from "@/lib/categories";
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

export default function Sell() {
  const { user, profile } = useAuthContext();
  const { browseCollege } = useCollege();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Good");
  const [category, setCategory] = useState("Other");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (previews.length + files.length > 4) {
      toast({ title: "Max 4 images", variant: "destructive" });
      return;
    }

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Only JPEG, PNG, and WebP images allowed", variant: "destructive" });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "Each image must be under 5 MB", variant: "destructive" });
        return;
      }

      setImages((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (previews.length === 0) {
      toast({ title: "Image required", description: "Please add at least one photo of your item.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await Promise.all(
        images.slice(0, 4).map((file) => uploadToCloudinary(file, "products"))
      );

      await api.post("/api/products", {
        seller_id: user.id,
        title,
        description: description || null,
        price: parseFloat(price),
        condition,
        category,
        college_name: profile?.college_name || "VIPS",
        image_urls: imageUrls,
      });

      toast({ title: "Product listed! 🎉", description: "Your item is now live in the marketplace." });
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Error", description: "Failed to list item. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-2xl font-bold">List your item</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sell to your peers on the {profile?.college_name || browseCollege || "college"} campus. It's fast and free.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-5">

            {/* Image Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Photos (up to 4)</Label>
                <span className="text-[10px] font-bold text-muted-foreground">{previews.length}/4</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-secondary group shadow-sm">
                    <img src={src} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1.5 top-1.5 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-0 inset-x-0 bg-primary/80 py-0.5 text-[9px] text-white font-bold text-center">
                        MAIN PHOTO
                      </div>
                    )}
                  </div>
                ))}
                {previews.length < 4 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group">
                    <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold text-muted-foreground mt-1 group-hover:text-primary">Add Photo</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.heic" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">JPEG, PNG or WebP. Max 5MB per image.</p>
            </div>

            {/* Details */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Item Title</Label>
                <Input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Staedtler Mars Mini Drafter"
                  maxLength={150}
                  className="h-12 rounded-xl border-border bg-background focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is the condition? Any defects? Is the price negotiable?"
                  rows={4}
                  maxLength={2000}
                  className="rounded-xl border-border bg-background resize-none focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">₹</span>
                    <Input
                      id="price"
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="pl-9 h-12 rounded-xl border-border bg-background focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Condition</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORY_VALUES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Campus
                  </Label>
                  <div className="h-12 px-4 flex items-center bg-secondary/30 rounded-xl text-sm font-bold border border-border/50 text-foreground/80">
                    {profile?.college_name || browseCollege || "College"} Hub
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">CampUs Trust Protocol</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Transactions are completed **Cash on Delivery** when meeting on campus. Never share sensitive payment info before seeing the item.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Plus className="h-5 w-5" /> List My Item</>
              )}
            </Button>
          </form>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}

const Plus = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
