import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  image_urls: string[];
  created_at: string;
}

export default function Dashboard() {
  const { user, profile } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("products")
      .select("id, title, price, condition, image_urls, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Product deleted" });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">My Listings</h1>
            {profile?.college_name && (
              <p className="mt-1 text-sm text-muted-foreground">{profile.college_name}</p>
            )}
          </div>
          <Button asChild>
            <Link to="/sell" className="gap-2">
              <Plus className="h-4 w-4" />
              List Item
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No listings yet</p>
            <Button asChild className="mt-4">
              <Link to="/sell">List your first item</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                  <img
                    src={product.image_urls?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.id}`} className="font-medium hover:underline line-clamp-1">
                    {product.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    ₹{product.price.toLocaleString("en-IN")} · {product.condition}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(product.id)}
                  className="flex-shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
