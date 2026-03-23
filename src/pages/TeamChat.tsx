import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Users } from "lucide-react";

interface TeamMessage {
  id: string;
  team_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function TeamChat() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("Team Chat");
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const membersData = await api.get(`/api/team-members?user_id=${user.id}`);
        const membership = (membersData as any[])?.[0];
        if (!membership) return;
        
        const tid = membership.team_id;
        setTeamId(tid);

        const teamData = await api.get(`/api/teams?id=${tid}`);
        const team = (teamData as any[])?.[0];
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

        const msgs = await api.get(`/api/team-messages?team_id=${tid}`);
        setMessages((msgs as TeamMessage[]) || []);
        
        // Polling as a fallback for realtime removal
        const interval = setInterval(async () => {
          const newMsgs = await api.get(`/api/team-messages?team_id=${tid}`);
          setMessages((newMsgs as TeamMessage[]) || []);
        }, 3000);

        return () => clearInterval(interval);
      } catch (err) {
        console.error("Team chat fetch error", err);
      }
    };

    init();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const MAX_LENGTH = 5000;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !user || !teamId) return;
    if (trimmed.length > MAX_LENGTH) return;
    setSending(true);
    try {
      await api.post("/api/team-messages", {
        team_id: teamId,
        sender_id: user.id,
        content: trimmed,
      });
      // Fetch immediately to update UI without waiting for interval
      const newMsgs = await api.get(`/api/team-messages?team_id=${teamId}`);
      setMessages((newMsgs as TeamMessage[]) || []);
    } catch (err) {
      console.error(err);
    }
    setNewMessage("");
    setSending(false);
  };

  if (!teamId && !sending) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <Users className="h-16 w-16 mx-auto text-primary mb-6" />
          <h1 className="font-display text-2xl font-bold mb-3">No Team Yet</h1>
          <p className="text-muted-foreground mb-6">Join or create a team to access Team Chat.</p>
          <Button onClick={() => navigate("/find-teammates")} className="gradient-primary text-primary-foreground rounded-full">
            Find Teammates
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-4">
        <div className="flex items-center gap-3 border-b border-border py-4">
          <button onClick={() => navigate("/find-teammates")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold">{teamName}</p>
            <p className="text-xs text-muted-foreground">Team Chat · {Object.keys(memberNames).length} members</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {!isMe && (
                    <p className="text-xs font-medium mb-0.5 opacity-70">
                      {memberNames[msg.sender_id] || msg.sender_id.slice(0, 8)}
                    </p>
                  )}
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-border py-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message your team..."
              className="flex-1"
              maxLength={MAX_LENGTH}
            />
            <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
