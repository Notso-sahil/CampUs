export const COURSES = [
  { value: "BBA", label: "BBA" },
  { value: "BALLB", label: "BA LLB" },
  { value: "BBALLB", label: "BBA LLB" },
  { value: "BAJMC", label: "BA JMC" },
  { value: "BTECH", label: "B.Tech", subCourses: ["CSE", "AIDS", "AIML", "CSAM", "IOT", "VLSI"] },
  { value: "BCA", label: "BCA" },
  { value: "MCA", label: "MCA" },
  { value: "MBA", label: "MBA" },
] as const;

export type CourseValue = (typeof COURSES)[number]["value"];
