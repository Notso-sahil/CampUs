import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a password reset link." });
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email to confirm, or sign in if email confirmation is disabled." });
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (!loginError) navigate("/");
      }
    } catch (err: any) {
      const msg = err?.message?.toLowerCase?.() || "";
      const userMsg = msg.includes("invalid login") || msg.includes("invalid email") || msg.includes("password")
        ? "Invalid email or password"
        : msg.includes("already registered") ? "This email is already registered"
        : msg.includes("rate") ? "Too many attempts. Please try again later."
        : "Something went wrong. Please try again.";
      toast({ title: "Error", description: userMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={() => navigate("/")}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-border bg-card p-8 shadow-glow animate-fade-in">
        {/* Close button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-bold">
            {mode === "forgot" ? "Reset Password" : mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "forgot"
              ? "Enter your email to receive a reset link"
              : mode === "login"
              ? "Sign in to CampusHub"
              : "Join your campus community"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          )}
          <Button type="submit" className="w-full gradient-primary text-primary-foreground rounded-full" disabled={loading}>
            {loading ? "Loading..." : mode === "forgot" ? "Send Reset Link" : mode === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="text-center space-y-2 mt-6">
          {mode === "login" && (
            <button onClick={() => setMode("forgot")} className="block w-full text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
              Forgot password?
            </button>
          )}
          <p className="text-sm text-muted-foreground">
            {mode === "forgot" ? (
              <button onClick={() => setMode("login")} className="font-medium text-foreground underline underline-offset-4">Back to sign in</button>
            ) : mode === "login" ? (
              <>Don't have an account?{" "}<button onClick={() => setMode("signup")} className="font-medium text-foreground underline underline-offset-4">Sign up</button></>
            ) : (
              <>Already have an account?{" "}<button onClick={() => setMode("login")} className="font-medium text-foreground underline underline-offset-4">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
