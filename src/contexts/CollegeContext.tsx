import { createContext, useContext, useState, ReactNode } from "react";

interface CollegeContextType {
  selectedCollege: string;
  setSelectedCollege: (college: string) => void;
}

const CollegeContext = createContext<CollegeContextType>({
  selectedCollege: "VIPS",
  setSelectedCollege: () => {},
});

export function CollegeProvider({ children }: { children: ReactNode }) {
  const [selectedCollege, setSelectedCollege] = useState(
    () => localStorage.getItem("campushub_college") || "VIPS"
  );

  const handleSet = (college: string) => {
    setSelectedCollege(college);
    localStorage.setItem("campushub_college", college);
  };

  return (
    <CollegeContext.Provider value={{ selectedCollege, setSelectedCollege: handleSet }}>
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege() {
  return useContext(CollegeContext);
}
