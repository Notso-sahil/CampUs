import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import AdBlock from "@/components/AdBlock";
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

export default function Index() {
  const { profile } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    fetchProducts();
  }, [category, searchQuery, profile?.college_name]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("id, title, price, condition, category, college_name, image_urls, created_at")
      .order("created_at", { ascending: false });

    if (category !== "All") {
      query = query.eq("category", category);
    }
    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data } = await query;

    let items = (data as Product[]) || [];

    // Prioritize user's college products
    if (profile?.college_name) {
      const collegeItems = items.filter((p) => p.college_name === profile.college_name);
      const otherItems = items.filter((p) => p.college_name !== profile.college_name);
      items = [...collegeItems, ...otherItems];
    }

    setProducts(items);
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Your Campus Marketplace
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            Buy and sell academic gear with students from your college. Drafters, lab coats, aprons, and more.
          </p>
          {profile?.college_name && (
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Showing results from <span className="text-foreground">{profile.college_name}</span> first
            </p>
          )}
        </section>

        {/* Categories */}
        <section className="mb-8">
          <CategoryFilter selected={category} onSelect={setCategory} />
        </section>

        {/* Products Grid */}
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
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to list something!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Ad Block */}
        <AdBlock slotId="1234567890" />

        {/* Payment Notice */}
        <section className="mt-16 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            💰 All transactions are <span className="text-foreground font-semibold">Cash on Delivery / Pay on Meetup</span>
          </p>
        </section>
      </main>
    </div>
  );
}
