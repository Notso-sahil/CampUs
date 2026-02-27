import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from("products")
        .select("id, title, price, condition, category, college_name, image_urls, created_at")
        .order("created_at", { ascending: false });

      if (category !== "All") query = query.eq("category", category);
      if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);

      const { data, error } = await query;
      if (error) console.error("Trade fetch error:", error);
      let items = (data as Product[]) || [];

      // Prioritize selected college
      const collegeItems = items.filter((p) => p.college_name === selectedCollege);
      const otherItems = items.filter((p) => p.college_name !== selectedCollege);
      items = [...collegeItems, ...otherItems];

      setProducts(items);
      setLoading(false);
    };
    fetchProducts();
  }, [category, searchQuery, selectedCollege]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Trade</h1>
          {user && (
            <Button asChild size="sm" className="gap-2">
              <Link to="/sell"><Plus className="h-4 w-4" /> List Item</Link>
            </Button>
          )}
        </div>

        <div className="mb-8">
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>

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

        <section className="mt-16 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            💰 All transactions are <span className="text-foreground font-semibold">Cash on Delivery / Pay on Meetup</span>
          </p>
        </section>
      </main>
    </div>
  );
}
