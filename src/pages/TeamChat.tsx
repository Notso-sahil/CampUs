import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Users, Shield, Clock } from "lucide-react";
import FadeIn from "@/components/FadeIn";

interface TeamMessage {
  id: string;
  team_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            } catch {
              names[m.user_id] = "User";
            }
          }
          setMemberNames(names);
        }

        const fetchMsgs = async () => {
          try {
            const msgs = await api.get(`/api/team-messages?team_id=${tid}`);
            setMessages(Array.isArray(msgs) ? msgs : []);
          } catch (e) { console.error(e); }
        };
        
        await fetchMsgs();
        setLoading(false);

        const interval = setInterval(fetchMsgs, 4000);
        return () => clearInterval(interval);
      } catch (err) {
        console.error("Team chat fetch error", err);
        setLoading(false);
      }
    };

    init();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !user || !teamId) return;
    setSending(true);
    try {
      await api.post("/api/team-messages", {
        team_id: teamId,
        sender_id: user.id,
        content: trimmed,
      });
      setNewMessage("");
      const newMsgs = await api.get(`/api/team-messages?team_id=${teamId}`);
      setMessages(Array.isArray(newMsgs) ? newMsgs : []);
    } catch (err) { console.error(err); }
    setSending(false);
  };

  const getMemberColor = (id: string) => {
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return MEMBER_COLORS[hash % MEMBER_COLORS.length];
  };

  if (!teamId && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center py-20 text-center">
          <FadeIn>
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-3 tracking-tight">No Team Yet</h1>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Access team-only channels and collaborate with your teammates. Find or create a team to get started.</p>
            <Button asChild size="lg" className="gradient-primary text-primary-foreground rounded-2xl shadow-soft hover:shadow-glow transition-all gap-2 px-8">
              <Link to="/find-teammates">Find Teammates</Link>
            </Button>
          </FadeIn>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex flex-col container mx-auto max-w-2xl bg-card border-x border-border shadow-soft relative">
        
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/find-teammates")} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors md:-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <Users className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate leading-tight">{teamName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-muted-foreground font-medium">{Object.keys(memberNames).length} members online</p>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-full text-[10px] font-bold px-3 border-primary/20 hover:bg-primary/5 hover:text-primary gap-1.5">
            <Shield className="h-3 w-3" /> Team Portal
          </Button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-none">
          {loading ? (
            <div className="space-y-4">
              <div className="h-12 w-2/3 rounded-2xl bg-secondary/40 animate-pulse" />
              <div className="h-12 w-1/2 rounded-2xl bg-primary/10 animate-pulse self-end" />
              <div className="h-12 w-3/4 rounded-2xl bg-secondary/40 animate-pulse" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-muted-foreground font-medium">No messages yet. Start the conversation!</p>
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
                  <div className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-secondary text-secondary-foreground rounded-tl-none"
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
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

        {/* Message Input */}
        <div className="p-4 bg-card border-t border-border sticky bottom-0">
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-full">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message your team..."
              className="h-11 rounded-2xl bg-secondary/50 border-transparent focus-visible:ring-primary/30"
              maxLength={5000}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={sending || !newMessage.trim()} 
              className="h-11 w-11 rounded-2xl gradient-primary text-primary-foreground shadow-soft hover:shadow-glow transition-all flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
