import { Link } from "react-router-dom";
import { getPlaceholder } from "@/lib/placeholders";

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

export default function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.image_urls?.[0] || getPlaceholder("trade");

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block animate-fade-in transition-all duration-300 hover:-translate-y-1.5"
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-secondary shadow-soft group-hover:shadow-glow transition-shadow duration-300">
        <img
          src={imageUrl}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-body text-sm font-medium leading-tight line-clamp-2">
          {product.title}
        </h3>
        <p className="font-display text-lg font-semibold text-primary">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium">
            {product.condition}
          </span>
          {product.college_name && (
            <span className="truncate">{product.college_name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
