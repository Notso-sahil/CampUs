import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome to CampUs! 🎉", description: "You have signed in successfully." });
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        setError("Sign in cancelled.");
        setLoading(false);
        return;
      }
      if (err.code === "auth/popup-blocked") {
        setError("Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #e8edf6 0%, #dde5f4 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-gray-900">Camp</span>
            <span style={{ color: "#2563EB" }}>Us</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="space-y-6 flex-1 flex flex-col justify-center py-12">
          <div className="space-y-3">
            <h1 className="text-[2.6rem] font-extrabold text-gray-900 leading-tight tracking-tight">
              The exclusive community<br />for VIPS students
            </h1>
            <p className="text-gray-500 text-base leading-relaxed max-w-sm">
              Trade items, join teams, share study material, recover lost items, and explore campus events—all in one secure place.
            </p>
          </div>

          {/* Stats cards */}
          <div className="flex gap-4 mt-4">
            <div className="bg-white rounded-xl px-5 py-4 shadow-sm flex flex-col gap-1 flex-1">
              <span className="text-xl font-extrabold" style={{ color: "#2563EB" }}>VIPS</span>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Verified Campus</span>
            </div>
            <div className="bg-white rounded-xl px-5 py-4 shadow-sm flex flex-col gap-1 flex-1">
              <span className="text-xl font-extrabold" style={{ color: "#2563EB" }}>100%</span>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Student Focused</span>
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-xs">© {new Date().getFullYear()} CampUs</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col px-8 py-8 bg-white relative">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="self-start inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors tap-target mb-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="w-full max-w-sm space-y-7 mx-auto my-auto">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-4">
            <span className="font-bold text-xl tracking-tight">
              <span className="text-gray-900">Camp</span>
              <span style={{ color: "#2563EB" }}>Us</span>
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5 text-center">
            <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "#2563EB" }}>
              Welcome Back
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sign in to CampUs</h2>
            <p className="text-sm text-gray-400">Use your campus Google account to access your dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google button styled to match site's blue */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-12 px-6 rounded-xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            style={{
              background: loading ? "#3b6fd4" : "#2563EB",
            }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {/* Google G icon in white circle */}
                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </span>
                Continue with Google
                <ArrowRight className="h-4 w-4 ml-auto" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer" style={{ color: "#2563EB" }}>Terms of Service</span>
            {" "}and{" "}
            <span className="underline cursor-pointer" style={{ color: "#2563EB" }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
