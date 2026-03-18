// Complete list of Indian States & Union Territories with college mappings

export interface StateData {
  name: string;
  type: "state" | "ut";
  colleges: string[];
}

export const INDIAN_STATES: StateData[] = [
  // States
  { name: "Andhra Pradesh", type: "state", colleges: ["Andhra University", "Sri Venkateswara University", "JNTU Kakinada", "GITAM University", "KL University", "VIT-AP University", "Other"] },
  { name: "Arunachal Pradesh", type: "state", colleges: ["Rajiv Gandhi University", "NIT Arunachal Pradesh", "NERIST", "Other"] },
  { name: "Assam", type: "state", colleges: ["IIT Guwahati", "Gauhati University", "Tezpur University", "Cotton University", "Assam Engineering College", "Other"] },
  { name: "Bihar", type: "state", colleges: ["IIT Patna", "NIT Patna", "Patna University", "Chanakya National Law University", "AIIMS Patna", "Other"] },
  { name: "Chhattisgarh", type: "state", colleges: ["IIT Bhilai", "NIT Raipur", "Pt. Ravishankar Shukla University", "AIIMS Raipur", "Other"] },
  { name: "Goa", type: "state", colleges: ["Goa University", "NIT Goa", "BITS Pilani Goa", "Goa Medical College", "Other"] },
  { name: "Gujarat", type: "state", colleges: ["IIT Gandhinagar", "DAIICT", "NID Ahmedabad", "Gujarat University", "MS University Baroda", "PDEU", "Nirma University", "Other"] },
  { name: "Haryana", type: "state", colleges: ["NIT Kurukshetra", "BITS Pilani", "Ashoka University", "O.P. Jindal Global University", "Kurukshetra University", "MDU Rohtak", "DCRUST Murthal", "Other"] },
  { name: "Himachal Pradesh", type: "state", colleges: ["IIT Mandi", "NIT Hamirpur", "HP University Shimla", "JUIT Solan", "Other"] },
  { name: "Jharkhand", type: "state", colleges: ["IIT (ISM) Dhanbad", "NIT Jamshedpur", "BIT Mesra", "XLRI Jamshedpur", "Other"] },
  { name: "Karnataka", type: "state", colleges: ["IISc Bangalore", "IIT Dharwad", "NIT Surathkal", "Christ University", "PES University", "RV College", "BMS College", "Manipal University", "MAHE", "Other"] },
  { name: "Kerala", type: "state", colleges: ["IIT Palakkad", "NIT Calicut", "IISER Thiruvananthapuram", "CUSAT", "Kerala University", "Amrita University", "Other"] },
  { name: "Madhya Pradesh", type: "state", colleges: ["IIT Indore", "IIIT Jabalpur", "NIT Bhopal (MANIT)", "AIIMS Bhopal", "IIM Indore", "Other"] },
  { name: "Maharashtra", type: "state", colleges: ["IIT Bombay", "COEP Pune", "VJTI Mumbai", "Pune University", "Mumbai University", "BITS Pilani (Goa-campus)", "Symbiosis", "MIT Pune", "Other"] },
  { name: "Manipur", type: "state", colleges: ["NIT Manipur", "Manipur University", "Central Agricultural University", "Other"] },
  { name: "Meghalaya", type: "state", colleges: ["IIM Shillong", "NIT Meghalaya", "NEHU Shillong", "Other"] },
  { name: "Mizoram", type: "state", colleges: ["NIT Mizoram", "Mizoram University", "ICFAI Mizoram", "Other"] },
  { name: "Nagaland", type: "state", colleges: ["NIT Nagaland", "Nagaland University", "Other"] },
  { name: "Odisha", type: "state", colleges: ["IIT Bhubaneswar", "NIT Rourkela", "KIIT University", "SOA University", "Utkal University", "Other"] },
  { name: "Punjab", type: "state", colleges: ["IIT Ropar", "NIT Jalandhar", "Thapar University", "Panjab University", "Guru Nanak Dev University", "LPU", "Chitkara University", "Other"] },
  { name: "Rajasthan", type: "state", colleges: ["IIT Jodhpur", "MNIT Jaipur", "BITS Pilani", "University of Rajasthan", "LNMIIT Jaipur", "Manipal Jaipur", "Other"] },
  { name: "Sikkim", type: "state", colleges: ["NIT Sikkim", "Sikkim Manipal University", "Sikkim University", "Other"] },
  { name: "Tamil Nadu", type: "state", colleges: ["IIT Madras", "NIT Trichy", "Anna University", "VIT Vellore", "SRM University", "PSG College", "Madras University", "Loyola College", "Other"] },
  { name: "Telangana", type: "state", colleges: ["IIT Hyderabad", "IIIT Hyderabad", "NIT Warangal", "Osmania University", "BITS Hyderabad", "University of Hyderabad", "Other"] },
  { name: "Tripura", type: "state", colleges: ["NIT Agartala", "Tripura University", "ICFAI Tripura", "Other"] },
  { name: "Uttar Pradesh", type: "state", colleges: ["IIT Kanpur", "IIT BHU Varanasi", "IIIT Allahabad", "Aligarh Muslim University", "Amity University Noida", "SRM University Delhi-NCR", "Bennett University", "Shiv Nadar University", "UPES", "GL Bajaj", "Other"] },
  { name: "Uttarakhand", type: "state", colleges: ["IIT Roorkee", "GBPUAT Pantnagar", "DIT University", "UPES Dehradun", "Graphic Era University", "Other"] },
  { name: "West Bengal", type: "state", colleges: ["IIT Kharagpur", "Jadavpur University", "NIT Durgapur", "Presidency University", "IISER Kolkata", "St. Xavier's Kolkata", "Other"] },
  // Union Territories
  { name: "Andaman and Nicobar Islands", type: "ut", colleges: ["DBRAIT", "Other"] },
  { name: "Chandigarh", type: "ut", colleges: ["Panjab University Chandigarh", "PEC Chandigarh", "PGIMER Chandigarh", "Other"] },
  { name: "Dadra and Nagar Haveli and Daman and Diu", type: "ut", colleges: ["Other"] },
  { name: "Delhi", type: "ut", colleges: ["VIPS", "IIT Delhi", "DTU (Delhi Technological University)", "NSUT (Netaji Subhas University of Technology)", "IIIT Delhi", "Jamia Millia Islamia", "Delhi University (North Campus)", "Delhi University (South Campus)", "AIIMS Delhi", "Lady Shri Ram College", "St. Stephen's College", "IP University", "Ambedkar University Delhi", "JNU (Jawaharlal Nehru University)", "NIT Delhi", "IGDTUW", "Other"] },
  { name: "Jammu and Kashmir", type: "ut", colleges: ["NIT Srinagar", "University of Jammu", "University of Kashmir", "IUST", "Other"] },
  { name: "Ladakh", type: "ut", colleges: ["University of Ladakh", "Other"] },
  { name: "Lakshadweep", type: "ut", colleges: ["Other"] },
  { name: "Puducherry", type: "ut", colleges: ["Pondicherry University", "JIPMER", "NIT Puducherry", "Other"] },
];

export function getStateByName(name: string): StateData | undefined {
  return INDIAN_STATES.find((s) => s.name === name);
}

export function getStateForCollege(collegeName: string): string {
  for (const state of INDIAN_STATES) {
    if (state.colleges.includes(collegeName)) return state.name;
  }
  return "Delhi";
}

export function getCollegesForState(stateName: string): string[] {
  return getStateByName(stateName)?.colleges || ["Other"];
}
