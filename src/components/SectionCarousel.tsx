import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
const PLACEHOLDERS = {
  trade: "/placeholder.svg",
  events: "/dummy/hackathon.png",
  recover: "/dummy/lost_wallet.png",
  featured: "/dummy/manali_snow_trek.png",
  knowledge: "/placeholder.svg",
  default: "/placeholder.svg",
} as const;

interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isDummy?: boolean;
}

interface SectionCarouselProps {
  title: string;
  viewAllLink: string;
  items: CarouselItem[];
  renderCard?: (item: CarouselItem) => React.ReactNode;
  icon?: React.ReactNode;
  placeholderCategory?: "trade" | "events" | "recover" | "featured" | "knowledge";
}

export default function SectionCarousel({ title, viewAllLink, items, renderCard, icon, placeholderCategory = "default" as any }: SectionCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1 });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, 4000);

    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-border p-8 text-center bg-card/50">
          <p className="text-sm text-muted-foreground">No items found yet.</p>
        </div>
      </section>
    );
  }

  const fallbackImg = PLACEHOLDERS[placeholderCategory] || PLACEHOLDERS.default;

  const defaultCard = (item: CarouselItem) => (
    <div className="relative rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors group/card">
      {item.isDummy && (
        <span className="absolute top-2 left-2 z-10 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 border border-amber-300">
          Demo
        </span>
      )}
      <div className="aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={item.imageUrl || fallbackImg}
          alt={item.title}
          className="h-full w-full object-cover group-hover/card:scale-[1.03] transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h4 className="text-sm font-medium leading-tight line-clamp-2">{item.title}</h4>
        {item.subtitle && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <Link
          to={viewAllLink}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="relative group">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex-none w-[240px] sm:w-[280px]">
                {renderCard ? renderCard(item) : defaultCard(item)}
              </div>
            ))}
          </div>
        </div>

        {items.length > 2 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full bg-background shadow-sm border-border"
              disabled={!canPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full bg-background shadow-sm border-border"
              disabled={!canNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
