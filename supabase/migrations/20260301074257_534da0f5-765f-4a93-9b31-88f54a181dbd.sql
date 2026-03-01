
-- Temporarily disable RLS on teams to insert sample data
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;

INSERT INTO public.teams (name, description, leader_id, college_name, looking_for_role, looking_for_description, team_code) VALUES
('AI Innovators', 'Building next-gen AI solutions for campus problems. We focus on computer vision and NLP projects.', '00000000-0000-0000-0000-000000000001', 'VIPS', 'ML Engineer', 'Experience with PyTorch or TensorFlow preferred. Must be comfortable with data preprocessing.', 'AIINOV01'),
('Fintech Wizards', 'Creating student-friendly financial tools. UPI integration, budget trackers, and more.', '00000000-0000-0000-0000-000000000002', 'VIPS', 'Backend Developer', 'Node.js or Python experience. Familiarity with payment APIs is a plus.', 'FINWIZ02'),
('Green Campus', 'IoT-based sustainability solutions for our campus. Smart waste, energy monitoring.', '00000000-0000-0000-0000-000000000003', 'VIPS', 'IoT/Hardware Engineer', 'Arduino or Raspberry Pi experience. Interest in environmental tech.', 'GREEN03'),
('Design Mavericks', 'UI/UX focused team. We prototype, test, and build beautiful interfaces.', '00000000-0000-0000-0000-000000000004', 'VIPS', 'Frontend Developer', 'React or Flutter. Figma proficiency is a bonus.', 'DSNMAV04'),
('CyberShield', 'Cybersecurity enthusiasts building ethical hacking tools and CTF solutions.', '00000000-0000-0000-0000-000000000005', 'VIPS', 'Security Analyst', 'Knowledge of OWASP, Burp Suite, or Wireshark. CTF experience preferred.', 'CYBER05'),
('HealthTech Hub', 'Developing accessible health monitoring apps for students and faculty.', '00000000-0000-0000-0000-000000000006', 'VIPS', 'Mobile Developer', 'React Native or Flutter. Interest in health-tech and wearable APIs.', 'HLTH06'),
('Blockchain Builders', 'Exploring decentralized solutions for academic credential verification.', '00000000-0000-0000-0000-000000000007', 'VIPS', 'Smart Contract Developer', 'Solidity or Rust. Understanding of Web3 concepts and DApps.', 'BLKCH07');

-- Re-enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
