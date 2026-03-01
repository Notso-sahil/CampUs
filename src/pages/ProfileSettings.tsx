import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import FadeIn from "@/components/FadeIn";

export default function ProfileSettings() {
  const { user, profile, refreshProfile } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setPhoneNumber((profile as any).phone_number || "");
    }
    if (user) {
      setEmail(user.email || "");
    }
  }, [profile, user]);

  const validatePhone = (phone: string) => {
    if (!phone) return true;
    return /^\+?[0-9]{7,15}$/.test(phone.replace(/[\s\-()]/g, ""));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (phoneNumber && !validatePhone(phoneNumber)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        phone_number: phoneNumber.trim() || null,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile updated" });
    }
    setSaving(false);
  };

  const handleUpdateEmail = async () => {
    if (!user || email === user.email) return;
    setEmailSaving(true);
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      toast({ title: "Error", description: "Failed to update email. You may need to re-authenticate.", variant: "destructive" });
    } else {
      toast({ title: "Verification sent", description: "Check your new email to confirm the change." });
    }
    setEmailSaving(false);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <FadeIn>
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <Card className="shadow-soft border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">Optional. Only visible to your team members.</p>
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground rounded-full" disabled={saving}>
                  <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Profile"}
                </Button>
              </form>

              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-display text-lg font-semibold">Email Address</h3>
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                  />
                  <p className="text-xs text-muted-foreground">Changing your email requires verification via the new address.</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handleUpdateEmail}
                  disabled={emailSaving || email === user.email}
                >
                  {emailSaving ? "Sending..." : "Update Email"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </main>
    </div>
  );
}
