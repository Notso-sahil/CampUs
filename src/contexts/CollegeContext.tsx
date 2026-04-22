import { createContext, useContext, useState, ReactNode } from "react";

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
  // Hardcoded to VIPS and Delhi as per user request
  const selectedCollege = "VIPS";
  const selectedState = "Delhi";

  const handleSetCollege = (_college: string) => {
    // Disabled: only VIPS allowed
  };

  const handleSetLocation = (_state: string, _college: string) => {
    // Disabled: only Delhi and VIPS allowed
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
