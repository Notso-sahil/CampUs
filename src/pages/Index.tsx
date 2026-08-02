import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useCollege } from "@/contexts/CollegeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import SectionCarousel from "@/components/SectionCarousel";
import FadeIn from "@/components/FadeIn";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

import {
  ShoppingBag, CalendarDays, Search, BookOpen, Map,
  Users, Briefcase, ChevronRight, ArrowRight, Zap, Shield
} from "lucide-react";


interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

const FEATURE_LINKS = [
  { to: "/trade",          icon: <ShoppingBag className="h-5 w-5" />, label: "Trade",          desc: "Buy & sell campus items"    },
  { to: "/events",         icon: <CalendarDays className="h-5 w-5" />, label: "Events",         desc: "Campus events & workshops"  },
  { to: "/recover",        icon: <Search className="h-5 w-5" />,       label: "Lost & Found",   desc: "Report or find lost items"  },
  { to: "/knowledge",      icon: <BookOpen className="h-5 w-5" />,     label: "Notes",          desc: "Study materials & notes"    },
  { to: "/expeditions",    icon: <Map className="h-5 w-5" />,          label: "Expeditions",    desc: "Adventure & outdoor trips"  },
  { to: "/find-teammates", icon: <Users className="h-5 w-5" />,        label: "Teammates",      desc: "Team up for hackathons"     },
  { to: "/hire-peer",      icon: <Briefcase className="h-5 w-5" />,    label: "Peer Services",  desc: "Get academic help from peers"},
];

