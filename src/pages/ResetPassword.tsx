import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(true);
      toast({
        title: "Reset link sent!",
        description: "Please check your inbox for instructions to reset your password.",
      });
    } catch (err: any) {
      console.error(err);
      let msg = "Failed to send password reset email. Please try again.";
      if (err.code === "auth/user-not-found") {
        msg = "No account found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[100px]" />
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10 border border-border bg-card/60 backdrop-blur-md p-8 rounded-2xl shadow-soft">
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2.5">
            <img src={logoImg} alt="CampusHub" className="h-8 w-8 object-contain" />
            <span className="text-xl font-semibold font-display">CampusHub</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            We will send a password reset link to your email.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm flex flex-col items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <p className="font-semibold">Check your email</p>
              <p className="text-xs text-muted-foreground text-center">
                We've sent a link to <strong>{email}</strong>. Follow the instructions to set your new password.
              </p>
            </div>
            <Button onClick={() => navigate("/auth")} className="w-full h-11 rounded-xl">
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 mt-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 pt-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
