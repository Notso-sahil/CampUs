import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!convs) {
        setLoading(false);
        return;
      }

      // Enrich with product titles and other user names
      const enriched = await Promise.all(
        (convs as Conversation[]).map(async (conv) => {
          const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;

          const [productRes, profileRes, unreadRes] = await Promise.all([
            supabase.from("products").select("title").eq("id", conv.product_id).maybeSingle(),
            supabase.rpc("get_display_name", { _user_id: otherId }),
            supabase.from("messages").select("id", { count: "exact", head: true })
              .eq("conversation_id", conv.id)
              .eq("read", false)
              .neq("sender_id", user.id),
          ]);

          return {
            ...conv,
            product_title: productRes.data?.title || "Unknown Product",
            other_name: (profileRes.data as string) || "User",
            unread_count: unreadRes.count || 0,
          };
        })
      );

      setConversations(enriched);
      setLoading(false);
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
