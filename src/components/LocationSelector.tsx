import { useState, useMemo } from "react";
import { useCollege } from "@/contexts/CollegeContext";
import { INDIAN_STATES, getStateForCollege, getCollegesForState } from "@/lib/indian-states-colleges";
import { MapPin, Search, ChevronRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function LocationSelector() {
  const { selectedCollege, selectedState, setLocation } = useCollege();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"state" | "college">("state");
  const [pickedState, setPickedState] = useState(selectedState);
  const [stateSearch, setStateSearch] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");

  const filteredStates = useMemo(() => {
    const q = stateSearch.toLowerCase().trim();
    if (!q) return INDIAN_STATES;
    return INDIAN_STATES.filter((s) => s.name.toLowerCase().includes(q));
  }, [stateSearch]);

  const colleges = useMemo(() => getCollegesForState(pickedState), [pickedState]);

  const filteredColleges = useMemo(() => {
    const q = collegeSearch.toLowerCase().trim();
    if (!q) return colleges;
    return colleges.filter((c) => c.toLowerCase().includes(q));
  }, [colleges, collegeSearch]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setStep("state");
      setPickedState(selectedState);
      setStateSearch("");
      setCollegeSearch("");
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
              <button onClick={() => { setStep("state"); setStateSearch(""); }} className="flex items-center gap-1.5 hover:text-primary transition-colors">
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
              placeholder={step === "state" ? "Search states..." : "Search colleges..."}
              value={step === "state" ? stateSearch : collegeSearch}
              onChange={(e) => step === "state" ? setStateSearch(e.target.value) : setCollegeSearch(e.target.value)}
              className="pl-9 bg-secondary/40 border-0 rounded-lg focus-visible:ring-1"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="max-h-[50vh]">
          {step === "state" ? (
            <div className="px-2 pb-4">
              {filteredStates.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No states found</p>
              )}
              {filteredStates.map((s) => (
                <button
                  key={s.name}
                  onClick={() => handleStateSelect(s.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                    s.name === selectedState
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-secondary/60 text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{s.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {s.type === "ut" ? "UT" : "State"}
                    </span>
                  </span>
                  {s.name === selectedState && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-2 pb-4">
              {filteredColleges.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No colleges found</p>
              )}
              {filteredColleges.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCollegeSelect(c)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                    c === selectedCollege
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-secondary/60 text-foreground"
                  )}
                >
                  <span>{c}</span>
                  {c === selectedCollege && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
