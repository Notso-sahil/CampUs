
-- Team messages table for team chat
CREATE TABLE public.team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- Only team members can read messages
CREATE POLICY "Team members can view messages"
  ON public.team_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_messages.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- Only team members can send messages
CREATE POLICY "Team members can send messages"
  ON public.team_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_messages.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- Senders can delete own messages
CREATE POLICY "Senders can delete own messages"
  ON public.team_messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

-- Admin full access
CREATE POLICY "Admins full access team_messages"
  ON public.team_messages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin feedback table
CREATE TABLE public.admin_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback
CREATE POLICY "Anyone can submit feedback"
  ON public.admin_feedback FOR INSERT
  WITH CHECK (true);

-- Only admins can view feedback
CREATE POLICY "Admins can view feedback"
  ON public.admin_feedback FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins full access
CREATE POLICY "Admins full access feedback"
  ON public.admin_feedback FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add phone_number to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;
