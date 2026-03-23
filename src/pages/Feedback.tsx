import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle } from "lucide-react";

export default function Feedback() {
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    try {
      await api.post("/api/admin-feedback", {
        user_id: user?.id || null,
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setSent(true);
    } catch {
      toast({ title: "Error", description: "Failed to submit feedback.", variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-lg">
        <FadeIn>
          {sent ? (
            <div className="text-center py-20">
              <CheckCircle className="h-16 w-16 mx-auto text-primary mb-6" />
              <h1 className="font-display text-2xl font-bold mb-3">Thank You!</h1>
              <p className="text-muted-foreground">Your feedback has been submitted. We appreciate your input.</p>
            </div>
          ) : (
            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Send Feedback</CardTitle>
                <CardDescription>Help us improve CampusHub. Your feedback matters!</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@college.edu" maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label>Message *</Label>
                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Share your thoughts, suggestions, or report an issue..." maxLength={2000} rows={5} />
                    <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground rounded-full" disabled={sending}>
                    <Send className="h-4 w-4 mr-1" /> {sending ? "Sending..." : "Submit Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
