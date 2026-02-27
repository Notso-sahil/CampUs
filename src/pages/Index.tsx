import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCollege } from "@/contexts/CollegeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import SectionCarousel from "@/components/SectionCarousel";
import PageSpinner from "@/components/PageSpinner";
import FadeIn from "@/components/FadeIn";

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

      const prodRes = await supabase.from("products").select("id, title, price, image_urls, college_name").eq("college_name", college).order("created_at", { ascending: false }).limit(5);
      const evtRes = await supabase.from("events").select("id, title, event_date, location, college_name").eq("college_name", college).order("created_at", { ascending: false }).limit(5);
      const recRes = user
        ? await supabase.from("recover_items").select("id, title, where_found, college_name").eq("college_name", college).order("created_at", { ascending: false }).limit(5)
        : { data: [], error: null };
      const kbRes = await supabase.from("knowledge_hub").select("id, title, course, sub_course, college_name").eq("college_name", college).order("created_at", { ascending: false }).limit(5);
      const expRes = await supabase.from("expeditions").select("id, title, event_date, location, college_name").eq("college_name", college).order("created_at", { ascending: false }).limit(5);

      // Log any errors for debugging
      if (prodRes.error) console.error("Products fetch error:", prodRes.error);
      if (evtRes.error) console.error("Events fetch error:", evtRes.error);
      if (recRes.error) console.error("Recover fetch error:", recRes.error);
      if (kbRes.error) console.error("Knowledge fetch error:", kbRes.error);
      if (expRes.error) console.error("Expeditions fetch error:", expRes.error);

      setTrade((prodRes.data || []).map((p: any) => ({
        id: p.id, title: p.title, subtitle: `₹${p.price}`, imageUrl: p.image_urls?.[0],
      })));
      setEvents((evtRes.data || []).map((e: any) => ({
        id: e.id, title: e.title, subtitle: e.location,
      })));
      setRecover((recRes.data || []).map((r: any) => ({
        id: r.id, title: r.title, subtitle: r.where_found,
      })));
      setKnowledge((kbRes.data || []).map((k: any) => ({
        id: k.id, title: k.title, subtitle: [k.course, k.sub_course].filter(Boolean).join(" · "),
      })));
      setExpeditions((expRes.data || []).map((x: any) => ({
        id: x.id, title: x.title, subtitle: x.location,
      })));
      setLoading(false);
    };
    fetchAll();
  }, [selectedCollege, user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-4 py-8">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            CampusHub
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Your one-stop campus platform — trade, discover events, recover lost items, access study materials, and explore adventures.
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            Showing results for <span className="text-foreground">{selectedCollege}</span>
          </p>
        </section>

        {loading ? (
          <PageSpinner />
        ) : (
          <FadeIn className="space-y-12">
            <SectionCarousel
              title="Trade"
              viewAllLink="/trade"
              items={trade}
              renderCard={(item) => (
                <Link to={`/product/${item.id}`} className="block">
                  <div className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
                    {item.imageUrl ? (
                      <div className="aspect-video bg-secondary">
                        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-secondary" />
                    )}
                    <div className="p-3">
                      <h4 className="text-sm font-medium line-clamp-1">{item.title}</h4>
                      {item.subtitle && <p className="font-display text-base font-semibold mt-1">{item.subtitle}</p>}
                    </div>
                  </div>
                </Link>
              )}
            />
            <SectionCarousel title="Events" viewAllLink="/events" items={events} />
            {user ? (
              <SectionCarousel title="Recover" viewAllLink="/recover" items={recover} />
            ) : (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold">Recover</h2>
                  <Link to="/recover" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    View All
                  </Link>
                </div>
                <div className="rounded-lg border border-border bg-card p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    <Link to="/auth" className="text-primary underline underline-offset-4 hover:text-primary/80">Sign in</Link> to browse lost & found items
                  </p>
                </div>
              </section>
            )}
            <SectionCarousel title="Knowledge Hub" viewAllLink="/knowledge" items={knowledge} />
            <SectionCarousel title="Expeditions" viewAllLink="/expeditions" items={expeditions} />
          </FadeIn>
        )}
      </main>
    </div>
  );
}
