import { createContext, useContext, useState, ReactNode } from "react";
import { getStateForCollege } from "@/lib/indian-states-colleges";

interface CollegeContextType {
  selectedCollege: string;
  selectedState: string;
  setSelectedCollege: (college: string) => void;
  setLocation: (state: string, college: string) => void;
}

const CollegeContext = createContext<CollegeContextType>({
  selectedCollege: "VIPS",
  selectedState: "Delhi",
  setSelectedCollege: () => {},
  setLocation: () => {},
});

export function CollegeProvider({ children }: { children: ReactNode }) {
  const [selectedCollege, setSelectedCollegeState] = useState(
    () => localStorage.getItem("campushub_college") || "VIPS"
  );
  const [selectedState, setSelectedState] = useState(
    () => localStorage.getItem("campushub_state") || getStateForCollege(localStorage.getItem("campushub_college") || "VIPS")
  );

  const handleSetCollege = (college: string) => {
    setSelectedCollegeState(college);
    localStorage.setItem("campushub_college", college);
    const state = getStateForCollege(college);
    setSelectedState(state);
    localStorage.setItem("campushub_state", state);
  };

  const handleSetLocation = (state: string, college: string) => {
    setSelectedState(state);
    setSelectedCollegeState(college);
    localStorage.setItem("campushub_state", state);
    localStorage.setItem("campushub_college", college);
  };

  return (
    <CollegeContext.Provider value={{ selectedCollege, selectedState, setSelectedCollege: handleSetCollege, setLocation: handleSetLocation }}>
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege() {
  return useContext(CollegeContext);
}
