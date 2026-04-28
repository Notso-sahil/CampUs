import { Link } from "react-router-dom";
import { Star, MapPin, CheckCircle2, Clock, Zap } from "lucide-react";

const DELIVERY_ICON: Record<string, string> = {
  "On-Campus Handover": "📍",
  "Digital PDF": "📄",
  "WhatsApp": "💬",
  "Digital + Printout": "🖨️",
};

export interface PeerService {
  id: string;
  title: string;
  expert_name: string;
  expert_user_id: string;
  avg_rating: number;
  review_count: number;
  price_basic: number;
  category: string;
  portfolio_urls: string[];
  is_verified?: boolean;
  expert_verified?: string;
  delivery_method: string;
  delivery_days?: number;
  availability?: string;
}

interface ServiceCardProps {
  service: PeerService;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const thumbnail = service.portfolio_urls?.[0];
  const isVerified = service.expert_verified === "approved" || service.is_verified;
  const initials = (service.expert_name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      to={`/hire-peer/${service.id}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden transition-colors active:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl font-bold text-primary/20">{service.category[0]}</span>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-background/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm border border-border/50">
            {service.category}
          </span>
        </div>
        {/* Availability dot */}
        {service.availability === "Available" && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Open
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Expert row */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs font-semibold text-foreground/80 truncate">
              {service.expert_name}
            </span>
            {isVerified && (
              <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {service.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= Math.round(service.avg_rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-border fill-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-foreground">
            {Number(service.avg_rating).toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({service.review_count})
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <span>{DELIVERY_ICON[service.delivery_method] || "📦"}</span>
            <span className="truncate max-w-[90px]">{service.delivery_method}</span>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              From
            </p>
            <p className="text-sm font-bold text-primary">₹{service.price_basic}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
