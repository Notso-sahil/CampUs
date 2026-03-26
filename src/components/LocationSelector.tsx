import { useState, useMemo, useEffect, useRef } from "react";
import { useCollege } from "@/contexts/CollegeContext";
import { api } from "@/lib/api";
import { MapPin, Search, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import FadeIn from "@/components/FadeIn";
import { filterCollegesWithAcronym } from "@/lib/collegeSearch";

export default function LocationSelector() {
  const { selectedCollege, selectedState, setLocation } = useCollege();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"state" | "college">("state");
  const [pickedState, setPickedState] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(false);

  // Fetch states once on mount
  useEffect(() => {
    setLoadingStates(true);
    api.get("/api/states")
      .then((data) => setStates(data))
      .catch(() => console.error("Failed to load states"))
      .finally(() => setLoadingStates(false));
  }, []);

  // Fetch colleges with search-as-you-type (debounced)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!pickedState) return;
    
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
  }, [pickedState, collegeSearch]);

  const filteredStates = useMemo(() => {
    const q = stateSearch.toLowerCase().trim();
    if (!q) return states;
    return states.filter((s) => s.toLowerCase().includes(q));
  }, [stateSearch, states]);

  const filteredColleges = useMemo(() => {
    // No client-side filtering needed - API handles the search
    return colleges;
  }, [colleges]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setStep("state");
      setPickedState("");
      setStateSearch("");
      setCollegeSearch("");
      setColleges([]);
    }
  };

  const handleStateSelect = (state: string) => {
    setPickedState(state);
    setCollegeSearch("");
    setStep("college");
  };

  const handleCollegeSelect = (college: string) => {
    setLocation(pickedState, college);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-secondary/50 hover:bg-secondary/80 transition-colors text-xs font-medium text-foreground max-w-[140px] sm:max-w-[180px] truncate">
          <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="truncate">{selectedCollege}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="font-display text-lg">
            {step === "state" ? "Select State / UT" : (
              <button
                onClick={() => { setStep("state"); setPickedState(""); setStateSearch(""); }}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                {pickedState}
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={step === "state" ? "Search states..." : "Type to search colleges..."}
              value={step === "state" ? stateSearch : collegeSearch}
              onChange={(e) => step === "state" ? setStateSearch(e.target.value) : setCollegeSearch(e.target.value)}
              className="pl-9 bg-secondary/40 border-0 rounded-lg focus-visible:ring-1"
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="max-h-[50vh]">
          {step === "state" ? (
            <div className="px-2 pb-4">
              {loadingStates && <p className="text-center text-sm text-muted-foreground py-8">Loading states...</p>}
              {!loadingStates && filteredStates.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No states found</p>
              )}
              {filteredStates.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStateSelect(s)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left text-foreground hover:bg-primary/10 hover:text-primary"
                >
                  <span>{s}</span>
                </button>
              ))}
            </div>
          ) : (
            <FadeIn>
              <div className="px-2 pb-4">
                {loadingColleges && <p className="text-center text-sm text-muted-foreground py-8">Loading colleges...</p>}
                {!loadingColleges && filteredColleges.length === 0 && collegeSearch.trim() && (
                  <p className="text-center text-sm text-muted-foreground py-8">No colleges found</p>
                )}
                {!loadingColleges && filteredColleges.length === 0 && !collegeSearch.trim() && (
                  <p className="text-center text-sm text-muted-foreground py-8">Type to search colleges...</p>
                )}
                {filteredColleges.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCollegeSelect(c)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left text-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </FadeIn>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}