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

export interface CollegeSpace {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  created_by: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  college_name: string | null;
  college_space_id: number | null;
  user_role: string | null;
  onboarded: boolean;
}
