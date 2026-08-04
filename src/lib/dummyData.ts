export interface FeaturedItem {
  id: string;
  title: string;
  location: string;
  event_date: string;
  imageUrl: string;
  description: string;
  isDummy: boolean;
  college_name: null;
}

export const DUMMY_FEATURED: FeaturedItem[] = [
  { id: "dummy-feat-1", title: "Manali Snow Trek", location: "Manali, HP", event_date: "2026-01-15", imageUrl: "/dummy/manali-snow-trek.png", description: "A guided 5-day trek through the snow-capped Himalayan peaks. Experience the thrill of snow camping and breathtaking views.", isDummy: true, college_name: null },
  { id: "dummy-feat-2", title: "Coorg Camping Weekend", location: "Coorg, Karnataka", event_date: "2026-02-08", imageUrl: "/dummy/coorg-camping.png", description: "A serene camping experience amidst the coffee plantations and misty hills of Coorg.", isDummy: true, college_name: null },
  { id: "dummy-feat-3", title: "Valley of Flowers Hike", location: "Uttarakhand", event_date: "2026-03-20", imageUrl: "/dummy/valley-of-flowers.png", description: "Hike through the UNESCO World Heritage Site filled with rare alpine flowers.", isDummy: true, college_name: null },
  { id: "dummy-feat-4", title: "Ladakh Road Trip", location: "Leh, Ladakh", event_date: "2026-04-05", imageUrl: "/dummy/ladakh-road-trip.png", description: "An epic road trip through the high-altitude passes and monasteries of Ladakh.", isDummy: true, college_name: null },
  { id: "dummy-feat-5", title: "Rishikesh River Rafting", location: "Rishikesh, Uttarakhand", event_date: "2026-05-12", imageUrl: "/dummy/rishikesh-rafting.png", description: "Conquer the rapids of the Ganges in this thrilling white-water rafting adventure.", isDummy: true, college_name: null },
  { id: "dummy-feat-6", title: "Meghalaya Cave Expedition", location: "Meghalaya", event_date: "2026-06-03", imageUrl: "/dummy/meghalaya-caves.png", description: "Explore the fascinating limestone caves and living root bridges of Meghalaya.", isDummy: true, college_name: null },
];

export const DUMMY_EVENTS = [
  { id: "dummy-evt-1", title: "Annual Hackathon 2026", location: "College Auditorium", event_date: "2026-03-01", image_url: "/dummy/hackathon.png", description: "A 48-hour coding marathon. Build, innovate, and win exciting prizes!", isDummy: true, college_name: null, created_at: "2026-01-01T00:00:00Z" },
  { id: "dummy-evt-2", title: "Cultural Fest \"Utsav\"", location: "Main Ground", event_date: "2026-03-15", image_url: "/dummy/cultural-fest.png", description: "Experience a night of music, dance, and vibrant cultural performances.", isDummy: true, college_name: null, created_at: "2026-01-01T00:00:00Z" },
  { id: "dummy-evt-3", title: "Technical Symposium", location: "Seminar Hall", event_date: "2026-04-10", image_url: "/dummy/tech-symposium.png", description: "Engage with industry experts and present your research papers.", isDummy: true, college_name: null, created_at: "2026-01-01T00:00:00Z" },
  { id: "dummy-evt-4", title: "Sports Meet 2026", location: "Sports Complex", event_date: "2026-04-20", image_url: "/dummy/sports-meet.png", description: "Inter-college athletics and team sports competitions.", isDummy: true, college_name: null, created_at: "2026-01-01T00:00:00Z" },
  { id: "dummy-evt-5", title: "Photography Workshop", location: "Art Block", event_date: "2026-05-05", image_url: "/dummy/photo-workshop.png", description: "Learn the art of framing and lighting from professional photographers.", isDummy: true, college_name: null, created_at: "2026-01-01T00:00:00Z" },
  { id: "dummy-evt-6", title: "Career Fair 2026", location: "Conference Hall", event_date: "2026-05-22", image_url: "/dummy/career-fair.png", description: "Meet top recruiters and explore internship and job opportunities.", isDummy: true, college_name: null, created_at: "2026-01-01T00:00:00Z" },
];

