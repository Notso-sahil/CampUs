import { Link } from "react-router-dom";

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
  const imageUrl = product.image_urls?.[0] || "/placeholder.svg";

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block animate-fade-in"
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
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
        <p className="font-display text-lg font-semibold">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5">
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
