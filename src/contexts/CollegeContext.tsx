import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { CollegeSpace } from "@/types";

interface CollegeContextType {
  userCollege: string | null;
  browseCollege: string | null;
  colleges: CollegeSpace[];
  loading: boolean;
  setBrowseCollege: (collegeName: string) => void;
}

const CollegeContext = createContext<CollegeContextType>({
  userCollege: null,
  browseCollege: null,
  colleges: [],
  loading: true,
  setBrowseCollege: () => {},
});

export function CollegeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuthContext();
  const [colleges, setColleges] = useState<CollegeSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [browseCollegeState, setBrowseCollegeState] = useState<string | null>(
    sessionStorage.getItem("browseCollege")
  );

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await api.get("/api/college-spaces");
        setColleges(Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : []);
      } catch (err) {
        console.error("Failed to fetch college spaces", err);
      }
      setLoading(false);
    };
    fetchColleges();
  }, []);

  const userCollege = profile?.college_name || null;
  const browseCollege = browseCollegeState || userCollege || "VIPS";

  const handleSetBrowseCollege = (collegeName: string) => {
    setBrowseCollegeState(collegeName);
    sessionStorage.setItem("browseCollege", collegeName);
  };

  return (
    <CollegeContext.Provider value={{
      userCollege,
      browseCollege,
      colleges,
      loading,
      setBrowseCollege: handleSetBrowseCollege
    }}>
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege() {
  return useContext(CollegeContext);
}
