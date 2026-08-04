import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
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
import { useToast } from "@/hooks/use-toast";
import { MapPin, UserIcon } from "lucide-react";

const ROLES = [
  { value: "buyer", label: "Buyer — I want to buy stuff" },
  { value: "seller", label: "Seller — I want to sell stuff" },
  { value: "both", label: "Both — Buy and sell" },
];

export default function OnboardingModal() {
  const { user, profile, refreshProfile } = useAuthContext();
  const { colleges } = useCollege();
  const [collegeName, setCollegeName] = useState("");
  const [role, setRole] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isOpen = !!user && !!profile && !profile.onboarded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !collegeName || !role) return;
    setLoading(true);
    try {
      const selectedCollegeSpace = colleges.find(c => c.name === collegeName);
      
      const payload = {
        user_id: user.id,
        college_name: collegeName,
        college_space_id: selectedCollegeSpace ? selectedCollegeSpace.id : null,
        user_role: role,
        gender: gender,
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
          <DialogTitle className="font-display text-2xl text-center">Welcome to CampUs</DialogTitle>
          <DialogDescription className="text-center">
            Join your campus community. Tell us your college and what you're here for to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select your college</Label>
              <Select value={collegeName} onValueChange={setCollegeName}>
                <SelectTrigger className="h-12 border-border/50 bg-secondary/20 rounded-xl focus:ring-primary/20">
                  <SelectValue placeholder="Choose a college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-3">
              <Label className="text-sm font-medium">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-12 border-border/50 bg-secondary/20 rounded-xl focus:ring-primary/20">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            disabled={loading || !role || !collegeName || !gender}
          >
            {loading ? "Setting up your profile..." : "Start Exploring"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
