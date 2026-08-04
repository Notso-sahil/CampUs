import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import {
  Plus, Trash2, Settings, ShoppingBag, MessageCircle,
  MapPin, User, Users, Briefcase, ChevronRight, Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  image_urls: string[];
  created_at: string;
}

const CONDITION_COLORS: Record<string, string> = {
  "New":      "bg-emerald-500/10 text-emerald-600",
  "Like New": "bg-primary/10 text-primary",
  "Good":     "bg-amber-500/10 text-amber-600",
  "Fair":     "bg-orange-500/10 text-orange-600",
};

export default function Dashboard() {
  const { user, profile } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    api.get(`/api/products?seller_id=${user.id}`)
      .then(data => {
        const arr = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
        setProducts(arr);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/products?id=${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Product deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    }
  };

  const initials = (profile?.display_name || user?.firstName || "?")
    .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <FadeIn>
          {/* Profile Hero Card */}
          <div className="rounded-2xl border border-border bg-card shadow-soft p-5 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-xl font-bold truncate">
                  {profile?.display_name || user?.firstName || "My Account"}
                </h1>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  {user?.primaryEmailAddress?.emailAddress && (
                    <p className="text-xs text-muted-foreground truncate">
                      {user.primaryEmailAddress.emailAddress}
                    </p>
                  )}
                  {profile?.college_name && (
                    <p className="text-xs text-primary font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{profile.college_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              {[
                { to: "/sell",           icon: <Plus className="h-4 w-4" />,        label: "List Item",      primary: true  },
                { to: "/chat",           icon: <MessageCircle className="h-4 w-4" />, label: "Messages",    primary: false },
                { to: "/find-teammates", icon: <Users className="h-4 w-4" />,        label: "Find Teammates", primary: false },
                { to: "/service",        icon: <Briefcase className="h-4 w-4" />,    label: "Services",       primary: false },
                { to: "/settings",       icon: <Settings className="h-4 w-4" />,     label: "Settings",       primary: false },
              ].map(btn => (
                <Button
                  key={btn.to}
                  asChild
                  variant={btn.primary ? "default" : "outline"}
                  size="sm"
                  className={`rounded-lg gap-1.5 h-10 text-xs font-medium w-full ${btn.primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                >
                  <Link to={btn.to}>
                    {btn.icon}{btn.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Listings */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" /> My Listings
            </h2>
            <span className="text-sm text-muted-foreground">
              {loading ? "…" : `${products.length} item${products.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-secondary/40 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-secondary/20 border border-dashed border-border">
              <div className="mx-auto w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">No listings yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Be the first to list something for sale!</p>
              <Button asChild className="bg-primary text-primary-foreground rounded-lg gap-2 hover:bg-primary/90">
                <Link to="/sell"><Plus className="h-4 w-4" /> List Your First Item</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(product => (
                <div
                  key={product.id}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary/30 hover:shadow-soft transition-all"
                >
                  {/* Thumbnail */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-secondary">
                    <img
                      src={product.image_urls?.[0] || ""}
                      alt={product.title}
                      className="h-full w-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${product.id}`}
                      className="font-bold text-sm line-clamp-1 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {product.title}
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100" />
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${CONDITION_COLORS[product.condition] || "bg-secondary text-muted-foreground"}`}>
                        {product.condition}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-10 w-10 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove "{product.title}" from the marketplace.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.id)}
                          className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
