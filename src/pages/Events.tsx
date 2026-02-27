import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Lock, Send } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  college_name: string | null;
  created_at: string;
}

export default function Events() {
  const { user, isAdmin } = useAuthContext();
  const { selectedCollege } = useCollege();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error("Events fetch error:", error);
        let items = (data as Event[]) || [];
        const college = items.filter((e) => e.college_name === selectedCollege);
        const other = items.filter((e) => e.college_name !== selectedCollege);
        setEvents([...college, ...other]);
        setLoading(false);
      });
  }, [selectedCollege]);

  const handleClick = (id: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const handleRequestUpload = async () => {
    if (!user) { navigate("/auth"); return; }
    const title = prompt("What event would you like to add?");
    if (!title?.trim()) return;
    const { error } = await supabase.from("upload_requests").insert({
      user_id: user.id,
      target_section: "events",
      title: title.trim(),
      description: "User requested to add an event.",
    });
    if (error) {
      toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
    } else {
      toast({ title: "Request submitted", description: "An admin will review your request." });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">Events</h1>
          {!isAdmin && user && (
            <Button variant="outline" size="sm" onClick={handleRequestUpload} className="gap-2">
              <Send className="h-4 w-4" /> Request to Upload
            </Button>
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
              <div key={event.id} className="rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm">
                <button
                  onClick={() => handleClick(event.id)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-semibold">{event.title}</h3>
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
