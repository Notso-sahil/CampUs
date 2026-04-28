import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { MessageCircle, ArrowRight, ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  created_at: string;
  product_title?: string;
  other_name?: string;
  unread_count?: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ChatList() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const fetch_ = async () => {
      try {
        const convs = await api.get(`/api/conversations?user_id=${user.id}`);
        const arr = Array.isArray(convs) ? convs : Array.isArray(convs?.data) ? convs.data : [];
        setConversations(arr);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [user]);

  const initials = (name?: string) =>
    (name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold">Messages</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading…" : `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-xl gap-2 h-9 text-xs">
              <Link to="/trade"><ShoppingBag className="h-3.5 w-3.5" /> Browse Trade</Link>
            </Button>
          </div>
        </FadeIn>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <FadeIn>
            <div className="text-center py-24 rounded-3xl bg-secondary/20 border border-dashed border-border">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No conversations yet</h3>
              <p className="text-muted-foreground mt-2 mb-6 text-sm">
                Chat with a seller by clicking "Chat with Seller" on any product.
              </p>
              <Button asChild className="bg-primary text-primary-foreground rounded-lg gap-2 hover:bg-primary/90">
                <Link to="/trade"><ShoppingBag className="h-4 w-4" /> Browse Items</Link>
              </Button>
            </div>
          </FadeIn>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv, i) => (
              <FadeIn key={conv.id} delay={i * 40}>
                <Link
                  to={`/chat/${conv.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors active:bg-secondary/50"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {initials(conv.other_name)}
                    </div>
                    {(conv.unread_count ?? 0) > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1 shadow">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${(conv.unread_count ?? 0) > 0 ? "text-foreground" : "text-foreground/80"}`}>
                      {conv.other_name || "Unknown Seller"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.product_title || "Product"}
                      </p>
                    </div>
                  </div>

                  {/* Time + Arrow */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {timeAgo(conv.created_at)}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
