import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import AdBlock from "@/components/AdBlock";

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

export default function ChatList() {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      try {
        const convs = await api.get(`/api/conversations?user_id=${user.id}`);
        setConversations(convs || []);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-lg px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-6">Messages</h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No conversations yet</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/chat/${conv.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {conv.other_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{conv.other_name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    Re: {conv.product_title}
                  </p>
                </div>
                {(conv.unread_count ?? 0) > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {conv.unread_count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Ad Block */}
        <AdBlock slotId="5678901234" />
      </main>
    </div>
  );
}
