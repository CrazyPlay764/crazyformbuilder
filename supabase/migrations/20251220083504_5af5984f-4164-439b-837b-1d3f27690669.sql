-- Add unique constraint on display_name (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_display_name_unique 
ON public.profiles (LOWER(display_name)) 
WHERE display_name IS NOT NULL;

-- Create a function to check if display name is taken
CREATE OR REPLACE FUNCTION public.is_display_name_taken(name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(display_name) = LOWER(name)
  )
$$;