export default function Index() {
  const { browseCollege } = useCollege();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [trade, setTrade] = useState<CarouselItem[]>([]);
  const [events, setEvents] = useState<CarouselItem[]>([]);
  const [recover, setRecover] = useState<CarouselItem[]>([]);
  const [knowledge, setKnowledge] = useState<CarouselItem[]>([]);
  const [expeditions, setExpeditions] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const college = browseCollege;
      try {
        const [prodRes, evtRes, recRes, kbRes, expRes] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/events"),
          user ? api.get("/api/recover-items") : Promise.resolve([]),
          api.get("/api/knowledge-hub"),
          api.get("/api/expeditions"),
        ]);

        const processItems = (resp: any, dateField = "created_at") => {
          let arr = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : [];
          const filtered = arr.filter((x: any) => x.college_name === college);
          const src = filtered.length > 0 ? filtered : arr;
          return [...src].sort((a: any, b: any) =>
            new Date(b[dateField] || 0).getTime() - new Date(a[dateField] || 0).getTime()
          ).slice(0, 6);
        };

        setTrade(processItems(prodRes).map((p: any) => ({
          id: p.id, title: p.title, subtitle: `₹${p.price}`, imageUrl: p.image_urls?.[0] || "",
        })));
        setEvents(processItems(evtRes, "event_date").map((e: any) => ({
          id: e.id, title: e.title, subtitle: e.location, imageUrl: e.image_url || "",
        })));
        setRecover(processItems(recRes).map((r: any) => ({
          id: r.id, title: r.title, subtitle: r.where_found, imageUrl: r.image_url || "",
        })));
        setKnowledge(processItems(kbRes).map((k: any) => ({
          id: k.id, title: k.title, subtitle: [k.course, k.sub_course].filter(Boolean).join(" · "), imageUrl: "",
        })));
        setExpeditions(processItems(expRes, "event_date").map((x: any) => ({
          id: x.id, title: x.title, subtitle: x.location, imageUrl: x.image_url || "",
        })));
      } catch (err) {
        console.error("Home fetch error:", err);
      }
      setLoading(false);
    };
    fetchAll();
  }, [browseCollege, user]);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <section className="pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <FadeIn>
                <p className="text-sm text-muted-foreground mb-4">
                  {browseCollege} &middot; Campus Platform
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
                  Everything your
                  <br />
                  campus needs,{" "}
                  <span className="text-primary">one place.</span>
                </h1>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Trade items, find teammates, share notes, and connect with your campus community. No more scattered WhatsApp groups.
                </p>
              </FadeIn>

              <FadeIn delay={100}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {!user ? (
                    <Button
                      onClick={() => navigate("/auth")}
                      className="h-11 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Get started
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="h-11 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Dashboard
                    </Button>
                  )}
                  <Button variant="outline" asChild className="h-11 px-6 rounded-lg font-medium">
                    <Link to="/trade">Browse marketplace <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── Quick Links ────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-16">
          <FadeIn>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {FEATURE_LINKS.map((feat, i) => (
                <Link
                  key={feat.to}
                  to={feat.to}
                  className="group flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
                >
                  <div className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                    {feat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{feat.label}</p>
                    <p className="text-xs text-muted-foreground truncate hidden sm:block">{feat.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ─── Carousels ────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 pb-20 space-y-14">
          {loading ? (
            <div className="space-y-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 w-32 rounded bg-secondary animate-pulse" />
                  <div className="flex gap-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex-shrink-0 w-52 aspect-[4/3] rounded-lg bg-secondary/60 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <FadeIn delay={0}>
                <SectionCarousel
                  title="Marketplace"
                  viewAllLink="/trade"
                  items={trade}
                  icon={<ShoppingBag className="h-5 w-5" />}
                  placeholderCategory="trade"
                  renderCard={(item) => (
                    <Link to={`/product/${item.id}`} className="block">
                      <div className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors group/card">
                        <div className="relative aspect-video overflow-hidden">
                          <img src={item.imageUrl || ""} alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-medium line-clamp-1">{item.title}</h4>
                          {item.subtitle && <p className="text-sm font-semibold mt-1 text-primary">{item.subtitle}</p>}
                        </div>
                      </div>
                    </Link>
                  )}
                />
              </FadeIn>

              <FadeIn delay={50}>
                <SectionCarousel title="Events" viewAllLink="/events" items={events}
                  icon={<CalendarDays className="h-5 w-5" />} placeholderCategory="events" />
              </FadeIn>

              <FadeIn delay={100}>
                {user ? (
                  <SectionCarousel title="Lost & Found" viewAllLink="/recover" items={recover}
                    icon={<Search className="h-5 w-5" />} placeholderCategory="recover" />
                ) : (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Lost & Found</h2>
                      </div>
                      <Link to="/recover" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        View all <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div className="rounded-lg border border-dashed border-border p-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        <Link to="/auth" className="text-primary font-medium hover:underline">Sign in</Link>
                        {" "}to browse lost & found items
                      </p>
                    </div>
                  </section>
                )}
              </FadeIn>

              <FadeIn delay={150}>
                <SectionCarousel title="Notes & Resources" viewAllLink="/knowledge" items={knowledge}
                  icon={<BookOpen className="h-5 w-5" />} placeholderCategory="knowledge" />
              </FadeIn>

              <FadeIn delay={200}>
                <SectionCarousel title="Expeditions" viewAllLink="/expeditions" items={expeditions}
                  icon={<Map className="h-5 w-5" />} placeholderCategory="expeditions" />
              </FadeIn>
            </>
          )}
        </div>

        {/* ─── Peer Services CTA ──────────────────────────────────────── */}
        <section className="border-t border-border py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <FadeIn>
                <div className="inline-flex items-center gap-2 text-xs text-primary font-medium bg-primary/5 border border-primary/10 rounded-md px-2.5 py-1 mb-5">
                  <Briefcase className="h-3.5 w-3.5" /> Peer-to-peer services
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Need academic help?</h2>
                <p className="text-muted-foreground mb-7 leading-relaxed">
                  EG sheets, Python lab files, hardware assembly — find campus peers who can help, or start earning by offering your own skills.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild className="h-11 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Link to="/hire-peer">Browse services</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 px-6 rounded-lg font-medium">
                    <Link to="/list-peer-service">Offer your skills</Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
