
-- ============================================
-- CampusHub: New tables for Events, Expeditions, Recover, Knowledge Hub, Upload Requests
-- ============================================

-- 1. Events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamp with time zone,
  location text,
  image_url text,
  created_by uuid,
  college_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins have full access to events" ON public.events FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Creators can update own events" ON public.events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete own events" ON public.events FOR DELETE USING (auth.uid() = created_by);

-- 2. Expeditions table
CREATE TABLE public.expeditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamp with time zone,
  location text,
  image_url text,
  created_by uuid,
  college_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Anyone can view expeditions" ON public.expeditions FOR SELECT USING (true);
CREATE POLICY "Admins have full access to expeditions" ON public.expeditions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Creators can update own expeditions" ON public.expeditions FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete own expeditions" ON public.expeditions FOR DELETE USING (auth.uid() = created_by);

-- 3. Recover items table (public insert for guests)
CREATE TABLE public.recover_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  where_found text NOT NULL,
  where_currently text NOT NULL,
  contact_info text NOT NULL,
  date_lost date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid,
  college_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Anyone can view recover items" ON public.recover_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert recover items" ON public.recover_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins have full access to recover items" ON public.recover_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Creators can update own recover items" ON public.recover_items FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete own recover items" ON public.recover_items FOR DELETE USING (auth.uid() = created_by);

