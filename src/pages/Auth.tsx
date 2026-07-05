import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">


      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <img src={logoImg} alt="CampusHub" className="h-7 w-7 object-contain" />
          <span className="text-base font-semibold">
            CampusHub
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
          <p className="text-xs text-muted-foreground font-medium">
            {mode === "login" ? "Welcome back" : "Join the community"}
          </p>
          <h1 className="text-2xl font-bold">
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
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "rounded-lg border border-border bg-card shadow-sm w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "rounded-lg border border-border bg-card shadow-sm w-full",
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
