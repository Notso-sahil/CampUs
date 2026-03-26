import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { filterCollegesWithAcronym } from "@/lib/collegeSearch";

const ROLES = [
  { value: "buyer", label: "Buyer — I want to buy stuff" },
  { value: "seller", label: "Seller — I want to sell stuff" },
  { value: "both", label: "Both — Buy and sell" },
];

export default function OnboardingModal() {
  const { user, profile, refreshProfile } = useAuthContext();
  const [step, setStep] = useState<"state" | "college">("state");
  const [pickedState, setPickedState] = useState("");
  const [college, setCollege] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // State selection
  const [states, setStates] = useState<string[]>([]);
  const [stateSearch, setStateSearch] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);

  // College selection
  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [loadingColleges, setLoadingColleges] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isOpen = !!user && !!profile && !profile.onboarded;

  // Fetch states once on mount
  useEffect(() => {
    if (!isOpen) return;
    setLoadingStates(true);
    api.get("/api/states")
      .then((data) => setStates(data))
      .catch(() => console.error("Failed to load states"))
      .finally(() => setLoadingStates(false));
  }, [isOpen]);

  // Fetch colleges with search-as-you-type (debounced)
  useEffect(() => {
    if (!pickedState || step !== "college") return;
    
    const query = collegeSearch.trim();
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // If no search query, show empty list
    if (!query) {
      setColleges([]);
      setLoadingColleges(false);
      return;
    }
    
    // Set loading state immediately
    setLoadingColleges(true);
    
    // Debounce the API call by 300ms
    debounceTimerRef.current = setTimeout(() => {
      api.get(`/api/colleges?state=${encodeURIComponent(pickedState)}&search=${encodeURIComponent(query)}`)
        .then((data) => {
          const apiColleges = data.map((c: any) => c.name);
          // Apply acronym matching on frontend
          const filtered = filterCollegesWithAcronym(apiColleges, apiColleges, query);
          setColleges(filtered);
        })
        .catch(() => console.error("Failed to load colleges"))
        .finally(() => setLoadingColleges(false));
    }, 300);
    
    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [pickedState, collegeSearch, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !college || !role) return;
    setLoading(true);
    try {
      await api.put("/api/profile", {
        user_id: user.id,
        college_name: college,
        user_role: role,
        onboarded: true,
      });
      await refreshProfile();
    } catch {
      toast({ title: "Error", description: "Failed to save. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Welcome to CampusHub</DialogTitle>
          <DialogDescription>
            Tell us about yourself so we can personalize your experience.
          </DialogDescription>
        </DialogHeader>

        {step === "state" ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Select your state/UT</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search states..."
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <ScrollArea className="max-h-[300px]">
              <div className="space-y-1">
                {loadingStates && <p className="text-center text-sm text-muted-foreground py-8">Loading states...</p>}
                {!loadingStates && states.filter(s => 
                  s.toLowerCase().includes(stateSearch.toLowerCase().trim())
                ).length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">No states found</p>
                )}
                {!loadingStates && states
                  .filter(s => s.toLowerCase().includes(stateSearch.toLowerCase().trim()))
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setPickedState(s);
                        setStep("college");
                        setCollegeSearch("");
                        setColleges([]);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select your college</Label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("state");
                    setPickedState("");
                    setCollegeSearch("");
                    setColleges([]);
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronRight className="h-3 w-3 rotate-180" />
                  {pickedState}
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type to search your college..."
                  value={collegeSearch}
                  onChange={(e) => setCollegeSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            {/* College list */}
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-1">
                {loadingColleges && <p className="text-center text-sm text-muted-foreground py-4">Loading...</p>}
                {!loadingColleges && colleges.length === 0 && collegeSearch.trim() && (
                  <p className="text-center text-sm text-muted-foreground py-4">No colleges found</p>
                )}
                {!loadingColleges && colleges.length === 0 && !collegeSearch.trim() && (
                  <p className="text-center text-sm text-muted-foreground py-4">Type to search your college...</p>
                )}
                {colleges.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCollege(c)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-primary/10 hover:text-primary ${
                      college === c ? 'bg-primary/20 text-primary font-medium' : ''
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </ScrollArea>

            {college && (
              <div className="pt-2 pb-1 px-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Selected:</p>
                <p className="text-sm font-medium">{college}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>What are you here for?</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !college || !role}>
              {loading ? "Saving..." : "Get Started"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
