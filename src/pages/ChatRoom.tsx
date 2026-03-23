import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    // Fetch conversation details
    const fetchDetails = async () => {
      try {
        const convs = await api.get(`/api/conversations?user_id=${user.id}`);
        const conv = convs?.find((c: any) => c.id === id);
        if (!conv) return;
        setOtherName(conv.other_name || "User");
        setProductTitle(conv.product_title || "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchDetails();

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const data = await api.get(`/api/messages?conversation_id=${id}`);
        setMessages((data as Message[]) || []);
        
        // Mark unread messages as read
        await api.put('/api/messages', { conversation_id: id, user_id: user.id });
      } catch (e) {
        console.error(e);
      }
    };
    fetchMessages();
  }, [id, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const MAX_MESSAGE_LENGTH = 5000;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !user || !id) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) return;
    setSending(true);
    try {
      const newMsg = await api.post("/api/messages", {
        conversation_id: id,
        sender_id: user.id,
        content: trimmed,
      });
      setMessages((prev) => [...prev, newMsg]);
    } catch (e) {
      console.error(e);
    }
    setNewMessage("");
    setSending(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-4">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-border py-4">
          <button onClick={() => navigate("/chat")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold">{otherName}</p>
            {productTitle && (
              <p className="text-xs text-muted-foreground">Re: {productTitle}</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-border py-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {newMessage.length > MAX_MESSAGE_LENGTH * 0.9 && (
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {newMessage.length}/{MAX_MESSAGE_LENGTH}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
