import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, ShieldCheck, CheckCircle2, Plus, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";

const CATEGORIES = ["Engineering Graphics", "Python/Coding", "Hardware/Circuit", "Viva Prep", "Lab Files"];
const DELIVERY_METHODS = ["On-Campus Handover", "Digital PDF", "WhatsApp", "Digital + Printout"];

// ── Multi-step form: Step 1 = Expert Profile, Step 2 = Service Listing ────────
export default function ListService() {
  const { user } = useAuthContext();
  const { browseCollege } = useCollege();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — Expert Profile
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [samplePreviews, setSamplePreviews] = useState<string[]>([]);

  // Step 2 — Service Listing
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priceBasic, setPriceBasic] = useState("");
  const [priceStandard, setPriceStandard] = useState("");
  const [pricePremium, setPricePremium] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [deliveryMethod, setDeliveryMethod] = useState("On-Campus Handover");
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [tags, setTags] = useState("");

  const handleImages = (files: FileList | null, setter: React.Dispatch<React.SetStateAction<string[]>>, limit: number) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, limit);
    arr.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setter(prev => [...prev, reader.result as string].slice(0, limit));
      reader.readAsDataURL(file);
    });
  };

  const submitProfile = async () => {
    if (!user) return;
    if (samplePreviews.length === 0) {
      toast({ title: "Sample work required", description: "Upload at least one sample for the Trust Protocol.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/expert-profiles", {
        user_id: user.id,
        display_name: displayName,
        bio,
        college_name: browseCollege,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        availability,
        sample_work_urls: samplePreviews,
        contact_whatsapp: whatsapp,
      });
      toast({ title: "Profile Submitted!", description: "Pending admin quality check. You can list services once approved." });
      setStep(2);
    } catch {
      toast({ title: "Error", description: "Failed to submit profile. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitService = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await api.post("/api/peer-services", {
        expert_user_id: user.id,
        title, description, category,
        price_basic: Number(priceBasic),
        price_standard: priceStandard ? Number(priceStandard) : null,
        price_premium: pricePremium ? Number(pricePremium) : null,
        delivery_days: Number(deliveryDays),
        delivery_method: deliveryMethod,
        portfolio_urls: portfolioPreviews,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        college_name: browseCollege,
      });
      if (result?.error) {
        toast({ title: "Not Approved Yet", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Your service has been listed." });
        navigate("/service");
      }
    } catch {
      toast({ title: "Error", description: "Failed to list service. Please ensure your expert profile is approved.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        <button onClick={() => navigate("/service")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= n ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
              </div>
              <span className={`text-sm font-medium ${step >= n ? "text-foreground" : "text-muted-foreground"}`}>
                {n === 1 ? "Expert Profile" : "List Service"}
              </span>
              {n < 2 && <div className="flex-1 h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <FadeIn>
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-bold">Build Your Expert Profile</h1>
              <p className="text-muted-foreground text-sm">Your profile passes the Trust Protocol before your services go live.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-soft">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Display Name *</Label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name as students will see" className="rounded-xl h-11" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Bio *</Label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Describe your expertise, year, branch…" className="rounded-xl resize-none min-h-[100px]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Skills (comma-separated)</Label>
                  <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="AutoCAD, Python, Soldering" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">WhatsApp Number</Label>
                  <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91 98XXXXXXXX" className="rounded-xl h-11" />
                  <p className="text-[10px] text-muted-foreground">Shared only after order confirmation.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Availability</Label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">🟢 Available</SelectItem>
                    <SelectItem value="Busy">🟡 Busy</SelectItem>
                    <SelectItem value="On Break">🔴 On Break</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sample work upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-widest">Work Samples * (Trust Protocol)</Label>
                  <span className="text-[10px] text-muted-foreground font-bold">{samplePreviews.length}/3</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {samplePreviews.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setSamplePreviews(p => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 h-7 w-7 rounded-full bg-background/90 flex items-center justify-center shadow-sm border border-border">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {samplePreviews.length < 3 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground mt-1">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={e => handleImages(e.target.files, setSamplePreviews, 3)} />
                    </label>
                  )}
                </div>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong>Trust Protocol:</strong> Upload high-quality samples of your actual work. Admin checks these before approving your profile.
                  </p>
                </div>
              </div>

              <Button onClick={submitProfile} disabled={loading || !displayName || !bio || !browseCollege}
                className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors gap-2">
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShieldCheck className="h-4 w-4" /> Submit for Verification</>}
              </Button>
            </div>
          </FadeIn>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <FadeIn>
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-bold">List Your Service</h1>
              <p className="text-muted-foreground text-sm">Service goes live after admin approval. Keep details clear and specific.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-soft">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Service Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Precision EG Sheets — First Angle Projection" className="rounded-xl h-11" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Delivery Method</Label>
                  <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DELIVERY_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Description *</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe exactly what the buyer receives, your quality standards, and process…" className="rounded-xl resize-none min-h-[120px]" />
              </div>

              {/* Pricing Tiers */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest">Pricing (₹) *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "priceBasic", label: "Basic *", val: priceBasic, set: setPriceBasic },
                    { key: "priceStandard", label: "Standard", val: priceStandard, set: setPriceStandard },
                    { key: "pricePremium", label: "Premium", val: pricePremium, set: setPricePremium },
                  ].map(({ key, label, val, set }) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</Label>
                      <Input type="number" value={val} onChange={e => set(e.target.value)} placeholder="₹" className="rounded-xl h-11 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Delivery Days</Label>
                <Input type="number" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} min="1" max="30" className="rounded-xl h-11 w-32" />
              </div>

              {/* Portfolio upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-widest">Portfolio Images</Label>
                  <span className="text-[10px] text-muted-foreground font-bold">{portfolioPreviews.length}/5</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {portfolioPreviews.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setPortfolioPreviews(p => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 h-7 w-7 rounded-full bg-background/90 flex items-center justify-center shadow-sm border border-border">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {portfolioPreviews.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={e => handleImages(e.target.files, setPortfolioPreviews, 5)} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest">Tags (comma-separated)</Label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="IS:696, Python, Arduino, Viva" className="rounded-xl h-11" />
              </div>

              <Button onClick={submitService} disabled={loading || !title || !category || !priceBasic}
                className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors gap-2">
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="h-4 w-4" /> Submit Service Listing</>}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">Service becomes visible after admin approval.</p>
            </div>
          </FadeIn>
        )}
      </main>
      <Footer />
    </div>
  );
}
