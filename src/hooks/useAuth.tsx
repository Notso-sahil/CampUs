import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { api } from "@/lib/api";
import type { WrappedFirebaseUser, Profile } from "@/types";

const wrapUser = (fbUser: FirebaseUser, profileRole?: string): WrappedFirebaseUser => {
  const email = fbUser.email;
  const displayName = fbUser.displayName;
  const firstName = displayName ? displayName.split(" ")[0] : (email ? email.split("@")[0] : "User");

  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email,
    displayName,
    firstName,
    primaryEmailAddress: email ? { emailAddress: email } : null,
    publicMetadata: {
      role: profileRole,
    },
  };
};

export function useAuth() {
  const [user, setUser] = useState<WrappedFirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.user_role === "admin" || user?.publicMetadata?.role === "admin";

  const fetchProfile = async (userId: string, fbUser: FirebaseUser) => {
    try {
      const data = await api.get(`/api/profile?user_id=${userId}`);
      if (data && typeof data === "object" && (data as any).user_id) {
        const prof = data as Profile;
        setProfile(prof);
        setUser(wrapUser(fbUser, prof.user_role || undefined));
      } else {
        // New user — trigger onboarding modal
        setProfile({ id: "", user_id: userId, display_name: null, college_name: null, college_space_id: null, user_role: null, onboarded: false });
        setUser(wrapUser(fbUser));
      }
    } catch {
      // Network/server error — still let onboarding show so user isn't stuck
      setProfile({ id: "", user_id: userId, display_name: null, college_name: null, college_space_id: null, user_role: null, onboarded: false });
      setUser(wrapUser(fbUser));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        await fetchProfile(fbUser.uid, fbUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
      }
    } catch (e) {
      console.warn("Token revocation failed (non-blocking):", e);
    }
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) return;
    await fetchProfile(fbUser.uid, fbUser);
  };

  return {
    user,
    session: null, // compatibility with existing pages
    profile,
    isAdmin,
    loading,
    signOut,
    refreshProfile,
  };
}