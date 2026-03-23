import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={() => navigate("/")}
      />

      {/* Modal */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={() => navigate("/")}
          className="self-end mb-2 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {mode === "login" ? (
          <SignIn
            routing="hash"
            afterSignInUrl="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "rounded-2xl border border-border bg-card shadow-glow",
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
                card: "rounded-2xl border border-border bg-card shadow-glow",
              },
            }}
          />
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="font-medium text-foreground underline underline-offset-4">
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => setMode("login")} className="font-medium text-foreground underline underline-offset-4">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
