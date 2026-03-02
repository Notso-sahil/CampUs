
-- Add a type column to recover_items to distinguish lost vs found
ALTER TABLE public.recover_items
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'found';

-- Make where_found and where_currently nullable since "lost" items won't have these
ALTER TABLE public.recover_items
ALTER COLUMN where_found DROP NOT NULL,
ALTER COLUMN where_currently DROP NOT NULL;
