import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary-glow/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <img src={logoImg} alt="CampusHub" className="h-7 w-7 object-contain" />
          <span className="font-display text-lg font-bold">
            Campus<span className="text-primary">Hub</span>
          </span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
        {/* Title above Clerk widget */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            {mode === "login" ? "Welcome back" : "Join the community"}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {mode === "login" ? "Sign in to CampusHub" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Access your campus marketplace, chats & more"
              : "Join VIPS students on the campus platform"}
          </p>
        </div>

        {/* Clerk widget */}
        <div className="w-full max-w-sm">
          {mode === "login" ? (
            <SignIn
              routing="hash"
              afterSignInUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "rounded-2xl border border-border bg-card shadow-glow w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              afterSignUpUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "rounded-2xl border border-border bg-card shadow-glow w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                },
              }}
            />
          )}
        </div>

        {/* Toggle */}
        <p className="text-sm text-muted-foreground text-center pb-8">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="font-bold text-primary hover:underline underline-offset-4 transition-colors"
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-bold text-primary hover:underline underline-offset-4 transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
