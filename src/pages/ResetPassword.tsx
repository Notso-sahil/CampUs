import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function ResetPassword() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[100px]" />
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10 border border-border bg-card/60 backdrop-blur-md p-8 rounded-2xl shadow-soft text-center">
        <div className="space-y-3">
          <div className="flex justify-center items-center gap-2.5">
            <img src={logoImg} alt="CampUs" className="h-8 w-8 object-contain" />
            <span className="text-xl font-semibold font-display">CampUs</span>
          </div>
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold">Password Management</h1>
          <p className="text-sm text-muted-foreground">
            CampUs uses Google Sign-In. Your password is managed entirely by Google and can be updated through your Google account settings.
          </p>
        </div>

        <a
          href="https://myaccount.google.com/security"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Manage Google Account <ExternalLink className="h-4 w-4" />
        </a>

        <button
          onClick={() => navigate("/auth")}
          className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </button>
      </div>
    </div>
  );
}
