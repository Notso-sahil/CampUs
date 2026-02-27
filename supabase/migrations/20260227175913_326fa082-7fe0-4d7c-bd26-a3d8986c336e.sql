-- 1. RECOVER_ITEMS: Restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view recover items" ON public.recover_items;

CREATE POLICY "Authenticated users can view recover items"
ON public.recover_items
FOR SELECT
TO authenticated
USING (true);

-- 2. EVENTS: Add INSERT policy for authenticated users
CREATE POLICY "Auth users can insert events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- 3. EXPEDITIONS: Add INSERT policy for authenticated users
CREATE POLICY "Auth users can insert expeditions"
ON public.expeditions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);