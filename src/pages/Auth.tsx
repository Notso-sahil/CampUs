import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast({
        title: "Welcome back!",
        description: "You have signed in successfully.",
      });
      navigate("/");
    } catch (err: any) {
      console.error(err);
      let msg = "Failed to sign in. Please check your credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Incorrect email or password.";
      } else if (err.code === "auth/user-not-found") {
        msg = "No account found with this email.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });
      }
      toast({
        title: "Account created!",
        description: "Welcome to CampusHub!",
      });
      navigate("/");
    } catch (err: any) {
      console.error(err);
      let msg = "Failed to create account. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        msg = "An account already exists with this email address.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password must be at least 6 characters.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden md:flex-row">
      {/* Visual side panel - hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden items-center justify-center p-12 border-r border-border">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-primary/30 blur-[120px]" />
        </div>
        <div className="max-w-md space-y-6 relative z-10 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="CampusHub" className="h-12 w-12 object-contain" />
            <span className="text-3xl font-display font-bold tracking-tight">
              Campus<span className="text-primary">Hub</span>
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
            The exclusive community for VIPS students
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Trade items, join teams, share study material, recover lost items, and explore campus events—all in one secure place.
          </p>
          <div className="pt-6 border-t border-border/60 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
              <p className="text-2xl font-bold text-primary">VIPS</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Verified Campus</p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Student Focused</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forms panel */}
      <div className="flex-1 flex flex-col justify-between min-h-screen py-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 md:hidden"
          >
            <img src={logoImg} alt="CampusHub" className="h-7 w-7 object-contain" />
            <span className="text-base font-semibold">CampusHub</span>
          </button>
          <div className="hidden md:block" /> {/* Spacer */}
          <button
            onClick={() => navigate("/")}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main Content Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-sm w-full mx-auto gap-6">
          <div className="text-center space-y-2 w-full">
            <p className="text-xs uppercase tracking-widest text-primary font-bold">
              {mode === "login" ? "Welcome back" : "Get started"}
            </p>
            <h1 className="text-3xl font-bold font-display">
              {mode === "login" ? "Sign in to CampusHub" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Enter your details to access your account"
                : "Join the community of student peers"}
            </p>
          </div>

          {error && (
            <div className="w-full p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="w-full space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>
            )}

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
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-medium mt-2 bg-primary hover:bg-primary/95 text-white gap-2 transition-all flex items-center justify-center shadow-lg hover:shadow-primary/25"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              ) : (
                <>Sign Up <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          {/* Toggle login/signup mode */}
          <p className="text-sm text-muted-foreground text-center">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="font-bold text-primary hover:underline underline-offset-4 transition-colors"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="font-bold text-primary hover:underline underline-offset-4 transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground px-6 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
