import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
export interface WrappedFirebaseUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  primaryEmailAddress: {
    emailAddress: string;
  } | null;
  publicMetadata: {
    role?: string;
  };
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  college_name: string | null;
  user_role: string | null;
  onboarded: boolean;
}

interface AuthContextType {
  user: WrappedFirebaseUser | null | undefined;
  session: null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}