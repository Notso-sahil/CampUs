import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdBlock from "@/components/AdBlock";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  condition: string;
  category: string;
  college_name: string | null;
  image_urls: string[];
  seller_id: string;
  created_at: string;
}

interface SellerProfile {
  display_name: string | null;
  college_name: string | null;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (data) {
        setProduct(data as Product);
        const { data: displayName } = await supabase.rpc("get_display_name", { _user_id: data.seller_id });
        setSeller({ display_name: displayName || null, college_name: data.college_name });
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleChat = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!product) return;

    // Check for existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("seller_id", product.seller_id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      navigate(`/chat/${existing.id}`);
      return;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id: product.id,
      })
      .select("id")
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    navigate(`/chat/${newConv.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="h-96 animate-pulse rounded-lg bg-secondary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">Product not found</p>
        </div>
      </div>
    );
  }

  const images = product.image_urls.length > 0 ? product.image_urls : ["/placeholder.svg"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                      i === selectedImage ? "border-foreground" : "border-transparent"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">{product.category}</Badge>
              <h1 className="font-display text-3xl font-bold">{product.title}</h1>
              <p className="mt-2 font-display text-4xl font-bold">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Condition:</span>
                <Badge variant="outline">{product.condition}</Badge>
              </div>
              {product.college_name && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{product.college_name}</span>
                </div>
              )}
              {seller && (
                <div className="text-sm text-muted-foreground">
                  Seller: <span className="text-foreground">{seller.display_name || "Anonymous"}</span>
                </div>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium">💰 Cash on Delivery / Pay on Meetup</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Meet the seller on campus to complete the transaction
              </p>
            </div>

            {user?.id !== product.seller_id && (
              <Button onClick={handleChat} size="lg" className="w-full gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat with Seller
              </Button>
            )}
          </div>
        </div>

        {/* Ad Block */}
        <AdBlock slotId="2345678901" className="mt-8" />
      </main>
    </div>
  );
}
