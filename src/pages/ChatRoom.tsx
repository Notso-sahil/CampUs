import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, ShoppingBag, Clock, MessageCircle } from "lucide-react";
import FadeIn from "@/components/FadeIn";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [otherName, setOtherName] = useState("User");
  const [productTitle, setProductTitle] = useState("");
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchDetails = async () => {
      try {
        const convs = await api.get(`/api/conversations?user_id=${user.id}&id=${id}`);
        const arr = Array.isArray(convs) ? convs : Array.isArray(convs?.data) ? convs.data : [];
        const conv = arr.find((c: any) => c.id === id);
        if (conv) {
          setOtherName(conv.other_name || "User");
          setProductTitle(conv.product_title || "");
          setProductId(conv.product_id || "");
        }
      } catch (e) { console.error(e); }
    };

    const fetchMessages = async () => {
      try {
        const data = await api.get(`/api/messages?conversation_id=${id}`);
        setMessages(Array.isArray(data) ? data : []);
        await api.put('/api/messages', { conversation_id: id, user_id: user.id });
      } catch (e) { console.error(e); }
      setLoading(false);
    };

    fetchDetails();
    fetchMessages();
  }, [id, user]);

  useRealtimeChat(id ? `chat_signals/${id}` : null, async () => {
    if (!id || !user) return;
    try {
      const data = await api.get(`/api/messages?conversation_id=${id}`);
      setMessages(Array.isArray(data) ? data : []);
      await api.put('/api/messages', { conversation_id: id, user_id: user.id });
    } catch (e) { console.error(e); }
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
      const newMsg = await api.post("/api/messages", {
        conversation_id: id,
        sender_id: user.id,
        content: trimmed,
      });
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      inputRef.current?.focus();
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const initials = (otherName || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    /* Full viewport chat — no Navbar, so nothing competes with the keyboard */
    <div className="fixed inset-0 flex flex-col bg-background">

      {/* Chat header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card/95 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/chat")}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors tap-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{otherName}</p>
            {productTitle && (
              <div className="flex items-center gap-1 mt-0.5">
                <ShoppingBag className="h-3 w-3 text-primary flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">Re: {productTitle}</p>
              </div>
            )}
          </div>
        </div>
        {productId && (
          <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs px-3 flex-shrink-0">
            <Link to={`/product/${productId}`}>View Item</Link>
          </Button>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-none">
        {loading ? (
          <div className="flex flex-col gap-4 pt-4">
            <div className="h-10 w-2/3 rounded-2xl bg-secondary/40 animate-pulse self-start" />
            <div className="h-10 w-1/2 rounded-2xl bg-primary/20 animate-pulse self-end" />
            <div className="h-10 w-3/4 rounded-2xl bg-secondary/40 animate-pulse self-start" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const prevMsg = messages[i - 1];
            const showTime = !prevMsg || (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 300000);

            return (
              <div key={msg.id} className="space-y-1">
                {showTime && (
                  <p className="text-[10px] text-muted-foreground text-center py-1 font-medium">
                    {new Date(msg.created_at).toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-secondary-foreground rounded-tl-sm"
                  }`}>
                    <p className="leading-relaxed break-words">{msg.content}</p>
                    <p className={`text-[9px] mt-1 opacity-70 flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      <Clock className="h-2.5 w-2.5" />
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input — stays above the keyboard on mobile */}
      <div className="flex-shrink-0 px-3 py-2.5 bg-card border-t border-border pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message…"
            className="h-11 rounded-full bg-secondary/60 border-transparent focus-visible:ring-primary/30 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
            className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex-shrink-0 disabled:opacity-40"
          >
            {sending ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
