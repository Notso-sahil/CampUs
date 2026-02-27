-- Seed Events
INSERT INTO public.events (title, description, event_date, location, college_name, created_by) VALUES
('Tech Symposium 2026', 'Annual technology conference featuring keynote speakers from leading tech companies. Workshops on AI, Blockchain, and IoT.', '2026-03-15 10:00:00+05:30', 'VIPS Auditorium, Block A', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Cultural Fest — Harmony', 'Three-day cultural extravaganza with music, dance, drama, and art exhibitions.', '2026-04-05 09:00:00+05:30', 'VIPS Open Ground', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Startup Pitch Night', 'Present your startup idea to a panel of investors and mentors. Cash prizes for top 3 pitches.', '2026-03-22 18:00:00+05:30', 'Seminar Hall, Block C', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Coding Marathon — HackVIPS', '24-hour hackathon open to all branches. Build, ship, and demo.', '2026-04-12 08:00:00+05:30', 'Computer Lab, Block B', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Guest Lecture: Future of Work', 'Industry expert discusses emerging career paths and the future workplace.', '2026-03-28 14:00:00+05:30', 'Room 201, Block A', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Sports Day 2026', 'Inter-department athletics, cricket, and football tournaments.', '2026-04-20 07:30:00+05:30', 'VIPS Sports Complex', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe');

-- Seed Recover Items
INSERT INTO public.recover_items (title, description, where_found, where_currently, contact_info, date_lost, college_name, created_by) VALUES
('Blue Water Bottle', 'Milton 750ml blue bottle with a dent on the cap. Has a sticker of a cat.', 'Library 2nd Floor', 'Security Office, Gate 1', '9876543210', '2026-02-20', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Scientific Calculator', 'Casio fx-991EX. Found in exam hall after Maths paper.', 'Room 302, Block B', 'Admin Office', '9123456789', '2026-02-22', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Keys with Red Keychain', 'Set of 3 keys on a red leather keychain. Found near main entrance.', 'Near VIPS Main Gate', 'Security Office, Gate 1', '9988776655', '2026-02-24', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Black Umbrella', 'Large black umbrella, wooden handle. Left in canteen.', 'Canteen, Ground Floor', 'Lost & Found Counter', '9871234567', '2026-02-25', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Wired Earphones', 'White earphones with mic, found tangled around a bench.', 'Garden Area, Block C', 'Security Office, Gate 1', '9112233445', '2026-02-26', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Student ID Card', 'ID card belonging to enrollment number 2024VIPS1032. Found in washroom.', 'Washroom, Block A, Floor 3', 'Admin Office', '9009876543', '2026-02-18', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe');

-- Seed Knowledge Hub
INSERT INTO public.knowledge_hub (title, description, course, sub_course, semester, college_name, created_by) VALUES
('BBA Sem 1 — Economics Notes', 'Comprehensive notes covering micro and macro economics fundamentals.', 'BBA', NULL, 'Semester 1', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('BTECH CSE — Python Lab Manual', 'Complete lab manual with solved programs for Python programming.', 'BTECH', 'CSE', 'Semester 3', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('BTECH ECE — Signals & Systems', 'Handwritten notes with solved numericals for Signals & Systems.', 'BTECH', 'ECE', 'Semester 4', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('BCA — Database Management Notes', 'Theory + SQL queries with examples for DBMS.', 'BCA', NULL, 'Semester 3', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('BA English — Shakespeare Analysis', 'Detailed analysis of Hamlet, Macbeth, and The Tempest.', 'BA', NULL, 'Semester 2', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('BTECH CSE — Data Structures', 'Complete notes covering arrays, linked lists, trees, graphs, and sorting algorithms.', 'BTECH', 'CSE', 'Semester 3', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('BBA Sem 3 — Marketing Management', 'Notes on 4Ps, STP, consumer behaviour, and digital marketing basics.', 'BBA', NULL, 'Semester 3', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe');

-- Seed Expeditions
INSERT INTO public.expeditions (title, description, event_date, location, college_name, created_by) VALUES
('Weekend Trek to Rishikesh', 'Two-day adventure trek with river rafting and camping by the Ganges. Transport included.', '2026-03-29 06:00:00+05:30', 'Rishikesh, Uttarakhand', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Industrial Visit — Noida Tech Park', 'Visit leading IT companies and learn about real-world software development practices.', '2026-04-08 09:00:00+05:30', 'Sector 62, Noida', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Heritage Walk — Old Delhi', 'Guided walking tour through Chandni Chowk, Red Fort, and Jama Masjid.', '2026-03-16 08:00:00+05:30', 'Old Delhi', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Astronomy Night — Aravalli Hills', 'Stargazing expedition with professional telescopes. Learn constellations and astrophotography basics.', '2026-04-18 20:00:00+05:30', 'Aravalli Biodiversity Park, Gurugram', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Photography Expedition — Lodhi Garden', 'Capture Delhi''s heritage architecture with guided composition tips from a professional photographer.', '2026-03-23 07:00:00+05:30', 'Lodhi Garden, New Delhi', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe'),
('Manali Adventure Camp', 'Three-day camping trip with trekking, bonfire, and snow activities. All-inclusive package.', '2026-05-01 05:00:00+05:30', 'Manali, Himachal Pradesh', 'VIPS', '453188e8-a27d-417b-b583-da46cff773fe');