import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { openUserProfile } = useClerk();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      openUserProfile();
      navigate("/"); // Redirect to home after opening profile
    }
  }, [isSignedIn, navigate, openUserProfile]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-center bg-card p-8 rounded-2xl border border-border shadow-soft">
          <h1 className="font-display text-3xl font-bold">Password Management</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Authentication is now handled securely through our modern provider. 
            If you need to reset or update your password, please sign in to manage it from your Profile Settings, 
            or use the "Forgot Password" option during the sign-in flow.
          </p>
          <Button onClick={() => navigate("/auth")} className="w-full gradient-primary text-primary-foreground rounded-full h-11">
            Go to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
