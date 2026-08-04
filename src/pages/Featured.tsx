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
import { DUMMY_FEATURED, mergeWithDummies } from "@/lib/dummyData";
import { DUMMY_MSG } from "@/lib/dummyMessages";

interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  event_date?: string | null;
  location: string | null;
  college_name: string | null;
  created_at: string;
  isDummy?: boolean;
  imageUrl?: string;
}

export default function Featured() {
  const { user, isAdmin } = useAuthContext();
  const { browseCollege, userCollege } = useCollege();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/api/featured?college_name=${encodeURIComponent(browseCollege)}`).then((resp) => {
      let items: FeaturedItem[] = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []);
      setFeatured(mergeWithDummies(items, DUMMY_FEATURED as FeaturedItem[], 100)); // 100 for full page view
      setLoading(false);
    }).catch((error) => {
      console.error("Featured fetch error:", error);
      setLoading(false);
    });
  }, [browseCollege]);

  const handleClick = (feat: FeaturedItem) => {
    if (feat.isDummy) {
      toast({ title: DUMMY_MSG.contact, variant: "destructive" });
      return;
    }
    if (!user) { navigate("/auth"); return; }
    setExpandedId(expandedId === feat.id ? null : feat.id);
  };

  const handleRequestUpload = async () => {
    if (!user) { navigate("/auth"); return; }
    const title = prompt("What featured item would you like to add?");
    if (!title?.trim()) return;
    try {
      await api.post("/api/upload-requests", {
        user_id: user.id,
        target_section: "featured",
        title: title.trim(),
        description: "User requested to add a featured item.",
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
          <h1 className="font-display text-3xl font-bold">Featured</h1>
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
        ) : featured.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No featured items yet</p>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {featured.map((feat) => (
              <div key={feat.id} className="relative rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm">
                {feat.isDummy && (
                  <span className="absolute top-3 right-4 z-10 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 border border-amber-300">
                    Demo Entry
                  </span>
                )}
                {feat.imageUrl && (
                  <div className="w-full h-48 bg-secondary overflow-hidden">
                    <img src={feat.imageUrl} alt={feat.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <button
                  onClick={() => handleClick(feat)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-semibold pr-20">{feat.title}</h3>
                    {feat.event_date && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(feat.event_date), "PPP")}
                      </p>
                    )}
                  </div>
                  {!user && !feat.isDummy && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </button>

                {expandedId === feat.id && user && (
                  <div className="px-6 pb-5 pt-2 border-t border-border mt-2 animate-accordion-down">
                    <p className="text-sm text-foreground mb-4 leading-relaxed whitespace-pre-wrap">{feat.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {feat.location && (
                        <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {feat.location}</div>
                      )}
                    </div>
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
