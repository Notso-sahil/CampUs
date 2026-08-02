import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Users, Clock, Home } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { useToast } from "@/hooks/use-toast";

interface RoommateMessage {
  id: string;
  listing_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  display_name?: string;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const MEMBER_COLORS = [
  "text-blue-500", "text-emerald-500", "text-purple-500", "text-orange-500",
  "text-pink-500", "text-cyan-500", "text-amber-500"
];

export default function RoommateChat() {
  const { id } = useParams<{ id: string }>(); // listing_id
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<RoommateMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [listingTitle, setListingTitle] = useState("Roommate Chat");
  const [loading, setLoading] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !id) return;
    
    const init = async () => {
      try {
        // Fetch listing details
        const listingData = await api.get(`/api/roommate-listings?id=${id}`);
        const listing = (listingData as any);
        if (listing) setListingTitle(listing.title);

        const fetchMsgs = async () => {
          try {
            const msgs = await api.get(`/api/roommate-messages?listing_id=${id}`);
            setMessages(Array.isArray(msgs) ? msgs : []);
          } catch (e) { 
             console.error(e);
          }
        };

        await fetchMsgs();
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        toast({ title: "Error", description: "Failed to load chat", variant: "destructive" });
      }
    };
    init();
  }, [user, id]);

  useRealtimeChat(id ? `roommate_signals/${id}` : null, async () => {
    if (!id) return;
    try {
      const msgs = await api.get(`/api/roommate-messages?listing_id=${id}`);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (e) { 
       console.error(e);
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !user || !id) return;
    setSending(true);
    try {
      await api.post("/api/roommate-messages", { listing_id: id, sender_id: user.id, message: trimmed });
      setNewMessage("");
      const newMsgs = await api.get(`/api/roommate-messages?listing_id=${id}`);
      setMessages(Array.isArray(newMsgs) ? newMsgs : []);
      inputRef.current?.focus();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border bg-card/95 backdrop-blur-md flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/find-roommate")}
            className="h-9 w-9 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Home className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate leading-tight">{listingTitle}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3" /> Group Chat
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-none bg-secondary/10">
        {loading ? (
          <div className="flex flex-col gap-4">
            <div className="h-12 w-2/3 rounded-2xl bg-secondary/40 animate-pulse self-start" />
            <div className="h-12 w-1/2 rounded-2xl bg-primary/20 animate-pulse self-end" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Roommate Chat</h3>
            <p className="text-sm text-muted-foreground">Say hi to your potential flatmates!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user.id;
            const prevMsg = messages[i - 1];
            const showTime = !prevMsg || (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 300000);
            const showName = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id || showTime);
            
            // Generate consistent color for user
            let colorIndex = 0;
            for (let i = 0; i < msg.sender_id.length; i++) colorIndex += msg.sender_id.charCodeAt(i);
            const colorClass = MEMBER_COLORS[colorIndex % MEMBER_COLORS.length];

            return (
              <FadeIn key={msg.id}>
                <div className="space-y-1">
                  {showTime && (
                    <p className="text-[11px] text-muted-foreground text-center py-2 font-medium uppercase tracking-wider">
                      {new Date(msg.created_at).toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {showName && (
                      <span className={`text-[11px] font-semibold mb-1 ml-2 ${colorClass}`}>
                        {msg.display_name || msg.sender_id.slice(0, 8)}
                      </span>
                    )}
                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border text-foreground rounded-tl-sm"
                    }`}>
                      <p className="leading-relaxed break-words">{msg.message}</p>
                      <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${isMe ? "text-primary-foreground/70 justify-end" : "text-muted-foreground justify-start"}`}>
                        <Clock className="h-3 w-3" />
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 bg-card border-t border-border pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg z-10">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="h-12 rounded-full bg-secondary/50 border-transparent focus-visible:ring-primary/50 text-sm flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex-shrink-0 disabled:opacity-50 shadow-sm"
          >
            {sending ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5 ml-1" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
