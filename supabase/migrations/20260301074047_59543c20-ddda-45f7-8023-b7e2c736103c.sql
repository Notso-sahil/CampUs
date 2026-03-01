
-- Teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  team_code text NOT NULL UNIQUE DEFAULT substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8),
  leader_id uuid NOT NULL,
  college_name text,
  looking_for_role text,
  looking_for_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'Member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Team join requests table
CREATE TABLE public.team_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Updated_at triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_requests_updated_at BEFORE UPDATE ON public.team_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Auth users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Leaders can update own teams" ON public.teams FOR UPDATE USING (auth.uid() = leader_id);
CREATE POLICY "Leaders can delete own teams" ON public.teams FOR DELETE USING (auth.uid() = leader_id);
CREATE POLICY "Admins full access teams" ON public.teams FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS: team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Team leaders can add members" ON public.team_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
  OR auth.uid() = user_id
);
CREATE POLICY "Team leaders can remove members" ON public.team_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
  OR auth.uid() = user_id
);
CREATE POLICY "Team leaders can update member roles" ON public.team_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
);
CREATE POLICY "Admins full access team_members" ON public.team_members FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS: team_requests
ALTER TABLE public.team_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.team_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Team leaders can view requests" ON public.team_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
);
CREATE POLICY "Auth users can create requests" ON public.team_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Team leaders can update requests" ON public.team_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
);
CREATE POLICY "Users can delete own requests" ON public.team_requests FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access team_requests" ON public.team_requests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