export const DUMMY_RECOVER = [
  { id: "dummy-rec-1", title: "Blue Water Bottle", where_found: "Found near Cafeteria", image_url: "/dummy/lost-waterbottle.png", isDummy: true, college_name: null, type: "found", date_lost: "2026-08-01T10:00:00Z" },
  { id: "dummy-rec-2", title: "Black Wallet", where_found: "Found in Library", image_url: "/dummy/lost-wallet.png", isDummy: true, college_name: null, type: "found", date_lost: "2026-08-01T11:00:00Z" },
  { id: "dummy-rec-3", title: "Dell Laptop Bag", where_found: "Found at Parking", image_url: "/dummy/lost-laptop-bag.png", isDummy: true, college_name: null, type: "found", date_lost: "2026-08-02T09:30:00Z" },
  { id: "dummy-rec-4", title: "Sony Earphones", where_found: "Found in Seminar Hall", image_url: "/dummy/lost-earphones.png", isDummy: true, college_name: null, type: "found", date_lost: "2026-08-02T14:15:00Z" },
  { id: "dummy-rec-5", title: "Student ID Card (Rahul)", where_found: "Found at Main Gate", image_url: "/dummy/lost-id-card.png", isDummy: true, college_name: null, type: "found", date_lost: "2026-08-03T08:45:00Z" },
  { id: "dummy-rec-6", title: "Bunch of Keys", where_found: "Found near Hostel Block", image_url: "/dummy/lost-keys.png", isDummy: true, college_name: null, type: "found", date_lost: "2026-08-03T16:20:00Z" },
];

export const DUMMY_NOTES = [
  { id: "dummy-note-1", title: "Engineering Mathematics — Unit 1 Notes", course: "B.Tech", sub_course: "Engineering Mathematics", semester: "1", isDummy: true, file_url: null, college_name: null },
  { id: "dummy-note-2", title: "Data Structures — Trees & Graphs", course: "BCA", sub_course: "Data Structures", semester: "3", isDummy: true, file_url: null, college_name: null },
  { id: "dummy-note-3", title: "Digital Electronics — Logic Gates", course: "B.Tech", sub_course: "Electronics", semester: "2", isDummy: true, file_url: null, college_name: null },
  { id: "dummy-note-4", title: "Operating Systems — CPU Scheduling", course: "B.Tech", sub_course: "OS", semester: "4", isDummy: true, file_url: null, college_name: null },
  { id: "dummy-note-5", title: "DBMS — Normalization Rules", course: "BCA", sub_course: "DBMS", semester: "4", isDummy: true, file_url: null, college_name: null },
  { id: "dummy-note-6", title: "Computer Networks — OSI Model", course: "B.Tech", sub_course: "Networks", semester: "5", isDummy: true, file_url: null, college_name: null },
];

export const DUMMY_SERVICES = [
  { id: "dummy-srv-1", title: "Python Lab File", category: "Python / Coding", price_basic: 199, expert_name: "Priya Verma", expert_verified: "approved", avg_rating: 5.0, review_count: 12, delivery_method: "Digital PDF", delivery_days: 1, availability: "Available", isDummy: true, college_name: null, portfolio_urls: ["/dummy/service-generic.png"] },
  { id: "dummy-srv-2", title: "Complete EG Portfolio", category: "Engineering Graphics", price_basic: 499, expert_name: "Rahul Sharma", expert_verified: "approved", avg_rating: 4.9, review_count: 8, delivery_method: "Digital PDF", delivery_days: 2, availability: "Available", isDummy: true, college_name: null, portfolio_urls: ["/dummy/service-generic.png"] },
  { id: "dummy-srv-3", title: "Hardware Circuit Assembly", category: "Hardware & Circuits", price_basic: 349, expert_name: "Arjun Mehta", expert_verified: "approved", avg_rating: 4.9, review_count: 5, delivery_method: "Digital PDF", delivery_days: 3, availability: "Available", isDummy: true, college_name: null, portfolio_urls: ["/dummy/service-generic.png"] },
  { id: "dummy-srv-4", title: "Full Semester Lab Manual Writing", category: "Lab Files", price_basic: 799, expert_name: "Sanya Gupta", expert_verified: "approved", avg_rating: 4.8, review_count: 15, delivery_method: "Digital PDF", delivery_days: 5, availability: "Available", isDummy: true, college_name: null, portfolio_urls: ["/dummy/service-generic.png"] },
];

export const DUMMY_TEAMS = [
  { id: "dummy-team-1", name: "AI Innovators", team_code: "TEAM101", description: "Building a scalable AI solution for healthcare.", looking_for_role: "Frontend Dev", isDummy: true, college_name: null, created_by: "seed_expert_1", contact_info: "expert1@example.com", created_at: "2026-05-10" },
  { id: "dummy-team-2", name: "CyberSec Squad", team_code: "TEAM102", description: "Participating in national Capture The Flag events.", looking_for_role: "Security Analyst", isDummy: true, college_name: null, created_by: "seed_expert_2", contact_info: "expert2@example.com", created_at: "2026-05-12" },
  { id: "dummy-team-3", name: "Robotics Club", team_code: "TEAM103", description: "Designing an autonomous robot for the tech fest.", looking_for_role: "Hardware Engineer", isDummy: true, college_name: null, created_by: "seed_expert_3", contact_info: "expert3@example.com", created_at: "2026-05-15" },
];



export function mergeWithDummies<T extends { isDummy?: boolean }>(
  real: T[],
  dummies: T[],
  cap: number = 6
): T[] {
  if (real.length >= cap) return real.slice(0, cap);
  return [...real, ...dummies].slice(0, cap);
}