-- 4. Knowledge Hub table (admin-only uploads)
CREATE TABLE public.knowledge_hub (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text,
  course text NOT NULL,
  sub_course text,
  semester text,
  created_by uuid,
  college_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Anyone can view knowledge hub" ON public.knowledge_hub FOR SELECT USING (true);
CREATE POLICY "Admins have full access to knowledge hub" ON public.knowledge_hub FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Upload requests table
CREATE TABLE public.upload_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_section text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Users can create upload requests" ON public.upload_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own requests" ON public.upload_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to upload requests" ON public.upload_requests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. Updated_at triggers
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expeditions_updated_at BEFORE UPDATE ON public.expeditions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recover_items_updated_at BEFORE UPDATE ON public.recover_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_hub_updated_at BEFORE UPDATE ON public.knowledge_hub FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_upload_requests_updated_at BEFORE UPDATE ON public.upload_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('recover-images', 'recover-images', true);
CREATE POLICY "Anyone can upload recover images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recover-images');
CREATE POLICY "Anyone can view recover images" ON storage.objects FOR SELECT USING (bucket_id = 'recover-images');

INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge-files', 'knowledge-files', false);
CREATE POLICY "Admins can upload knowledge files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'knowledge-files' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Auth users can download knowledge files" ON storage.objects FOR SELECT USING (bucket_id = 'knowledge-files' AND auth.role() = 'authenticated');

-- 8. Seed data
INSERT INTO public.events (title, description, event_date, location, college_name) VALUES
  ('Annual Tech Fest 2026', 'The biggest tech festival in Delhi-NCR featuring hackathons, workshops, and keynotes from industry leaders.', '2026-03-15 10:00:00+05:30', 'VIPS Main Auditorium', 'VIPS'),
  ('Cultural Night', 'An evening of music, dance, and drama performances by students across departments.', '2026-03-20 18:00:00+05:30', 'VIPS Open Air Theatre', 'VIPS'),
  ('AI & ML Workshop', 'Hands-on workshop on building ML models with TensorFlow and PyTorch.', '2026-03-10 14:00:00+05:30', 'CS Lab 3', 'VIPS'),
  ('Startup Pitch Day', 'Students pitch their startup ideas to a panel of real investors and mentors.', '2026-04-01 11:00:00+05:30', 'Conference Hall B', 'VIPS'),
  ('Sports Meet 2026', 'Inter-college sports tournament featuring cricket, basketball, and athletics.', '2026-04-05 08:00:00+05:30', 'VIPS Sports Ground', 'VIPS'),
  ('Photography Exhibition', 'Showcase of student photography from across Delhi-NCR colleges.', '2026-03-25 10:00:00+05:30', 'Art Gallery Wing', 'DTU (Delhi Technological University)'),
  ('Debate Championship', 'Annual inter-college debate competition on current affairs.', '2026-04-10 09:00:00+05:30', 'Seminar Hall', 'IIIT Delhi');

INSERT INTO public.expeditions (title, description, event_date, location, college_name) VALUES
  ('Rishikesh Adventure Camp', 'White-water rafting, bungee jumping, and camping in Rishikesh.', '2026-04-15 06:00:00+05:30', 'Rishikesh, Uttarakhand', 'VIPS'),
  ('Jim Corbett Safari', 'Weekend wildlife safari at Jim Corbett National Park.', '2026-04-20 05:00:00+05:30', 'Jim Corbett, Uttarakhand', 'VIPS'),
  ('Manali Snow Trek', '3-day trekking expedition through the snow-capped Himalayas.', '2026-05-01 04:00:00+05:30', 'Manali, Himachal Pradesh', 'VIPS'),
  ('Heritage Walk – Old Delhi', 'Guided heritage walk through the lanes of Chandni Chowk and Red Fort.', '2026-03-22 07:00:00+05:30', 'Old Delhi', 'VIPS'),
  ('Camping at Pangot', 'Overnight camping and bird watching near Nainital.', '2026-04-28 06:00:00+05:30', 'Pangot, Uttarakhand', 'VIPS');

INSERT INTO public.recover_items (title, description, where_found, where_currently, contact_info, date_lost, college_name) VALUES
  ('Lost Keys (Honda)', 'Set of 3 keys with a Honda keychain.', 'VIPS Cafeteria', 'Security Office, Gate 1', 'Contact: 9876543210', '2026-02-20', 'VIPS'),
  ('Blue Water Bottle', 'Milton blue water bottle with name "Rahul" written on it.', 'Library 2nd Floor', 'Lost & Found Counter', 'WhatsApp: 9123456789', '2026-02-22', 'VIPS'),
  ('Black Umbrella', 'Large black umbrella left near main entrance.', 'Main Gate', 'Security Office', 'Call: 9988776655', '2026-02-24', 'VIPS'),
  ('Prescription Glasses', 'Black frame prescription glasses in a brown case.', 'CS Lab 2', 'Faculty Room, CS Dept', 'Email: found@vips.edu', '2026-02-23', 'VIPS'),
  ('Notebook (Physics)', 'Blue notebook with Physics notes for Semester 4.', 'Room 301', 'Reception Desk', 'Contact: 8765432109', '2026-02-25', 'VIPS'),
  ('AirPods Case', 'White AirPods charging case (no earbuds inside).', 'Canteen Area', 'Admin Office', 'WhatsApp: 7654321098', '2026-02-19', 'DTU (Delhi Technological University)');

INSERT INTO public.knowledge_hub (title, description, course, sub_course, semester, college_name) VALUES
  ('Data Structures & Algorithms Notes', 'Comprehensive notes covering arrays, trees, graphs, and DP.', 'BTECH', 'CSE', 'Semester 3', 'VIPS'),
  ('Machine Learning Lab Manual', 'Step-by-step lab exercises for ML using Python.', 'BTECH', 'AIML', 'Semester 5', 'VIPS'),
  ('Business Law Textbook Summary', 'Chapter-wise summary of Business Law for BBA students.', 'BBA', NULL, 'Semester 2', 'VIPS'),
  ('Constitutional Law Case Studies', 'Important case studies for BALLB students.', 'BALLB', NULL, 'Semester 4', 'VIPS'),
  ('Digital Marketing Notes', 'Complete notes on SEO, SEM, and Social Media Marketing.', 'BAJMC', NULL, 'Semester 6', 'VIPS'),
  ('IoT Project Report Template', 'Standard project report template for IoT capstone.', 'BTECH', 'IOT', 'Semester 7', 'VIPS'),
  ('DBMS Previous Year Papers', '5 years of previous exam papers with solutions.', 'BTECH', 'CSE', 'Semester 4', 'VIPS'),
  ('Financial Accounting Formulas', 'Quick reference sheet for all accounting formulas.', 'MBA', NULL, 'Semester 1', 'VIPS'),
  ('MCA Java Programming Notes', 'Core Java and OOP concepts with code examples.', 'MCA', NULL, 'Semester 2', 'VIPS'),
  ('VLSI Design Fundamentals', 'Introduction to VLSI design flow and tools.', 'BTECH', 'VLSI', 'Semester 6', 'VIPS');
