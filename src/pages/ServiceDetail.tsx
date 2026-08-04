import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Clock, ShieldCheck, CheckCircle2,
  ChevronLeft, ChevronRight, MessageCircle, Package, Zap, X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { DUMMY_SERVICES } from "@/lib/dummyData";
import { DUMMY_MSG } from "@/lib/dummyMessages";
import { AlertTriangle } from "lucide-react";

const MOCK_DETAIL: Record<string, any> = {
  "mock-1": {
    id: "mock-1", title: "Precision EG Sheets — First & Third Angle Projection",
    description: "Mathematically precise engineering drawing sheets. Includes orthographic projections, section planes, isometric views, and surface development. Every line drawn with 0.1mm precision using proper pencil grades (2H/4H/HB) per IS:696 standards.",
    category: "Engineering Graphics", price_basic: 299, price_standard: 499, price_premium: 799,
    delivery_days: 3, delivery_method: "On-Campus Handover",
    portfolio_urls: [
      "https://images.unsplash.com/photo-1503387762-592dea58ef23?w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600&auto=format&fit=crop",
    ],
    expert_name: "Rahul Sharma", expert_user_id: "seed_expert_1",
    expert_bio: "3rd yr Mechanical Eng. Specialises in precise EG sheets with zero tolerance for error.",
    expert_skills: ["Engineering Graphics","AutoCAD","SolidWorks"],
    expert_verified: "approved", avg_rating: 4.9, review_count: 24, availability: "Available",
    tags: ["IS:696","Orthographic","Isometric","Section Planes"],
    reviews: [
      { rating: 5, review_text: "Absolutely perfect sheets, professor was impressed!", seeker_user_id: "u1", created_at: "2025-03-10" },
      { rating: 5, review_text: "Delivered on time, very clean linework.", seeker_user_id: "u2", created_at: "2025-02-15" },
    ],
  },
  "mock-3": {
    id: "mock-3", title: "Python Lab File (BCA/B.Tech) — 15+ Programs with Output",
    description: "Full Python practical file with clean, well-documented code. Includes basic programs, OOP, file handling, NumPy/Pandas, Matplotlib graphs, MySQL connectivity.",
    category: "Python/Coding", price_basic: 450, price_standard: 650, price_premium: null,
    delivery_days: 2, delivery_method: "Digital PDF",
    portfolio_urls: [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1600&auto=format&fit=crop",
    ],
    expert_name: "Priya Verma", expert_user_id: "seed_expert_2",
    expert_bio: "Final yr CS. Python specialist; documented 40+ lab files with 5-star reviews.",
    expert_skills: ["Python","Jupyter Notebook","Documentation"],
    expert_verified: "approved", avg_rating: 5.0, review_count: 32, availability: "Available",
    tags: ["Python","Lab File","NumPy","Pandas","Documentation"],
    reviews: [
      { rating: 5, review_text: "Got 10/10 in viva because of her documentation!", seeker_user_id: "u3", created_at: "2025-03-01" },
    ],
  },
};

// Add DUMMY_SERVICES to MOCK_DETAIL
DUMMY_SERVICES.forEach(s => {
  MOCK_DETAIL[s.id] = {
    ...s,
    description: "This is a demo listing to showcase the Peer Services section. Real listings will contain detailed descriptions of what the expert provides, their workflow, and deliverables.",
    portfolio_urls: [],
    expert_bio: "Demo expert bio",
    expert_skills: [s.category],
    tags: ["demo", s.category],
    reviews: []
  };
});

