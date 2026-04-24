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
import { getPlaceholder } from "@/lib/placeholders";
import {
  ShoppingBag, CalendarDays, Search, BookOpen, Map,
  Users, Briefcase, ChevronRight, Sparkles, Zap, Shield
} from "lucide-react";
import logoImg from "@/assets/logo.png";

interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

const FEATURE_LINKS = [
  { to: "/trade",          icon: <ShoppingBag className="h-6 w-6" />, label: "Trade",          desc: "Buy & sell campus items",      color: "from-blue-500/20 to-indigo-500/20",  border: "border-blue-500/20"  },
  { to: "/events",         icon: <CalendarDays className="h-6 w-6" />, label: "Events",         desc: "Campus events & workshops",    color: "from-purple-500/20 to-pink-500/20",  border: "border-purple-500/20" },
  { to: "/recover",        icon: <Search className="h-6 w-6" />,       label: "Recover",        desc: "Lost & found board",           color: "from-red-500/20 to-orange-500/20",   border: "border-red-500/20"   },
  { to: "/knowledge",      icon: <BookOpen className="h-6 w-6" />,     label: "Knowledge Hub",  desc: "Study materials & notes",      color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20"},
  { to: "/expeditions",    icon: <Map className="h-6 w-6" />,          label: "Expeditions",    desc: "Adventure & outdoor trips",    color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/20" },
  { to: "/find-teammates", icon: <Users className="h-6 w-6" />,        label: "Find Teammates", desc: "Team up for hackathons",       color: "from-sky-500/20 to-cyan-500/20",     border: "border-sky-500/20"   },
  { to: "/hire-peer",      icon: <Briefcase className="h-6 w-6" />,    label: "Hire a Peer",    desc: "Expert academic help",         color: "from-violet-500/20 to-fuchsia-500/20", border: "border-violet-500/20"},
];

export default function Index() {
  const { selectedCollege } = useCollege();
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
      const college = selectedCollege;
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
          id: p.id, title: p.title, subtitle: `₹${p.price}`, imageUrl: p.image_urls?.[0] || getPlaceholder("trade"),
        })));
        setEvents(processItems(evtRes, "event_date").map((e: any) => ({
          id: e.id, title: e.title, subtitle: e.location, imageUrl: e.image_url || getPlaceholder("events"),
        })));
        setRecover(processItems(recRes).map((r: any) => ({
          id: r.id, title: r.title, subtitle: r.where_found, imageUrl: r.image_url || getPlaceholder("recover"),
        })));
        setKnowledge(processItems(kbRes).map((k: any) => ({
          id: k.id, title: k.title, subtitle: [k.course, k.sub_course].filter(Boolean).join(" · "), imageUrl: getPlaceholder("knowledge"),
        })));
        setExpeditions(processItems(expRes, "event_date").map((x: any) => ({
          id: x.id, title: x.title, subtitle: x.location, imageUrl: x.image_url || getPlaceholder("expeditions"),
        })));
      } catch (err) {
        console.error("Home fetch error:", err);
      }
      setLoading(false);
    };
    fetchAll();
  }, [selectedCollege, user]);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <section className="relative pt-16 pb-20 overflow-hidden">
          {/* Ambient background */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute top-32 right-1/4 w-[400px] h-[400px] bg-primary-glow/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="h-3.5 w-3.5" /> Your Campus, Supercharged
              </div>
              <div className="flex items-center justify-center gap-4 mb-4">
                <img src={logoImg} alt="CampusHub" className="h-14 w-14 md:h-16 md:w-16 object-contain" />
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-none">
                  Campus<span className="text-primary">Hub</span>
                </h1>
              </div>
              <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                The all-in-one platform for campus life — trade, connect, learn, and thrive.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Showing for <span className="text-foreground font-semibold px-2 py-0.5 rounded-lg bg-secondary">{selectedCollege}</span>
              </p>
            </FadeIn>

            <FadeIn delay={150}>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {!user && (
                  <Button
                    onClick={() => navigate("/auth")}
                    className="h-12 px-8 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-soft hover:shadow-glow transition-shadow gap-2"
                  >
                    <Sparkles className="h-4 w-4" /> Get Started Free
                  </Button>
                )}
                <Button variant="outline" asChild className="h-12 px-6 rounded-2xl font-bold border-border hover:border-primary/40 gap-2">
                  <Link to="/trade"><ShoppingBag className="h-4 w-4" /> Browse Trade</Link>
                </Button>
              </div>
            </FadeIn>

            {/* Trust row */}
            <FadeIn delay={250}>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {[
                  { icon: <Shield className="h-3.5 w-3.5" />, label: "Verified Students" },
                  { icon: <Zap className="h-3.5 w-3.5" />,    label: "Instant Connect" },
                  { icon: <Users className="h-3.5 w-3.5" />,  label: "Campus Community" },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground border border-border/50">
                    <span className="text-primary">{b.icon}</span>{b.label}
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── Feature Grid ─────────────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-16">
          <FadeIn>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-center">Everything You Need</h2>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {FEATURE_LINKS.map((feat, i) => (
              <FadeIn key={feat.to} delay={i * 50}>
                <Link
                  to={feat.to}
                  className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border bg-gradient-to-br ${feat.color} ${feat.border} hover:shadow-soft hover:-translate-y-1 transition-all duration-300 text-center`}
                >
                  <div className="w-12 h-12 rounded-xl bg-background/60 backdrop-blur-sm flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{feat.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight hidden sm:block">{feat.desc}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ─── Carousels ────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 pb-24 space-y-16">
          {loading ? (
            <div className="space-y-12">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-7 w-40 rounded-lg bg-secondary/60 animate-pulse" />
                  <div className="flex gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex-shrink-0 w-56 aspect-[3/4] rounded-2xl bg-secondary/40 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
                      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow group/card">
                        <div className="aspect-[4/3] bg-secondary overflow-hidden">
                          <img src={item.imageUrl || getPlaceholder("trade")} alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" loading="lazy" />
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-bold line-clamp-1 group-hover/card:text-primary transition-colors">{item.title}</h4>
                          {item.subtitle && <p className="font-display text-base font-bold mt-1 text-primary">{item.subtitle}</p>}
                        </div>
                      </div>
                    </Link>
                  )}
                />
              </FadeIn>

              <FadeIn delay={100}>
                <SectionCarousel title="Events" viewAllLink="/events" items={events}
                  icon={<CalendarDays className="h-5 w-5" />} placeholderCategory="events" />
              </FadeIn>

              <FadeIn delay={200}>
                {user ? (
                  <SectionCarousel title="Recover" viewAllLink="/recover" items={recover}
                    icon={<Search className="h-5 w-5" />} placeholderCategory="recover" />
                ) : (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-primary"><Search className="h-5 w-5" /></span>
                        <h2 className="font-display text-2xl font-bold">Recover</h2>
                      </div>
                      <Link to="/recover" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        View All <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
                      <p className="text-sm text-muted-foreground">
                        <Link to="/auth" className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors">Sign in</Link>
                        {" "}to browse lost & found items
                      </p>
                    </div>
                  </section>
                )}
              </FadeIn>

              <FadeIn delay={300}>
                <SectionCarousel title="Knowledge Hub" viewAllLink="/knowledge" items={knowledge}
                  icon={<BookOpen className="h-5 w-5" />} placeholderCategory="knowledge" />
              </FadeIn>

              <FadeIn delay={400}>
                <SectionCarousel title="Expeditions" viewAllLink="/expeditions" items={expeditions}
                  icon={<Map className="h-5 w-5" />} placeholderCategory="expeditions" />
              </FadeIn>
            </>
          )}
        </div>

        {/* ─── Hire a Peer CTA ──────────────────────────────────────── */}
        <section className="border-t border-border bg-secondary/30 py-20">
          <div className="container mx-auto px-4 text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="h-3.5 w-3.5" /> New Feature
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Hire a Peer</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
                Need EG sheets done? Python lab files? Hardware assembly?
                Find verified campus experts or monetize your own skills.
              </p>
              <Button asChild className="h-12 px-10 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-soft hover:shadow-glow transition-shadow gap-2">
                <Link to="/hire-peer">Explore Marketplace <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
