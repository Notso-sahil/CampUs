import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { DUMMY_TEAMS, mergeWithDummies } from "@/lib/dummyData";
import { DUMMY_MSG } from "@/lib/dummyMessages";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import FadeIn from "@/components/FadeIn";
import PageSpinner from "@/components/PageSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Search, Copy, UserPlus, Crown, Trash2, LogOut, ArrowRightLeft, MessageCircle, User } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string | null;
  team_code: string;
  leader_id: string;
  college_name: string | null;
  looking_for_role: string | null;
  looking_for_description: string | null;
  created_at: string;
  isDummy?: boolean;
  contact_info?: string;
  created_by?: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string | null;
  joined_at: string;
}

interface TeamRequest {
  id: string;
  team_id: string;
  user_id: string;
  message: string | null;
  status: string;
  created_at: string;
}

type View = "browse" | "create" | "my-team";

export default function FindTeammates() {
  const { user } = useAuthContext();
  const { browseCollege, userCollege } = useCollege();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [view, setView] = useState<View>("browse");
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [myMembers, setMyMembers] = useState<TeamMember[]>([]);
  const [myRequests, setMyRequests] = useState<TeamRequest[]>([]);
  const [search, setSearch] = useState("");
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  // Create form
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [myRole, setMyRole] = useState("");
  const [lookingForRole, setLookingForRole] = useState("");
  const [lookingForDesc, setLookingForDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/api/teams?college_name=${encodeURIComponent(browseCollege)}`);
      let arr: Team[] = Array.isArray(resp) ? resp : (Array.isArray((resp as any)?.data) ? (resp as any).data : []);
      setTeams(mergeWithDummies(arr, DUMMY_TEAMS as Team[], 100));
    } catch (error) {
      console.error("Teams fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (team: Team) => {
    if (team.isDummy) {
      toast({ title: DUMMY_MSG.chat, variant: "destructive" });
      return;
    }
    if (!user) { navigate("/auth"); return; }
    try {
      const conv = await api.post("/api/conversations", {
        seller_id: team.created_by,
        context_id: team.id,
        context_type: "team",
      });
      navigate(`/chat/${conv.id}`);
    } catch (error) {
      toast({ title: "Could not start chat", variant: "destructive" });
    }
  };

  const fetchData = async () => {
    await fetchTeams();
    if (user) {
      try {
        const membersData = await api.get(`/api/team-members?user_id=${user.id}`);
        const membership = membersData?.[0];

        if (membership) {
          const teamData = await api.get(`/api/teams?id=${membership.team_id}`);
          const team = teamData?.[0];
          setMyTeam(team as Team | null);

          if (team) {
            const members = await api.get(`/api/team-members?team_id=${team.id}`);
            setMyMembers((members as TeamMember[]) || []);

            if (team.leader_id === user.id) {
              const reqs = await api.get(`/api/team-requests?team_id=${team.id}`);
              setMyRequests((reqs as TeamRequest[])?.filter(r => r.status === 'pending') || []);
            }
            setView("my-team");
          }
        } else {
          const userReqs = await api.get(`/api/team-requests?user_id=${user.id}`);
          const pending = new Set<string>((userReqs || []).filter((r: any) => r.status === 'pending').map((r: any) => r.team_id as string));
          setPendingRequests(pending);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, browseCollege]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    try {
      const newTeam = await api.post("/api/teams", {
        name: teamName.trim(),
        description: teamDesc.trim() || null,
        leader_id: user.id,
        college_name: browseCollege,
        looking_for_role: lookingForRole.trim() || null,
        looking_for_description: lookingForDesc.trim() || null,
      });

      await api.post("/api/team-members", {
        team_id: newTeam.id,
        user_id: user.id,
        role: myRole.trim() || "Leader",
      });

      toast({ title: "Team created!", description: `Team code: ${newTeam.team_code}` });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message?.includes("unique") ? "Team name already taken" : "Failed to create team", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleRequestJoin = async (teamId: string) => {
    if (!user) return;
    try {
      await api.post("/api/team-requests", {
        team_id: teamId,
        user_id: user.id,
        message: "I'd like to join your team!",
      });
      setPendingRequests((prev) => new Set(prev).add(teamId));
      toast({ title: "Request sent!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message?.includes("unique") ? "You already requested this team" : "Failed to send request", variant: "destructive" });
    }
  };

  const handleAcceptRequest = async (request: TeamRequest) => {
    try {
      await api.post("/api/team-members", {
        team_id: request.team_id,
        user_id: request.user_id,
        role: "Member",
      });
      await api.put("/api/team-requests", { id: request.id, status: "accepted" });
      
      toast({ title: "Member added!" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message?.includes("unique") ? "User already in a team" : "Failed to accept", variant: "destructive" });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    await api.put("/api/team-requests", { id: requestId, status: "rejected" });
    toast({ title: "Request rejected" });
    await fetchData();
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = myMembers.find(m => m.id === memberId);
    if (!member) return;
    await api.delete(`/api/team-members?team_id=${member.team_id}&user_id=${member.user_id}`);
    toast({ title: "Member removed" });
    await fetchData();
  };

  const handleTransferLeadership = async (newLeaderId: string) => {
    if (!myTeam || !user) return;
    const confirmed = window.confirm("Warning: You will be demoted to Team Member. Continue?");
    if (!confirmed) return;

    await api.put("/api/teams", { id: myTeam.id, leader_id: newLeaderId });
    toast({ title: "Leadership transferred" });
    await fetchData();
  };

  const handleLeaveTeam = async () => {
    if (!user || !myTeam) return;
    if (myTeam.leader_id === user.id) {
      toast({ title: "Transfer leadership first", description: "You must transfer leadership before leaving.", variant: "destructive" });
      return;
    }
    await api.delete(`/api/team-members?team_id=${myTeam.id}&user_id=${user.id}`);
    toast({ title: "You left the team" });
    setMyTeam(null);
    setView("browse");
    await fetchData();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Team code: ${code}` });
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.team_code.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <FadeIn>
            <Users className="h-16 w-16 mx-auto text-primary mb-6" />
            <h1 className="font-display text-3xl font-bold mb-3">Find Teammates</h1>
            <p className="text-muted-foreground mb-6">Sign in to create or join hackathon teams.</p>
            <Button asChild className="bg-primary text-primary-foreground rounded-lg">
              <a href="/auth">Sign In</a>
            </Button>
          </FadeIn>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">
              <Users className="inline h-7 w-7 mr-2 text-primary -mt-1" />
              Find Teammates
            </h1>
            <p className="text-muted-foreground">Create or join a hackathon team</p>
          </div>
        </FadeIn>

        {loading ? (
          <PageSpinner />
        ) : myTeam && view === "my-team" ? (
          <FadeIn>
            <Card className="shadow-soft border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-2xl">{myTeam.name}</CardTitle>
                    <CardDescription>{myTeam.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => copyCode(myTeam.team_code)}>
                      <Copy className="h-4 w-4 mr-1" /> {myTeam.team_code}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {myTeam.looking_for_role && (
                  <div className="rounded-lg bg-accent p-4">
                    <p className="text-sm font-medium text-accent-foreground mb-1">Looking for: {myTeam.looking_for_role}</p>
                    {myTeam.looking_for_description && <p className="text-sm text-muted-foreground">{myTeam.looking_for_description}</p>}
                  </div>
                )}

                <div>
                  <h3 className="font-display text-lg font-semibold mb-3">Members ({myMembers.length})</h3>
                  <div className="space-y-2">
                    {myMembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center gap-2">
                          {m.user_id === myTeam.leader_id && <Crown className="h-4 w-4 text-primary" />}
                          <span className="text-sm font-medium">{m.user_id === user?.id ? "You" : m.user_id.slice(0, 8)}</span>
                          <span className="text-xs text-muted-foreground">• {m.role}</span>
                        </div>
                        {myTeam.leader_id === user?.id && m.user_id !== user?.id && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTransferLeadership(m.user_id)} title="Transfer leadership">
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveMember(m.id)} title="Remove member">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending requests (leader only) */}
                {myTeam.leader_id === user?.id && myRequests.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-3">Join Requests ({myRequests.length})</h3>
                    <div className="space-y-2">
                      {myRequests.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                          <div>
                            <span className="text-sm font-medium">{r.user_id.slice(0, 8)}</span>
                            {r.message && <p className="text-xs text-muted-foreground">{r.message}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-primary text-primary-foreground rounded-lg" onClick={() => handleAcceptRequest(r)}>Accept</Button>
                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleRejectRequest(r.id)}>Reject</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button className="bg-primary text-primary-foreground rounded-lg gap-1" onClick={() => navigate("/team-chat")}>
                    <MessageCircle className="h-4 w-4 mr-1" /> Team Chat
                  </Button>
                  {myTeam.leader_id !== user?.id && (
                    <Button variant="outline" className="rounded-full" onClick={handleLeaveTeam}>
                      <LogOut className="h-4 w-4 mr-1" /> Leave Team
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          /* BROWSE / CREATE VIEW */
          <div className="space-y-8">
            <FadeIn>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant={view === "browse" ? "default" : "outline"}
                  className="rounded-lg"
                  onClick={() => setView("browse")}
                >
                  <Search className="h-4 w-4 mr-1" /> Browse Teams
                </Button>
                {userCollege === browseCollege ? (
                  <Button
                    variant={view === "create" ? "default" : "outline"}
                    className="rounded-lg"
                    onClick={() => setView("create")}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Create Team
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button disabled variant="outline" className="rounded-lg opacity-50">
                          <Plus className="h-4 w-4 mr-1" /> Create Team
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Switch back to {userCollege} to create a team</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </FadeIn>

            {view === "create" ? (
              <FadeIn delay={100}>
                <Card className="shadow-soft border-border max-w-lg mx-auto">
                  <CardHeader>
                    <CardTitle className="font-display">Create Your Team</CardTitle>
                    <CardDescription>You'll be the team leader. Others can join using your team code.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Team Name *</Label>
                        <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} required placeholder="AI Innovators" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} placeholder="What is your team about?" />
                      </div>
                      <div className="space-y-2">
                        <Label>Your Role</Label>
                        <Input value={myRole} onChange={(e) => setMyRole(e.target.value)} placeholder="Full-Stack Dev, Designer, etc." />
                      </div>
                      <div className="space-y-2">
                        <Label>Looking For (Role)</Label>
                        <Input value={lookingForRole} onChange={(e) => setLookingForRole(e.target.value)} placeholder="ML Engineer, UI Designer..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Looking For (Details)</Label>
                        <Textarea value={lookingForDesc} onChange={(e) => setLookingForDesc(e.target.value)} placeholder="Experience with TensorFlow preferred..." />
                      </div>
                      <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-lg" disabled={creating}>
                        {creating ? "Creating..." : "Create Team"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </FadeIn>
            ) : (
              <FadeIn delay={100}>
                <div className="space-y-4">
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or team code..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 rounded-full bg-secondary/50 border-0"
                    />
                  </div>

                  {filteredTeams.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No teams found. Be the first to create one!</p>
                  ) : (
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {filteredTeams.map((team) => (
                        <Card key={team.id} className="border-border relative">
                          {team.isDummy && (
                            <span className="absolute top-3 right-4 z-10 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 border border-amber-300">
                              Demo Entry
                            </span>
                          )}
                          <CardHeader className="pb-3">
                            <CardTitle className="font-display text-lg pr-20">{team.name}</CardTitle>
                            {team.description && <CardDescription className="line-clamp-2">{team.description}</CardDescription>}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {team.looking_for_role && (
                              <div className="rounded-md bg-accent px-3 py-2">
                                <p className="text-xs font-medium text-accent-foreground">Looking for: {team.looking_for_role}</p>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                              <span className="text-xs text-muted-foreground font-mono">{team.team_code}</span>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleApply(team)}>
                                  <MessageCircle className="h-3.5 w-3.5 mr-1" /> Message
                                </Button>
                                {!team.isDummy && (
                                  pendingRequests.has(team.id) ? (
                                    <span className="text-xs text-muted-foreground font-medium px-3 py-1.5 flex items-center">Requested</span>
                                  ) : (
                                    <Button size="sm" className="bg-primary text-primary-foreground rounded-lg h-8 text-xs" onClick={() => handleRequestJoin(team.id)}>
                                      <UserPlus className="h-3.5 w-3.5 mr-1" /> Request to Join
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
