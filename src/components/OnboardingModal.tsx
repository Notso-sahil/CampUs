import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { MapPin } from "lucide-react";

const ROLES = [
  { value: "buyer", label: "Buyer — I want to buy stuff" },
  { value: "seller", label: "Seller — I want to sell stuff" },
  { value: "both", label: "Both — Buy and sell" },
];

export default function OnboardingModal() {
  const { user, profile, refreshProfile } = useAuthContext();
  const [college] = useState("VIPS");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isOpen = !!user && !!profile && !profile.onboarded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !college || !role) return;
    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        college_name: college,
        user_role: role,
        onboarded: true,
      };

      // Step 1: Create profile if it doesn't exist (POST ignores 'onboarded' field)
      try {
        await api.post("/api/profile", payload);
      } catch {
        // Profile might already exist — that's fine
      }

      // Step 2: Always PUT to set onboarded=true (POST doesn't set it)
      await api.put("/api/profile", payload);

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
          <DialogTitle className="font-display text-2xl text-center">Welcome to CampusHub</DialogTitle>
          <DialogDescription className="text-center">
            Join the VIPS campus community. Tell us what you're here for to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-xl space-y-2 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</span>
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">Delhi Hub</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">VIPS, Delhi</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">Vivekananda Institute of Professional Studies</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">What are you here for?</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-12 border-border/50 bg-secondary/20 rounded-xl focus:ring-primary/20">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            disabled={loading || !role}
          >
            {loading ? "Setting up your profile..." : "Start Exploring VIPS Hub"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
