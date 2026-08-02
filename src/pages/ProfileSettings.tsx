import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Save, User, Mail, Phone, ShieldCheck,
  MapPin, ExternalLink, School
} from "lucide-react";

export default function ProfileSettings() {
  const { user, profile, refreshProfile } = useAuthContext();
  const { colleges } = useCollege();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setPhoneNumber((profile as any).phone_number || "");
      setCollegeName(profile.college_name || "");
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
    try {
      const selectedCollegeSpace = colleges.find(c => c.name === collegeName);
      
      await api.put("/api/profile", {
        user_id: user.id,
        display_name: displayName.trim() || null,
        phone_number: phoneNumber.trim() || null,
        college_name: collegeName || null,
        college_space_id: selectedCollegeSpace ? selectedCollegeSpace.id : null,
      });
      await refreshProfile();
      toast({ title: "✅ Profile updated!", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
    }
    setSaving(false);
  };



  if (!user) {
    navigate("/auth");
    return null;
  }

  const initials = (profile?.display_name || user.firstName || user.email || "?")
    .split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl">
        <FadeIn>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors tap-target"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

          {/* Avatar + Identity */}
          <div className="rounded-2xl border border-border bg-card shadow-soft p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-lg truncate">{profile?.display_name || user.firstName || "New User"}</p>
                <p className="text-sm text-muted-foreground truncate">{email}</p>
                {profile?.college_name && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                    <MapPin className="h-3 w-3" />{profile.college_name}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Display Name
                </Label>
                <Input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone Number
                </Label>
                <Input
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  maxLength={20}
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Optional. Only shared with your team members.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <School className="h-3.5 w-3.5" /> My College
                </Label>
                <Select value={collegeName} onValueChange={setCollegeName}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">You can only post and interact in your home college.</p>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors gap-2"
              >
                {saving
                  ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Save className="h-4 w-4" /> Save Changes</>
                }
              </Button>
            </form>
          </div>

          {/* Email section */}
          <div className="rounded-2xl border border-border bg-card shadow-soft p-6 mb-6">
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Email Address
            </h3>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border text-sm font-medium truncate mb-3">
              {email || "No email set"}
            </div>
            <p className="text-xs text-muted-foreground">
              Your registered email address is managed via Firebase Authentication securely.
            </p>
          </div>

          {/* Security section */}
          <div className="rounded-2xl border border-border bg-card shadow-soft p-6">
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Security
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              CampUs uses Google Sign-In. Your password and account security is managed directly through your Google account.
            </p>
            <a
              href="https://myaccount.google.com/security"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-sm font-medium transition-colors"
            >
              Manage Google Account Security <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
