-- Fix: Users can delete own messages (privacy)
CREATE POLICY "Senders can delete own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id);

-- Fix: Users can delete own profile (GDPR compliance)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Fix: Participants can delete conversations
CREATE POLICY "Participants can delete conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);