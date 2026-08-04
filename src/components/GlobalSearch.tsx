import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useCollege } from "@/contexts/CollegeContext";
import { Search, X, ShoppingBag, CalendarDays, BookOpen, Map, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  section: "trade" | "events" | "recover" | "knowledge" | "featured";
  link: string;
}

const SECTION_META: Record<string, { icon: React.ReactNode; label: string }> = {
  trade: { icon: <ShoppingBag className="h-4 w-4" />, label: "Trade" },
  events: { icon: <CalendarDays className="h-4 w-4" />, label: "Events" },
  recover: { icon: <Eye className="h-4 w-4" />, label: "Recover" },
  knowledge: { icon: <BookOpen className="h-4 w-4" />, label: "Knowledge Hub" },
  featured: { icon: <Map className="h-4 w-4" />, label: "Featured" },
};

// Map URL path to search scope
function getSearchScope(pathname: string): string | null {
  if (pathname.startsWith("/trade") || pathname.startsWith("/product")) return "trade";
  if (pathname.startsWith("/events")) return "events";
  if (pathname.startsWith("/recover")) return "recover";
  if (pathname.startsWith("/knowledge")) return "knowledge";
  if (pathname.startsWith("/featured")) return "featured";
  return null; // global
}

export default function GlobalSearch({ className }: { className?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { browseCollege } = useCollege();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const scope = useMemo(() => getSearchScope(location.pathname), [location.pathname]);

  const scopeLabel = scope ? SECTION_META[scope]?.label : "all sections";

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); setQuery(""); }, [location.pathname]);

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);

    const all: SearchResult[] = [];
    const collegeQuery = browseCollege ? `&college_name=${encodeURIComponent(browseCollege)}` : '';

    const shouldSearch = (section: string) => !scope || scope === section;

    const promises: Array<Promise<any>> = [];

    if (shouldSearch("trade")) {
      promises.push(
        api.get(`/api/products?search=${encodeURIComponent(q)}${collegeQuery}`)
          .then((resp) => {
            const data = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []);
            data.slice(0, 5).forEach((p: any) => all.push({ id: p.id, title: p.title, subtitle: `₹${p.price}`, section: "trade" as const, link: `/product/${p.id}` }));
          }).catch(console.error)
      );
    }
    if (shouldSearch("events")) {
      promises.push(
        api.get('/api/events')
          .then((resp) => {
            const data = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []);
            data
              .filter((e: any) => e.title?.toLowerCase().includes(q.toLowerCase()))
              .slice(0, 5)
              .forEach((e: any) => all.push({ id: e.id, title: e.title, subtitle: e.location, section: "events" as const, link: `/events` }));
          }).catch(console.error)
      );
    }
    if (shouldSearch("recover")) {
      promises.push(
        api.get('/api/recover-items')
          .then((resp) => {
            const data = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []);
            data
              .filter((r: any) => r.title?.toLowerCase().includes(q.toLowerCase()))
              .slice(0, 5)
              .forEach((r: any) => all.push({ id: r.id, title: r.title, subtitle: r.where_found, section: "recover" as const, link: `/recover` }));
          }).catch(console.error)
      );
    }
    if (shouldSearch("knowledge")) {
      promises.push(
        api.get('/api/knowledge-hub')
          .then((resp) => {
            const data = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []);
            data
              .filter((k: any) => k.title?.toLowerCase().includes(q.toLowerCase()))
              .slice(0, 5)
              .forEach((k: any) => all.push({ id: k.id, title: k.title, subtitle: k.course, section: "knowledge" as const, link: `/knowledge` }));
          }).catch(console.error)
      );
    }
    if (shouldSearch("featured")) {
      promises.push(
        api.get('/api/expeditions')
          .then((resp) => {
            const data = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []);
            data
              .filter((x: any) => x.title?.toLowerCase().includes(q.toLowerCase()))
              .slice(0, 5)
              .forEach((x: any) => all.push({ id: x.id, title: x.title, subtitle: x.location, section: "featured" as const, link: `/featured` }));
          }).catch(console.error)
      );
    }

    await Promise.all(promises);

    // Prioritize current college
    const collegeItems = all.filter((r) => true); // all items already filtered by ilike
    setResults(all);
    setLoading(false);
  }, [scope]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 250);
  };

  const handleResultClick = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    navigate(result.link);
  };

  // Group results by section
  const grouped = useMemo(() => {
    const map: Record<string, SearchResult[]> = {};
    results.forEach((r) => {
      if (!map[r.section]) map[r.section] = [];
      map[r.section].push(r);
    });
    return map;
  }, [results]);

  const hasResults = results.length > 0;
  const showDropdown = open && query.length >= 2;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={scope ? `Search ${scopeLabel}...` : "Search everything..."}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="pl-10 pr-8 bg-secondary/50 border-0 focus-visible:ring-1 rounded-full"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Loading bar */}
      {loading && showDropdown && (
        <div className="absolute top-full left-0 right-0 h-[2px] z-50 overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-primary animate-pulse rounded-full" style={{ animation: "pulse 0.8s ease-in-out infinite" }} />
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-xl border border-border bg-popover shadow-lg overflow-hidden animate-fade-in">
          {!loading && !hasResults && (
            <p className="text-center text-sm text-muted-foreground py-6">No results found for "{query}"</p>
          )}
          {hasResults && (
            <ScrollArea className="max-h-[60vh]">
              <div className="py-2">
                {Object.entries(grouped).map(([section, items]) => (
                  <div key={section}>
                    <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <span className="text-primary">{SECTION_META[section]?.icon}</span>
                      {SECTION_META[section]?.label}
                    </div>
                    {items.map((item) => (
                      <button
                        key={`${item.section}-${item.id}`}
                        onClick={() => handleResultClick(item)}
                        className="w-full text-left px-4 py-2.5 hover:bg-secondary/60 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                          {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          {scope && (
            <div className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground text-center">
              Searching in <span className="font-medium text-foreground">{scopeLabel}</span> only
            </div>
          )}
        </div>
      )}
    </div>
  );
}
