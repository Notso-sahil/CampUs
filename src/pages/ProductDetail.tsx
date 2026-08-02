import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, MapPin, ArrowLeft, Pencil, Trash2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { CATEGORY_VALUES } from "@/lib/categories";
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

const CONDITIONS = ["New", "Like New", "Good", "Fair"];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerName, setSellerName] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const isOwner = user && product && user.id === product.seller_id;
  const canEdit = isOwner || isAdmin;

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        // Try fetching by specific ID first
        const data = await api.get(`/api/products?id=${id}`);

        let found: Product | null = null;

        if (Array.isArray(data)) {
          // If the API returns an array, find by ID (handles both filtered and unfiltered responses)
          const match = data.find((p: any) => p.id === id || String(p.id) === String(id));
          if (match) found = match as Product;
        } else if (data && typeof data === "object" && !Array.isArray(data) && (data as any).id) {
          // API returned a single object
          found = data as Product;
        }

        // Fallback: fetch all products and search client-side
        if (!found) {
          const allData = await api.get(`/api/products`);
          const arr = Array.isArray(allData) ? allData : (Array.isArray((allData as any)?.data) ? (allData as any).data : []);
          const match = arr.find((p: any) => p.id === id || String(p.id) === String(id));
          if (match) found = match as Product;
        }

        if (found) {
          setProduct(found);
          try {
            const profileData = await api.get(`/api/profile?user_id=${found.seller_id}`);
            setSellerName((profileData as any)?.display_name || "Unknown Seller");
          } catch {
            setSellerName("Unknown Seller");
          }
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleChat = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!product) return;
    try {
      const userConvs = await api.get(`/api/conversations?user_id=${user.id}`);
      const convArr = Array.isArray(userConvs) ? userConvs : Array.isArray(userConvs?.data) ? userConvs.data : [];
      const existing = convArr.find((c: any) => c.product_id === product.id && c.seller_id === product.seller_id);
      if (existing) { navigate(`/chat/${existing.id}`); return; }
      
      const newConv = await api.post("/api/conversations", { buyer_id: user.id, seller_id: product.seller_id, product_id: product.id });
      navigate(`/chat/${newConv.id}`);
    } catch {
      toast({ title: "Error", description: "Could not start conversation.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await api.delete(`/api/products?id=${product.id}`);
      toast({ title: "Product deleted" });
      navigate("/trade");
    } catch {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
      setDeleting(false);
    }
  };

  const openEdit = () => {
    if (!product) return;
    setEditTitle(product.title);
    setEditDescription(product.description || "");
    setEditPrice(product.price.toString());
    setEditCondition(product.condition);
    setEditCategory(product.category);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!product) return;
    setSaving(true);
    try {
      await api.put("/api/products", {
        id: product.id,
        title: editTitle,
        description: editDescription || null,
        price: parseFloat(editPrice),
        condition: editCondition,
        category: editCategory,
      });
      setProduct({ ...product, title: editTitle, description: editDescription || null, price: parseFloat(editPrice), condition: editCondition, category: editCategory });
      toast({ title: "Product updated!" });
      setEditOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleImageSwap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({ title: "Image upload is currently unavailable", variant: "destructive" });
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

  const images = product.image_urls && product.image_urls.length > 0 ? product.image_urls : [""];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-8 pb-24 md:pb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors tap-target"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary group">
              <img src={images[selectedImage]} alt={product.title} className="h-full w-full object-cover" />
              {canEdit && (
                <label className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/30 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium shadow-soft">
                    <Camera className="h-4 w-4" /> Change Image
                  </div>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageSwap} className="hidden" />
                </label>
              )}
            </div>
            {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors tap-target ${
                      i === selectedImage ? "border-primary" : "border-transparent"
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
              <h1 className="text-2xl font-bold mt-1">{product.title}</h1>
              <p className="mt-2 text-3xl font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</p>
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
              {sellerName && (
                <div className="text-sm text-muted-foreground">
                  Seller: <span className="text-foreground">{sellerName}</span>
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
              <p className="mt-1 text-xs text-muted-foreground">Meet the seller on campus to complete the transaction</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {user?.id !== product.seller_id && (
                <Button onClick={handleChat} size="lg" className="w-full sm:flex-1 gap-2">
                  <MessageCircle className="h-5 w-5" /> Chat with Seller
                </Button>
              )}

              {canEdit && (
                <>
                  <Button variant="outline" onClick={openEdit} className="gap-2">
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2" disabled={deleting}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                          {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={150} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} maxLength={2000} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={editCondition} onValueChange={setEditCondition}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORY_VALUES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveEdit} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AdBlock slotId="2345678901" className="mt-8" />
      </main>
    </div>
  );
}
