import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";

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

export default function Trade() {
  const { user } = useAuthContext();
  const { selectedCollege } = useCollege();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    if (!category && !searchQuery) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const resp = await api.get('/api/products');
        let items = (Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []));
        
        if (category) items = items.filter(p => p.category === category);
        if (searchQuery) items = items.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

        items.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const collegeItems = items.filter((p) => p.college_name === selectedCollege);
        const otherItems = items.filter((p) => p.college_name !== selectedCollege);
        items = [...collegeItems, ...otherItems];

        setProducts(items);
      } catch (err) {
        console.error("Trade fetch error:", err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [category, searchQuery, selectedCollege]);

  const showGrid = !category && !searchQuery;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {category && (
              <button
                onClick={() => setCategory(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h1 className="font-display text-3xl font-bold">
              {category || "Trade"}
            </h1>
          </div>
          {user && (
            <Button asChild size="sm" className="gap-2">
              <Link to="/sell"><Plus className="h-4 w-4" /> List Item</Link>
            </Button>
          )}
        </div>

        {showGrid ? (
          <div className="animate-fade-in">
            <p className="text-muted-foreground mb-6 text-sm">Browse by category</p>
            <CategoryGrid onSelect={setCategory} />
          </div>
        ) : (
          <>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-square animate-pulse rounded-lg bg-secondary" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-5 w-1/3 animate-pulse rounded bg-secondary" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-muted-foreground">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">Be the first to list something!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 animate-fade-in">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        <section className="mt-16 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            💰 All transactions are <span className="text-foreground font-semibold">Cash on Delivery / Pay on Meetup</span>
          </p>
        </section>
      </main>
    </div>
  );
}
