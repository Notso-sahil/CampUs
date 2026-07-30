import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useChatPolling } from "@/hooks/useChatPolling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Users, Clock } from "lucide-react";
import FadeIn from "@/components/FadeIn";

interface TeamMessage {
  id: string;
  team_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const MEMBER_COLORS = [
  "text-blue-500", "text-emerald-500", "text-purple-500", "text-orange-500",
  "text-pink-500", "text-cyan-500", "text-amber-500"
];

export default function TeamChat() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("Team Chat");
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      try {
        const membersData = await api.get(`/api/team-members?user_id=${user.id}`);
        const membership = (Array.isArray(membersData) ? membersData : [])[0];
        if (!membership) { setLoading(false); return; }

        const tid = membership.team_id;
        setTeamId(tid);

        const teamData = await api.get(`/api/teams?id=${tid}`);
        const team = (Array.isArray(teamData) ? teamData : [])[0];
        if (team) setTeamName(team.name);

        const members = await api.get(`/api/team-members?team_id=${tid}`);
        if (members) {
          const names: Record<string, string> = {};
          for (const m of (members as any[])) {
            try {
              const prof = await api.get(`/api/profile?user_id=${m.user_id}`);
              names[m.user_id] = (prof as any)?.display_name || "User";
            } catch { names[m.user_id] = "User"; }
          }
          setMemberNames(names);
        }

        const fetchMsgs = async () => {
          try {
            const msgs = await api.get(`/api/team-messages?team_id=${tid}`);
            setMessages(Array.isArray(msgs) ? msgs : []);
          } catch (e) { console.error(e); }
        };

        // We only fetch team and members once, then set up polling for messages outside this block.
        // Actually, the previous logic polled fetchMsgs inside this useEffect, which is fine, 
        // but we'll extract the polling part out.
        await fetchMsgs();
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    init();
  }, [teamId, user]);

  useChatPolling(async () => {
    if (!teamId) return;
    try {
      const msgs = await api.get(`/api/team-messages?team_id=${teamId}`);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (e) { console.error(e); }
  }, 4000, [teamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !user || !teamId) return;
    setSending(true);
    try {
      await api.post("/api/team-messages", { team_id: teamId, sender_id: user.id, content: trimmed });
      setNewMessage("");
      const newMsgs = await api.get(`/api/team-messages?team_id=${teamId}`);
      setMessages(Array.isArray(newMsgs) ? newMsgs : []);
      inputRef.current?.focus();
    } catch (err) { console.error(err); }
    setSending(false);
  };

  const getMemberColor = (id: string) => {
    const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return MEMBER_COLORS[hash % MEMBER_COLORS.length];
  };

  /* No team yet */
  if (!teamId && !loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background px-6 text-center">
        <FadeIn>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">No Team Yet</h1>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Join or create a team to access your team chat.
          </p>
          <Button asChild className="bg-primary text-primary-foreground rounded-lg gap-2">
            <Link to="/find-teammates">Find Teammates</Link>
          </Button>
        </FadeIn>
      </div>
    );
  }

  return (
    /* Full viewport — same pattern as ChatRoom */
    <div className="fixed inset-0 flex flex-col bg-background">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card/95 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/find-teammates")}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors tap-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{teamName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-muted-foreground">{Object.keys(memberNames).length} members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-none">
        {loading ? (
          <div className="space-y-4 pt-4">
            <div className="h-10 w-2/3 rounded-2xl bg-secondary/40 animate-pulse" />
            <div className="h-10 w-1/2 rounded-2xl bg-primary/20 animate-pulse self-end ml-auto" />
            <div className="h-10 w-3/4 rounded-2xl bg-secondary/40 animate-pulse" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const prevMsg = messages[i - 1];
            const showSender = !prevMsg || prevMsg.sender_id !== msg.sender_id;
            const senderName = memberNames[msg.sender_id] || "User";

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {showSender && !isMe && (
                  <p className={`text-[11px] font-bold mb-1 ml-1 ${getMemberColor(msg.sender_id)}`}>
                    {senderName}
                  </p>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-secondary text-secondary-foreground rounded-tl-sm"
                }`}>
                  <p className="leading-relaxed break-words">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 opacity-60 text-[9px] ${isMe ? "justify-end" : "justify-start"}`}>
                    <Clock className="h-2.5 w-2.5" />
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-3 py-2.5 bg-card border-t border-border pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Message your team…"
            className="h-11 rounded-full bg-secondary/60 border-transparent focus-visible:ring-primary/30 text-sm"
            maxLength={5000}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
            className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex-shrink-0 disabled:opacity-40"
          >
            {sending
              ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </form>
      </div>
    </div>
  );
}
