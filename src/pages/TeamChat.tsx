import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
      // Find user's team
      const { data: membership } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership) return;
      const tid = membership.team_id;
      setTeamId(tid);

      // Get team name
      const { data: team } = await supabase
        .from("teams")
        .select("name")
        .eq("id", tid)
        .maybeSingle();
      if (team) setTeamName(team.name);

      // Get member names
      const { data: members } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", tid);
      if (members) {
        const names: Record<string, string> = {};
        for (const m of members) {
          const { data: name } = await supabase.rpc("get_display_name", { _user_id: m.user_id });
          names[m.user_id] = (name as string) || "User";
        }
        setMemberNames(names);
      }

      // Fetch messages
      const { data: msgs } = await supabase
        .from("team_messages")
        .select("*")
        .eq("team_id", tid)
        .order("created_at", { ascending: true });
      setMessages((msgs as TeamMessage[]) || []);

      // Realtime
      const channel = supabase
        .channel(`team_messages:${tid}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "team_messages", filter: `team_id=eq.${tid}` },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as TeamMessage]);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
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
    await supabase.from("team_messages").insert({
      team_id: teamId,
      sender_id: user.id,
      content: trimmed,
    });
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
