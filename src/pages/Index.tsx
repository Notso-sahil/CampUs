import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useCollege } from "@/contexts/CollegeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import SectionCarousel from "@/components/SectionCarousel";
import PageSpinner from "@/components/PageSpinner";
import FadeIn from "@/components/FadeIn";
import { getPlaceholder } from "@/lib/placeholders";
import { ShoppingBag, CalendarDays, Search, BookOpen, Map } from "lucide-react";
import Footer from "@/components/Footer";
import logoImg from "@/assets/logo.png";

interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export default function Index() {
  const { selectedCollege } = useCollege();
  const { user } = useAuthContext();
  const [trade, setTrade] = useState<CarouselItem[]>([]);
  const [events, setEvents] = useState<CarouselItem[]>([]);
  const [recover, setRecover] = useState<CarouselItem[]>([]);
  const [knowledge, setKnowledge] = useState<CarouselItem[]>([]);
  const [expeditions, setExpeditions] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const college = selectedCollege;

      try {
        const prodRes = await api.get(`/api/products`);
        const evtRes = await api.get(`/api/events`);
        const recRes = user ? await api.get(`/api/recover-items`) : [];
        const kbRes = await api.get(`/api/knowledge-hub`);
        const expRes = await api.get(`/api/expeditions`);

        // Helper to safely filter, sort, and limit
        const processItems = (resp: any, dateField = "created_at") => {
          let arr = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []);
          // Filter by college if available
          const filtered = arr.filter((x: any) => x.college_name === college);
          // If no results match the selected college, show latest from all colleges
          const itemsToSort = filtered.length > 0 ? filtered : arr;
          itemsToSort.sort((a: any, b: any) => new Date(b[dateField] || 0).getTime() - new Date(a[dateField] || 0).getTime());
          return itemsToSort.slice(0, 5);
        };

        setTrade(processItems(prodRes).map((p: any) => ({
          id: p.id, title: p.title, subtitle: `₹${p.price}`, imageUrl: p.image_urls?.[0] || getPlaceholder("trade"),
        })));
        setEvents(processItems(evtRes, "event_date").map((e: any) => ({
          id: e.id, title: e.title, subtitle: e.location, imageUrl: e.image_url || getPlaceholder("events"),
        })));
        setRecover(processItems(recRes).map((r: any) => ({
          id: r.id, title: r.title, subtitle: r.where_found, imageUrl: r.image_url || getPlaceholder("recover"),
        })));
        setKnowledge(processItems(kbRes).map((k: any) => ({
          id: k.id, title: k.title, subtitle: [k.course, k.sub_course].filter(Boolean).join(" · "),
          imageUrl: getPlaceholder("knowledge"),
        })));
        setExpeditions(processItems(expRes, "event_date").map((x: any) => ({
          id: x.id, title: x.title, subtitle: x.location, imageUrl: x.image_url || getPlaceholder("expeditions"),
        })));
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };
    fetchAll();
  }, [selectedCollege, user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-5 py-16">
          <FadeIn>
            <div className="flex items-center justify-center gap-3">
              <img src={logoImg} alt="CampusHub logo" className="h-14 w-14 md:h-16 md:w-16 object-contain" />
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Campus<span className="text-primary">Hub</span>
              </h1>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <p className="mx-auto max-w-lg text-lg text-muted-foreground leading-relaxed">
              Your one-stop campus platform — trade, discover events, recover lost items, access study materials, and explore adventures.
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-sm font-medium text-muted-foreground">
              Showing results for <span className="text-foreground font-semibold">{selectedCollege}</span>
            </p>
          </FadeIn>
        </section>

        {loading ? (
          <PageSpinner />
        ) : (
          <>
            <FadeIn delay={0}>
              <SectionCarousel
                title="Trade"
                viewAllLink="/trade"
                items={trade}
                icon={<ShoppingBag className="h-5 w-5" />}
                placeholderCategory="trade"
                renderCard={(item) => (
                  <Link to={`/product/${item.id}`} className="block">
                    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow group/card">
                      <div className="aspect-video bg-secondary overflow-hidden">
                        <img src={item.imageUrl || getPlaceholder("trade")} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-medium line-clamp-1">{item.title}</h4>
                        {item.subtitle && <p className="font-display text-base font-semibold mt-1 text-primary">{item.subtitle}</p>}
                      </div>
                    </div>
                  </Link>
                )}
              />
            </FadeIn>

            <FadeIn delay={100}>
              <SectionCarousel
                title="Events"
                viewAllLink="/events"
                items={events}
                icon={<CalendarDays className="h-5 w-5" />}
                placeholderCategory="events"
              />
            </FadeIn>

            <FadeIn delay={200}>
              {user ? (
                <SectionCarousel
                  title="Recover"
                  viewAllLink="/recover"
                  items={recover}
                  icon={<Search className="h-5 w-5" />}
                  placeholderCategory="recover"
                />
              ) : (
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-primary"><Search className="h-5 w-5" /></span>
                      <h2 className="font-display text-2xl font-bold">Recover</h2>
                    </div>
                    <Link to="/recover" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                      View All
                    </Link>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-8 text-center shadow-soft">
                    <p className="text-sm text-muted-foreground">
                      <Link to="/auth" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors">Sign in</Link> to browse lost & found items
                    </p>
                  </div>
                </section>
              )}
            </FadeIn>

            <FadeIn delay={300}>
              <SectionCarousel
                title="Knowledge Hub"
                viewAllLink="/knowledge"
                items={knowledge}
                icon={<BookOpen className="h-5 w-5" />}
                placeholderCategory="knowledge"
              />
            </FadeIn>

            <FadeIn delay={400}>
              <SectionCarousel
                title="Expeditions"
                viewAllLink="/expeditions"
                items={expeditions}
                icon={<Map className="h-5 w-5" />}
                placeholderCategory="expeditions"
              />
            </FadeIn>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