const buildFallback = (id: string) => MOCK_DETAIL[id] || MOCK_DETAIL["mock-1"];
const HANDOVER_SPOTS = ["Library (2nd Floor)", "Main Cafeteria", "Hostel Gate", "Workshop Block", "Department Office"];

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"basic" | "standard" | "premium">("basic");
  const [requirements, setRequirements] = useState("");
  const [handoverLocation, setHandoverLocation] = useState(HANDOVER_SPOTS[0]);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const resp = await api.get(`/api/peer-services/${id}`);
        setService(resp?.id ? resp : buildFallback(id!));
      } catch {
        setService(buildFallback(id!));
      }
      setLoading(false);
    };
    fetchService();
  }, [id]);

  const handleOrder = async () => {
    if (service?.isDummy || id?.startsWith("dummy-")) {
      toast({ title: DUMMY_MSG.order, variant: "destructive" });
      return;
    }
    if (!user) { navigate("/auth"); return; }
    setOrdering(true);
    try {
      await api.post("/api/peer-orders", {
        seeker_user_id: user.id,
        service_id: id,
        pricing_tier: selectedTier,
        requirements,
        handover_location: service.delivery_method === "On-Campus Handover" ? handoverLocation : null,
      });
      toast({ title: "Order Placed! 🎉", description: "The expert will confirm shortly." });
      navigate("/dashboard");
    } catch {
      toast({ title: "Failed to place order", variant: "destructive" });
    } finally {
      setOrdering(false);
    }
  };

  const handleChat = async () => {
    if (service?.isDummy || id?.startsWith("dummy-")) {
      toast({ title: DUMMY_MSG.chat, variant: "destructive" });
      return;
    }
    if (!user) { navigate("/auth"); return; }
    try {
      const conv = await api.post("/api/conversations", {
        seller_id: service.expert_user_id,
        context_id: service.id,
        context_type: "service",
      });
      navigate(`/chat/${conv.id}`);
    } catch {
      toast({ title: "Could not start chat. Please try again.", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!service) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Service not found.</div>;

  const portfolio: string[] = Array.isArray(service.portfolio_urls) ? service.portfolio_urls : [];
  const skills: string[] = Array.isArray(service.expert_skills) ? service.expert_skills : (typeof service.expert_skills === "string" ? JSON.parse(service.expert_skills) : []);
  const tags: string[] = Array.isArray(service.tags) ? service.tags : [];
  const reviews: any[] = Array.isArray(service.reviews) ? service.reviews : [];
  const isVerified = service.expert_verified === "approved";

  const TIERS = [
    { key: "basic",    label: "Basic",    price: service.price_basic,    desc: "Single sheet / standard task" },
    { key: "standard", label: "Standard", price: service.price_standard, desc: "Detailed work / multiple sheets" },
    { key: "premium",  label: "Premium",  price: service.price_premium,  desc: "Full package / rush delivery" },
  ].filter(t => t.price);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white tap-target" onClick={() => setLightbox(false)}>
            <X className="h-8 w-8" />
          </button>
          <img src={portfolio[activeImg]} alt="Portfolio" className="max-h-[90vh] max-w-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
          {portfolio.length > 1 && (
            <>
              <button className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white tap-target"
                onClick={e => { e.stopPropagation(); setActiveImg(i => (i > 0 ? i - 1 : portfolio.length - 1)); }}>
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white tap-target"
                onClick={e => { e.stopPropagation(); setActiveImg(i => (i < portfolio.length - 1 ? i + 1 : 0)); }}>
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}

      <main className="container mx-auto px-4 py-8 pb-32 lg:pb-12 max-w-6xl">
        {(service?.isDummy || id?.startsWith("dummy-")) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Demo entry.</strong> This listing is for illustration only. Real listings will be posted by verified students.
            </p>
          </div>
        )}
        <button onClick={() => navigate("/service")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors tap-target">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left: Content ── */}
          <div className="lg:col-span-8 space-y-6">
            <FadeIn>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">{service.category}</span>
                {isVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{service.title}</h1>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{(service.expert_name || "?")[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold">{service.expert_name}</p>
                      {isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{service.availability || "Available"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(service.avg_rating) ? "fill-yellow-400 text-yellow-400" : "text-border fill-border"}`} />
                  ))}
                  <span className="text-sm font-bold ml-1">{Number(service.avg_rating).toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground ml-1">({service.review_count})</span>
                </div>
              </div>
            </FadeIn>

            {/* Gallery */}
            {portfolio.length > 0 && (
              <FadeIn delay={100}>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary cursor-pointer" onClick={() => setLightbox(true)}>
                  <img src={portfolio[activeImg]} alt="Portfolio" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
                    <span className="text-white text-[10px] font-medium bg-black/40 px-2.5 py-1 rounded-full">Tap to expand</span>
                  </div>
                  {portfolio.length > 1 && (
                    <>
                      <button className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center tap-target"
                        onClick={e => { e.stopPropagation(); setActiveImg(i => (i > 0 ? i - 1 : portfolio.length - 1)); }}>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center tap-target"
                        onClick={e => { e.stopPropagation(); setActiveImg(i => (i < portfolio.length - 1 ? i + 1 : 0)); }}>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
                        {portfolio.map((_, i) => (
                          <span key={i} className={`h-1.5 rounded-full transition-all ${i === activeImg ? "w-6 bg-primary" : "w-1.5 bg-white/60"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {portfolio.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
                    {portfolio.map((url, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`flex-shrink-0 h-14 w-20 rounded-lg overflow-hidden border-2 transition-all tap-target ${i === activeImg ? "border-primary" : "border-transparent opacity-70"}`}>
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </FadeIn>
            )}

            {/* Description */}
            <FadeIn delay={150}>
              <div className="space-y-3">
                <h2 className="text-base font-bold">About This Service</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{service.description}</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium text-muted-foreground border border-border">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Expert Bio */}
            <FadeIn delay={200}>
              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-bold mb-2 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {(service.expert_name || "?")[0]}
                  </span>
                  About {service.expert_name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{service.expert_bio}</p>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Reviews */}
            {reviews.length > 0 && (
              <FadeIn delay={250}>
                <div className="space-y-3">
                  <h2 className="text-base font-bold">Reviews ({service.review_count})</h2>
                  {reviews.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-border fill-border"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{r.review_text}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            )}
          </div>

          {/* ── Right: Booking Card ── */}
          <div className="lg:col-span-4 order-first lg:order-last">
            <div className="lg:sticky lg:top-24">
              <FadeIn>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Tier selector */}
                  <div className="p-4 border-b border-border">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Choose Package</p>
                    <div className="flex rounded-lg overflow-hidden border border-border">
                      {TIERS.map(tier => (
                        <button
                          key={tier.key}
                          onClick={() => setSelectedTier(tier.key as any)}
                          className={`flex-1 py-2.5 text-xs font-bold transition-all tap-target ${
                            selectedTier === tier.key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {TIERS.find(t => t.key === selectedTier) && (() => {
                      const tier = TIERS.find(t => t.key === selectedTier)!;
                      return (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-primary">₹{tier.price}</span>
                            <span className="text-xs text-muted-foreground">/ order</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{tier.desc}</p>
                        </div>
                      );
                    })()}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-foreground/80">
                        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                        {service.delivery_days} day{service.delivery_days > 1 ? "s" : ""} delivery
                      </div>
                      <div className="flex items-center gap-2 text-foreground/80">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        {service.delivery_method}
                      </div>
                      <div className="flex items-center gap-2 text-foreground/80">
                        <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                        1 revision included
                      </div>
                    </div>

                    {user && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Requirements</label>
                        <Textarea
                          placeholder="Describe exactly what you need…"
                          className="text-sm rounded-lg resize-none min-h-[80px]"
                          value={requirements}
                          onChange={e => setRequirements(e.target.value)}
                        />
                      </div>
                    )}

                    {user && service.delivery_method === "On-Campus Handover" && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Handover Spot</label>
                        <div className="flex flex-wrap gap-1.5">
                          {HANDOVER_SPOTS.map(spot => (
                            <button
                              key={spot}
                              onClick={() => setHandoverLocation(spot)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all tap-target ${
                                handoverLocation === spot
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-secondary text-muted-foreground border-transparent"
                              }`}
                            >
                              {spot}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {user ? (
                      <>
                        <Button onClick={handleChat} variant="outline" className="w-full h-11 rounded-lg font-medium gap-2 border-primary text-primary hover:bg-primary/5">
                          <MessageCircle className="h-4 w-4" /> Message {service.expert_name.split(' ')[0]}
                        </Button>
                        <Button onClick={handleOrder} disabled={ordering} className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 gap-2 mt-2">
                          {ordering
                            ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <><Package className="h-4 w-4" /> Place Order</>}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => navigate("/auth")} className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium gap-2">
                        <MessageCircle className="h-4 w-4" /> Sign In to Hire
                      </Button>
                    )}

                    <p className="text-[10px] text-center text-muted-foreground">
                      Contact details shared only after order confirmation.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
