import { PRODUCT_CATEGORIES } from "@/lib/categories";

interface CategoryGridProps {
  onSelect: (category: string) => void;
}

export default function CategoryGrid({ onSelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {PRODUCT_CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 transition-colors active:bg-secondary/50"
        >
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-secondary">
            <img
              src={cat.image}
              alt={cat.label}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          <span className="text-xs font-medium text-foreground">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
