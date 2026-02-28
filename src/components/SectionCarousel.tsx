import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

export default function SectionCarousel({ title, viewAllLink, items, renderCard }: SectionCarouselProps) {
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

    // Auto-scroll every 4 seconds
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

  const defaultCard = (item: CarouselItem) => (
    <div className="rounded-lg border border-border bg-card p-4 h-full flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
      {item.imageUrl && (
        <div className="aspect-video overflow-hidden rounded-md bg-secondary mb-3">
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}
      <h4 className="font-body text-sm font-medium leading-tight line-clamp-2">{item.title}</h4>
      {item.subtitle && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.subtitle}</p>
      )}
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <Link
          to={viewAllLink}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm shadow-md h-8 w-8"
              disabled={!canPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm shadow-md h-8 w-8"
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
