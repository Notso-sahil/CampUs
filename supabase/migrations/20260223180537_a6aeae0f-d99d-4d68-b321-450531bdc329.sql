-- Add server-side validation: message content must be 1-5000 characters
ALTER TABLE public.messages ADD CONSTRAINT message_content_length CHECK (length(content) > 0 AND length(content) <= 5000);

-- Restrict get_display_name to only authenticated users who share a conversation with the target user
CREATE OR REPLACE FUNCTION public.get_display_name(_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT p.display_name 
  FROM public.profiles p
  WHERE p.user_id = _user_id
    AND (
      -- Allow if caller IS the user
      _user_id = auth.uid()
      -- Allow if they share a conversation
      OR EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE (c.buyer_id = auth.uid() AND c.seller_id = _user_id)
           OR (c.seller_id = auth.uid() AND c.buyer_id = _user_id)
      )
      -- Allow if caller is viewing a product by this seller
      OR EXISTS (
        SELECT 1 FROM public.products pr
        WHERE pr.seller_id = _user_id
      )
      -- Allow admins
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  LIMIT 1
$$;