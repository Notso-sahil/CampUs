import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search, Plus, ShieldCheck, Zap, MapPin,
  Star, ChevronRight, X, SlidersHorizontal, TrendingUp, Users, Award
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import ServiceCard, { type PeerService } from "@/components/ServiceCard";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import { DUMMY_SERVICES, mergeWithDummies } from "@/lib/dummyData";
import { DUMMY_MSG } from "@/lib/dummyMessages";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",                  label: "All",                 emoji: "" },
  { id: "Engineering Graphics", label: "EG Sheets",           emoji: "📐" },
  { id: "Python/Coding",        label: "Python / Coding",     emoji: "🐍" },
  { id: "Hardware/Circuit",     label: "Hardware & Circuits",  emoji: "🔌" },
  { id: "Viva Prep",            label: "Viva Prep",           emoji: "📝" },
  { id: "Lab Files",            label: "Lab Files",           emoji: "🧪" },
];

const SORT_OPTIONS = [
  { id: "top_rated",  label: "Top Rated"   },
  { id: "newest",     label: "Newest"      },
  { id: "price_asc",  label: "Price: Low"  },
  { id: "price_desc", label: "Price: High" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Service() {
  const { user } = useAuthContext();
  const { browseCollege } = useCollege();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("top_rated");
  const [showSort, setShowSort] = useState(false);
  const [services, setServices] = useState<PeerService[]>([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch services from backend, combine with dummy data
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (browseCollege) params.set("college_name", browseCollege);
        
        const resp = await api.get(`/api/peer-services?${params.toString()}`);
        const respData = resp as { data?: PeerService[] };
        const realData: PeerService[] = Array.isArray(resp) ? resp : (Array.isArray(respData?.data) ? respData.data : []);
        setServices(mergeWithDummies(realData, DUMMY_SERVICES as PeerService[], 4));
      } catch (err) {
        console.error("Failed to fetch services", err);
        setServices(mergeWithDummies([], DUMMY_SERVICES as PeerService[], 4));
      }
      setLoading(false);
    };
    fetchServices();
  }, [browseCollege]);

  const handleHireClick = (service: PeerService, e: React.MouseEvent) => {
    if (service.id.startsWith("mock-")) {
      e.preventDefault();
      toast({ title: DUMMY_MSG.order, variant: "destructive" });
    }
  };

  const filteredServices = services
    .filter(s => 
      (activeCategory === "all" || s.category === activeCategory) &&
      (!searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const sortedServices = sortServices(filteredServices, sortBy);

  function sortServices(data: PeerService[], sort: string): PeerService[] {
    const arr = [...data];
    if (sort === "top_rated") arr.sort((a, b) => Number(b.avg_rating) - Number(a.avg_rating));
    else if (sort === "price_asc") arr.sort((a, b) => a.price_basic - b.price_basic);
    else if (sort === "price_desc") arr.sort((a, b) => b.price_basic - a.price_basic);
    return arr;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    searchRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ─── Hero ────────────────────────────────────────────────────────── */}
        <section className="pt-10 pb-8">
          <div className="container mx-auto px-4">
            <FadeIn>
              <h1 className="text-2xl md:text-3xl font-bold">
                Peer Services
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-lg">
                Find skilled students for EG sheets, coding labs, hardware projects & more —
                or monetize your own expertise.
              </p>
            </FadeIn>

            {/* Search bar */}
            <FadeIn delay={50}>
              <form onSubmit={handleSearch} className="mt-5 max-w-xl flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchRef}
                    placeholder="Search services…"
                    className="pl-9 pr-8 h-10 rounded-lg"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  className="h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Search
                </Button>
              </form>
            </FadeIn>
          </div>
        </section>

        {/* ─── Marketplace ────────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-24">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {cat.emoji && <span>{cat.emoji}</span>}
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground font-medium">
                {loading ? "Loading…" : `${sortedServices.length} service${sortedServices.length !== 1 ? "s" : ""} found`}
                {searchQuery && (
                  <span className="ml-2 text-primary font-bold">for "{searchQuery}"</span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSort(!showSort)}
                    className="rounded-xl gap-2 h-9 text-xs"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {SORT_OPTIONS.find(s => s.id === sortBy)?.label || "Sort"}
                  </Button>
                  {showSort && (
                    <div className="absolute right-0 top-11 z-50 w-40 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setSortBy(opt.id); setShowSort(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            sortBy === opt.id
                              ? "text-primary bg-primary/5"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    if (!user) navigate("/auth");
                    else navigate("/service/list");
                  }}
                  size="sm"
                  className="rounded-md h-8 px-3 gap-1.5 bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Start Selling
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-secondary/40 animate-pulse aspect-[4/5]" />
              ))}
            </div>
          ) : sortedServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
              {sortedServices.map((service) => (
                <div key={service.id} className="relative">
                  <ServiceCard service={service} onClick={(e) => handleHireClick(service, e as any)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 rounded-3xl bg-secondary/20 border border-dashed border-border">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No services found</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                Try a different category or clear your search.
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={clearSearch} className="rounded-xl gap-2">
                  <X className="h-4 w-4" /> Clear Search
                </Button>
              )}
            </div>
          )}
        </section>

        {/* ─── How It Works ─────────────────────────────────────────────── */}
        <section className="bg-secondary/30 py-20 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-4xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
                Professional, safe, and built for campus life.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* For Seekers */}
              <div className="space-y-5">
                <h3 className="font-display text-xl font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">S</span>
                  For Seekers
                </h3>
                {[
                  { step: "1", text: "Browse verified expert profiles and filter by category." },
                  { step: "2", text: "View high-res portfolio samples and transparent pricing." },
                  { step: "3", text: "Place an order and share your requirements." },
                  { step: "4", text: "Receive work via on-campus handover or digital delivery." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-medium flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* For Experts */}
              <div className="space-y-5">
                <h3 className="font-display text-xl font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">E</span>
                  For Experts
                </h3>
                {[
                  { step: "1", text: "Create an Expert Profile and upload work samples." },
                  { step: "2", text: "Pass the Trust Protocol quality check (admin reviewed)." },
                  { step: "3", text: "List your services with clear pricing tiers." },
                  { step: "4", text: "Accept orders, deliver quality work, build your campus brand." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-secondary border border-border text-foreground text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-14 text-center">
              <Button
                onClick={() => {
                  if (!user) navigate("/auth");
                  else navigate("/service/list");
                }}
                className="h-11 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors gap-2"
              >
                Become an Expert <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
