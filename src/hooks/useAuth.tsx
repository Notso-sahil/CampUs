import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";

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
    const res = await fetch(
      `https://college-api-zeta.vercel.app/api/profile?user_id=${userId}`
    );
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    } else {
      setProfile(null);
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