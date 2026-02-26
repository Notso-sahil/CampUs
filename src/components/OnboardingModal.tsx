import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { COLLEGES } from "@/lib/colleges";
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

const ROLES = [
  { value: "buyer", label: "Buyer — I want to buy stuff" },
  { value: "seller", label: "Seller — I want to sell stuff" },
  { value: "both", label: "Both — Buy and sell" },
];

export default function OnboardingModal() {
  const { user, profile, refreshProfile } = useAuthContext();
  const [college, setCollege] = useState("VIPS");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isOpen = !!user && !!profile && !profile.onboarded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !college || !role) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ college_name: college, user_role: role, onboarded: true })
        .eq("user_id", user.id);
      if (error) throw error;
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

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label>Which Delhi-NCR college are you from?</Label>
            <Select value={college} onValueChange={setCollege}>
              <SelectTrigger>
                <SelectValue placeholder="Select your college" />
              </SelectTrigger>
              <SelectContent>
                {COLLEGES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
      </DialogContent>
    </Dialog>
  );
}
