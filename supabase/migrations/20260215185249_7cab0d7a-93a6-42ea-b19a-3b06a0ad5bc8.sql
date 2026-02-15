
-- Create a security definer function to get a user's display name
-- This bypasses RLS safely since it only returns the display_name
CREATE OR REPLACE FUNCTION public.get_display_name(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT display_name FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;
