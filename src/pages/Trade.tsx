import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import {
  Plus, Search, X, SlidersHorizontal, ShoppingBag,
  Tag, Sparkles, TrendingUp, Users
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  college_name: string | null;
  image_urls: string[];
  created_at: string;
}

// Unique hi-res images for mock drafter product (kept as requested)
const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-drafter-1",
    title: "Staedtler Mars Comfort Drafter Set — Full 15-piece Kit",
    price: 1499,
    condition: "Like New",
    category: "Drafter Set",
    college_name: "VIPS",
    image_urls: ["https://images.unsplash.com/photo-1503387762-592dea58ef23?w=800&auto=format&fit=crop"],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-calc-1",
    title: "Casio FX-991EX Scientific Calculator",
    price: 850,
    condition: "Good",
    category: "Calculator",
    college_name: "VIPS",
    image_urls: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&auto=format&fit=crop"],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-labcoat-1",
    title: "White Lab Coat — Full Sleeve, Size M",
    price: 299,
    condition: "New",
    category: "Lab Coat",
    college_name: "VIPS",
    image_urls: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop"],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-sheetbox-1",
    title: "Sheet Box — A1/A2 Drawing Sheet Storage Tube",
    price: 199,
    condition: "Good",
    category: "Sheet Box",
    college_name: "VIPS",
    image_urls: ["https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop"],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-apron-1",
    title: "Workshop Apron — Heavy Duty Canvas",
    price: 349,
    condition: "Like New",
    category: "Apron",
    college_name: "VIPS",
    image_urls: ["https://images.unsplash.com/photo-1624797888671-96e50e6af42e?w=800&auto=format&fit=crop"],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-other-1",
    title: "Engineering Drawing Mini Drafter — Portable Table Attachment",
    price: 650,
    condition: "Good",
    category: "Drafter Set",
    college_name: "VIPS",
    image_urls: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop"],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-other-2",
    title: "Lexi Pen Set — 20 colours for Technical Drawing",
    price: 180,
    condition: "New",
    category: "Other",
    college_name: "VIPS",
    image_urls: ["https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&auto=format&fit=crop"],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-other-3",
    title: "Graph Paper Notebook — 200 pages A4",
    price: 120,
    condition: "New",
    category: "Other",
    college_name: "VIPS",
    image_urls: ["https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&auto=format&fit=crop"],
    created_at: new Date().toISOString(),
  },
];

const SORT_OPTIONS = [
  { id: "newest",    label: "Newest First"  },
  { id: "price_asc", label: "Price: Low→High" },
  { id: "price_desc",label: "Price: High→Low" },
];

const CONDITION_FILTERS = ["New", "Like New", "Good", "Fair"];

