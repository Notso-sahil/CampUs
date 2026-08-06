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
import { DUMMY_FEATURED, DUMMY_EVENTS, DUMMY_RECOVER, DUMMY_NOTES, mergeWithDummies } from "@/lib/dummyData";

import {
  ShoppingBag, CalendarDays, Search, BookOpen, Map,
  Users, Briefcase, ChevronRight, ArrowRight, Zap, Shield, FileText, Send
} from "lucide-react";
import { toast } from "@/hooks/use-toast";


interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isDummy?: boolean;
}

const FEATURE_LINKS = [
  { to: "/trade",          icon: <ShoppingBag className="h-5 w-5" />, label: "Trade",          desc: "Buy & sell campus items"    },
  { to: "/events",         icon: <CalendarDays className="h-5 w-5" />, label: "Events",         desc: "Campus events & workshops"  },
  { to: "/recover",        icon: <Search className="h-5 w-5" />,       label: "Lost & Found",   desc: "Report or find lost items"  },
  { to: "/knowledge",      icon: <BookOpen className="h-5 w-5" />,     label: "Notes",          desc: "Study materials & notes"    },
  { to: "/featured",       icon: <Map className="h-5 w-5" />,          label: "Featured",       desc: "Featured and highlighted items"  },
  { to: "/find-teammates", icon: <Users className="h-5 w-5" />,        label: "Teammates",      desc: "Team up for hackathons"     },
  { to: "/service",        icon: <Briefcase className="h-5 w-5" />,    label: "Peer Services",  desc: "Get academic help from peers"},
];

export default function Index() {
  const { browseCollege } = useCollege();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [trade, setTrade] = useState<CarouselItem[]>([]);
  const [events, setEvents] = useState<CarouselItem[]>([]);
  const [recover, setRecover] = useState<CarouselItem[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setSendingFeedback(true);
    try {
      await api.post("/api/admin-feedback", {
        user_id: user?.id || null,
        email: user?.primaryEmailAddress?.emailAddress || "anonymous@campus.com",
        message: feedbackMessage.trim(),
      });
      toast({ title: "Feedback Sent", description: "Thank you for your feedback!" });
      setFeedbackMessage("");
    } catch {
      toast({ title: "Error", description: "Failed to send feedback.", variant: "destructive" });
    }
    setSendingFeedback(false);
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const qs = `?college_name=${encodeURIComponent(browseCollege)}`;
        const [prodRes, evtRes, recRes, kbRes, expRes] = await Promise.all([
          api.get(`/api/products${qs}`),
          api.get(`/api/events${qs}`),
          user ? api.get(`/api/recover-items${qs}`) : Promise.resolve([]),
          api.get(`/api/knowledge-hub${qs}`),
          api.get(`/api/featured${qs}`),
        ]);

        const processItems = (resp: any) => {
          if (!resp) return [];
          return Array.isArray(resp) ? resp : (Array.isArray(resp.data) ? resp.data : []);
        };

        const realProducts = processItems(prodRes);
        const realEvents = processItems(evtRes);
        const realRecover = processItems(recRes);
        const realKnowledge = processItems(kbRes);
        const realFeatured = processItems(expRes);

        setTrade(realProducts.slice(0, 6).map((p: any) => ({
          id: p.id, title: p.title, subtitle: `₹${p.price}`, imageUrl: p.image_urls?.[0] || "",
        })));
        setEvents(mergeWithDummies(realEvents, DUMMY_EVENTS, 6));
        setRecover(mergeWithDummies(realRecover, DUMMY_RECOVER, 6));
        setKnowledge(mergeWithDummies(realKnowledge, DUMMY_NOTES, 6));
        setFeatured(mergeWithDummies(realFeatured, DUMMY_FEATURED, 6));
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

        {/* ─── Inline Feedback Widget ─────────────────────────────────────── */}
        {user && (
          <section className="container mx-auto px-4 pb-16">
            <FadeIn>
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-foreground">Help Us Improve CampUs! 🚀</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Notice a bug? Have a feature request? Let us know directly. Your feedback goes straight to the developers.
                  </p>
                </div>
                <form onSubmit={handleFeedbackSubmit} className="flex-1 w-full max-w-lg flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-2 sm:space-y-0 flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Tell us what you think..."
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button type="submit" disabled={sendingFeedback} className="h-full min-h-[40px] sm:min-h-full">
                    {sendingFeedback ? "Sending..." : <><Send className="h-4 w-4 mr-2" /> Send</>}
                  </Button>
                </form>
              </div>
            </FadeIn>
          </section>
        )}

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
                <SectionCarousel title="Featured" viewAllLink="/featured" items={featured.map((e: any) => ({
                  id: e.id, title: e.title, subtitle: e.location, imageUrl: e.imageUrl, isDummy: e.isDummy
                }))}
                  icon={<Map className="h-5 w-5" />} placeholderCategory="featured" />
              </FadeIn>

              <FadeIn delay={100}>
                <SectionCarousel title="Events" viewAllLink="/events" items={events.map((e: any) => ({
                  id: e.id, title: e.title, subtitle: e.event_date ? new Date(e.event_date).toLocaleDateString() : undefined, imageUrl: e.image_url, isDummy: e.isDummy
                }))}
                  icon={<CalendarDays className="h-5 w-5" />} placeholderCategory="events" />
              </FadeIn>

              <FadeIn delay={150}>
                {user ? (
                  <SectionCarousel title="Lost & Found" viewAllLink="/recover" items={recover.map((r: any) => ({
                    id: r.id, title: r.title, subtitle: r.where_found, imageUrl: r.image_url, isDummy: r.isDummy
                  }))}
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

              <FadeIn delay={200}>
                <SectionCarousel title="Notes & Resources" viewAllLink="/knowledge" items={knowledge.map((k: any) => ({
                  id: k.id, title: k.title, subtitle: `${k.course || ''} ${k.semester ? `Sem ${k.semester}` : ''}`.trim(), isDummy: k.isDummy
                }))}
                  icon={<BookOpen className="h-5 w-5" />} placeholderCategory="knowledge"
                  renderCard={(item) => (
                    <div className="relative rounded-lg border border-border bg-card p-4 flex gap-3 h-full items-start hover:border-primary/30 transition-colors group/card">
                      {item.isDummy && (
                        <span className="absolute top-2 right-2 z-10 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 border border-amber-300">
                          Demo
                        </span>
                      )}
                      <FileText className="h-8 w-8 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2">{item.title}</h4>
                        {item.subtitle && <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>}
                      </div>
                    </div>
                  )}
                />
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
                    <Link to="/service">Browse services</Link>
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
