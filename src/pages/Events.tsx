import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Lock, Send } from "lucide-react";
import { format } from "date-fns";
import { DUMMY_EVENTS, mergeWithDummies } from "@/lib/dummyData";
import { DUMMY_MSG } from "@/lib/dummyMessages";

interface CampusEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  college_name: string | null;
  created_at: string;
  isDummy?: boolean;
}

export default function Events() {
  const { user, isAdmin } = useAuthContext();
  const { browseCollege, userCollege } = useCollege();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/api/events?college_name=${encodeURIComponent(browseCollege || "")}`).then((resp) => {
      const respData = resp as { data?: CampusEvent[] };
      const items: CampusEvent[] = Array.isArray(resp) ? resp : (Array.isArray(respData?.data) ? respData.data : []);
      setEvents(mergeWithDummies(items, DUMMY_EVENTS as CampusEvent[], 100)); // 100 because full page
      setLoading(false);
    }).catch((error) => {
      console.error("Events fetch error:", error);
      setLoading(false);
    });
  }, [browseCollege]);

  const handleClick = (event: CampusEvent) => {
    if (event.isDummy) {
      toast({ title: DUMMY_MSG.contact, variant: "destructive" });
      return;
    }
    if (!user) {
      navigate("/auth");
      return;
    }
    setExpandedId(expandedId === event.id ? null : event.id);
  };

  const handleRequestUpload = async () => {
    if (!user) { navigate("/auth"); return; }
    const title = prompt("What event would you like to add?");
    if (!title?.trim()) return;
    try {
      await api.post("/api/upload-requests", {
        user_id: user.id,
        target_section: "events",
        title: title.trim(),
        description: "User requested to add an event.",
      });
      toast({ title: "Request submitted", description: "An admin will review your request." });
    } catch {
      toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Events</h1>
          {!isAdmin && user && (
            userCollege === browseCollege ? (
              <Button variant="outline" size="sm" onClick={handleRequestUpload} className="gap-2">
                <Send className="h-4 w-4" /> Request to Upload
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button disabled variant="outline" size="sm" className="gap-2 opacity-50">
                      <Send className="h-4 w-4" /> Request to Upload
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch back to {userCollege} to request uploads</p>
                </TooltipContent>
              </Tooltip>
            )
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No events yet</p>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {events.map((event) => (
              <div key={event.id} className="relative rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm">
                {event.isDummy && (
                  <span className="absolute top-3 right-4 z-10 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 border border-amber-300">
                    Demo Entry
                  </span>
                )}
                <button
                  onClick={() => handleClick(event)}
                  className="w-full text-left px-4 py-4 flex items-center justify-between min-h-[56px]"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-semibold pr-20">{event.title}</h3>
                    {event.event_date && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.event_date), "PPP")}
                      </p>
                    )}
                  </div>
                  {!user && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </button>

                {expandedId === event.id && user && (
                  <div className="px-6 pb-4 pt-0 border-t border-border animate-fade-in">
                    {event.description && <p className="text-sm leading-relaxed mt-3">{event.description}</p>}
                    {event.location && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {event.location}
                      </p>
                    )}
                    {event.college_name && (
                      <p className="text-xs text-muted-foreground mt-1">{event.college_name}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
