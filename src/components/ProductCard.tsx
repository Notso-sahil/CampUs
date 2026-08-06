import { Link } from "react-router-dom";
import { MapPin, Tag } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  college_name: string | null;
  image_urls: string[];
  created_at: string;
  seller_name?: string;
}

const CONDITION_COLORS: Record<string, string> = {
  "New":       "bg-emerald-500/10 text-emerald-600",
  "Like New":  "bg-primary/10 text-primary",
  "Good":      "bg-amber-500/10 text-amber-600",
  "Fair":      "bg-orange-500/10 text-orange-600",
};

// Unique, high-quality placeholder images per category
const CATEGORY_IMAGES: Record<string, string> = {
  "Textbooks":       "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
  "Electronics":     "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop",
  "Stationery":      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop",
  "Lab Equipment":   "https://images.unsplash.com/photo-1532094349884-543559244f8f?w=600&auto=format&fit=crop",
  "Clothing":        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop",
  "Sports":          "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop",
  "Furniture":       "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop",
  "Drafters":        "https://images.unsplash.com/photo-1503387762-592dea58ef23?w=600&auto=format&fit=crop",
  "default":         "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&auto=format&fit=crop",
};

export default function ProductCard({ product }: { product: Product }) {
  const imageUrl =
    product.image_urls?.[0] ||
    CATEGORY_IMAGES[product.category] ||
    CATEGORY_IMAGES["default"];

  const conditionClass = CONDITION_COLORS[product.condition] || "bg-secondary text-muted-foreground";

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden transition-colors active:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={imageUrl}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Condition badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${conditionClass}`}>
            {product.condition}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-start gap-1 min-h-[2.5rem]">
          <h3 className="font-display text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {product.title}
          </h3>
        </div>

        <p className="text-lg font-bold text-primary">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {product.category}
          </span>
          {product.college_name && (
            <span className="flex items-center gap-1 truncate max-w-[110px]">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {product.college_name}
            </span>
          )}
        </div>
        {product.seller_name && (
          <div className="text-[10px] text-muted-foreground truncate pt-1">
            Seller: <span className="font-medium text-foreground">{product.seller_name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