export default function Trade() {
  const { user } = useAuthContext();
  const { selectedCollege } = useCollege();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [conditionFilter, setConditionFilter] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const resp = await api.get("/api/products");
        let items: Product[] = Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.data) ? resp.data : [];

        // College priority
        const college = items.filter(p => p.college_name === selectedCollege);
        const other   = items.filter(p => p.college_name !== selectedCollege);
        items = [...college, ...other];

        if (items.length === 0) items = MOCK_PRODUCTS;

        if (activeCategory)   items = items.filter(p => p.category === activeCategory);
        if (searchQuery)      items = items.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
        if (conditionFilter)  items = items.filter(p => p.condition === conditionFilter);

        // Sort
        if (sortBy === "newest")     items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (sortBy === "price_asc")  items.sort((a, b) => a.price - b.price);
        if (sortBy === "price_desc") items.sort((a, b) => b.price - a.price);

        setProducts(items);
      } catch {
        setProducts(MOCK_PRODUCTS);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [activeCategory, searchQuery, conditionFilter, sortBy, selectedCollege]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const clearFilters = () => {
    setActiveCategory(null);
    setSearchInput("");
    setSearchQuery("");
    setConditionFilter(null);
    setSortBy("newest");
  };

  const hasFilters = !!(activeCategory || searchQuery || conditionFilter);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <section className="relative pt-14 pb-10 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-16 left-1/3 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute top-24 right-1/4 w-[300px] h-[300px] bg-primary-glow/10 rounded-full blur-[80px]" />
          </div>

          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                <ShoppingBag className="h-3.5 w-3.5" /> Campus Marketplace
              </div>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                    Trade
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm md:text-base">
                    Buy and sell campus essentials — safely, locally, peer-to-peer.
                  </p>
                </div>
                {user && (
                  <Button asChild className="gradient-primary text-primary-foreground rounded-2xl h-11 px-6 gap-2 font-bold shadow-soft hover:shadow-glow transition-shadow self-start md:self-auto">
                    <Link to="/sell"><Plus className="h-4 w-4" /> List Item</Link>
                  </Button>
                )}
              </div>
            </FadeIn>

            {/* Search */}
            <FadeIn delay={100}>
              <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchRef}
                    placeholder="Search drafter sets, calculators, lab coats…"
                    className="pl-11 pr-9 h-12 rounded-2xl bg-card border-border shadow-soft focus-visible:ring-primary"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <button type="button" onClick={() => { setSearchInput(""); setSearchQuery(""); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button type="submit" className="h-12 px-6 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-soft hover:shadow-glow flex-shrink-0">
                  Search
                </Button>
              </form>
            </FadeIn>

            {/* Stats */}
            <FadeIn delay={200}>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { icon: <Users className="h-3.5 w-3.5" />, label: "Peer-to-Peer" },
                  { icon: <Tag className="h-3.5 w-3.5" />,   label: "Cash on Meetup" },
                  { icon: <TrendingUp className="h-3.5 w-3.5" />, label: "No Commission" },
                  { icon: <Sparkles className="h-3.5 w-3.5" />, label: "Campus-Verified" },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground border border-border/50">
                    <span className="text-primary">{b.icon}</span>{b.label}
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── Toolbar + Grid ───────────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-24">

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 mb-4 scrollbar-none">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                !activeCategory
                  ? "gradient-primary text-primary-foreground border-transparent shadow-soft"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              ✨ All Items
            </button>
            {PRODUCT_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  activeCategory === cat.value
                    ? "gradient-primary text-primary-foreground border-transparent shadow-soft"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Condition filters + sort */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
            <div className="flex gap-2 flex-wrap">
              {CONDITION_FILTERS.map(c => (
                <button
                  key={c}
                  onClick={() => setConditionFilter(conditionFilter === c ? null : c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    conditionFilter === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-destructive border border-destructive/20 hover:bg-destructive/5 transition-all">
                  <X className="h-3 w-3" /> Clear All
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground hidden sm:block">
                {loading ? "Loading…" : `${products.length} item${products.length !== 1 ? "s" : ""}`}
              </p>
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setShowSort(!showSort)} className="rounded-xl gap-2 h-9 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {SORT_OPTIONS.find(s => s.id === sortBy)?.label || "Sort"}
                </Button>
                {showSort && (
                  <div className="absolute right-0 top-11 z-50 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.id} onClick={() => { setSortBy(opt.id); setShowSort(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${sortBy === opt.id ? "text-primary bg-primary/5" : "text-foreground hover:bg-secondary"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-secondary/40 animate-pulse aspect-[4/5]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 rounded-3xl bg-secondary/20 border border-dashed border-border">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="text-muted-foreground mt-2 mb-6">Try clearing filters or be the first to list!</p>
              {user && (
                <Button asChild className="gradient-primary text-primary-foreground rounded-2xl gap-2">
                  <Link to="/sell"><Plus className="h-4 w-4" /> List Something</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* ─── Trust Banner ─────────────────────────────────────────── */}
        <section className="bg-secondary/30 border-t border-border py-10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-bold text-foreground/80">
              💰 All transactions are{" "}
              <span className="text-primary">Cash on Delivery / Pay on Meetup</span>
              {" "}— meet on campus, stay safe.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
