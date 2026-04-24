import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { api } from "@/lib/api";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  college_name: string | null;
  user_role: string | null;
  onboarded: boolean;
}

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.publicMetadata?.role === "admin";

  const fetchProfile = async (userId: string) => {
    try {
      const data = await api.get(`/api/profile?user_id=${userId}`);
      // Backend may return null/empty for new users — treat as not-yet-onboarded
      if (data && typeof data === "object" && (data as any).user_id) {
        setProfile(data as Profile);
      } else {
        // New user: no profile yet — onboarding modal will trigger
        setProfile({ id: "", user_id: userId, display_name: null, college_name: null, user_role: null, onboarded: false });
      }
    } catch {
      // Network error or 404 — still show onboarding for new users
      setProfile({ id: "", user_id: userId, display_name: null, college_name: null, user_role: null, onboarded: false });
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      fetchProfile(user.id).finally(() => setLoading(false));
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, isLoaded]);

  const signOut = async () => {
    await clerkSignOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  return {
    user,
    session: null, // Clerk doesn't use sessions the same way, kept for compatibility
    profile,
    isAdmin,
    loading,
    signOut,
    refreshProfile,
  };
}