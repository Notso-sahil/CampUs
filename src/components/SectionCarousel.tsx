import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlaceholder } from "@/lib/placeholders";

interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

interface SectionCarouselProps {
  title: string;
  viewAllLink: string;
  items: CarouselItem[];
  renderCard?: (item: CarouselItem) => React.ReactNode;
  icon?: React.ReactNode;
  placeholderCategory?: "trade" | "events" | "recover" | "expeditions" | "knowledge";
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

  if (items.length === 0) return null;

  const fallbackImg = getPlaceholder(placeholderCategory);

  const defaultCard = (item: CarouselItem) => (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow group/card">
      <div className="aspect-video overflow-hidden bg-secondary">
        <img
          src={item.imageUrl || fallbackImg}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h4 className="font-body text-sm font-medium leading-tight line-clamp-2">{item.title}</h4>
        {item.subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{item.subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-primary">{icon}</span>}
          <h2 className="font-display text-2xl font-bold">{title}</h2>
        </div>
        <Link
          to={viewAllLink}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative group">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex-none w-[260px] sm:w-[300px]">
                {renderCard ? renderCard(item) : defaultCard(item)}
              </div>
            ))}
          </div>
        </div>

        {items.length > 2 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity glass shadow-soft h-9 w-9 rounded-full"
              disabled={!canPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity glass shadow-soft h-9 w-9 rounded-full"
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
