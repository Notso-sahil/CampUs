export const COLLEGES = [
  "VIPS",
  "IIT Delhi",
  "DTU (Delhi Technological University)",
  "NSUT (Netaji Subhas University of Technology)",
  "IIIT Delhi",
  "Jamia Millia Islamia",
  "Delhi University (North Campus)",
  "Delhi University (South Campus)",
  "AIIMS Delhi",
  "Lady Shri Ram College",
  "St. Stephen's College",
  "IP University",
  "Amity University Noida",
  "SRM University Delhi-NCR",
  "Bennett University",
  "Shiv Nadar University",
  "Other",
] as const;

export type CollegeName = (typeof COLLEGES)[number];
